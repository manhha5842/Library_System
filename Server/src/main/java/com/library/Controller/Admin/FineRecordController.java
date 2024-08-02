package com.library.Controller.Admin;

import com.library.DTO.BorrowAndFineRecordDTO;
import com.library.DTO.BorrowRecordUpdateRequest;
import com.library.DTO.FineRecordGroup;
import com.library.Model.BorrowRecord;
import com.library.Model.Enum.BorrowRecordStatus;
import com.library.Model.Enum.FineRecordStatus;
import com.library.Model.FineRecord;
import com.library.Model.Librarian;
import com.library.Service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/fineRecords")
public class FineRecordController {
    private static final Logger logger = LoggerFactory.getLogger(GlobalControllerAdvice.class);
    private final BookService bookService;
    private final BorrowRecordService borrowRecordService;
    private final FineRecordService fineRecordService;
    private final HistoryRecordService historyRecordService;
    private final LibrarianService librarianService;

    public FineRecordController(BookService bookService, BorrowRecordService bookRecordService, FineRecordService fineRecordService, HistoryRecordService historyRecordService, LibrarianService librarianService) {
        this.bookService = bookService;
        this.borrowRecordService = bookRecordService;
        this.fineRecordService = fineRecordService;
        this.historyRecordService = historyRecordService;
        this.librarianService = librarianService;
    }


    @GetMapping("")
    public String fineRecords(Model model) {
        List<BorrowAndFineRecordDTO> borrowAndFineRecords = borrowRecordService.getAllBorrowRecordsWithFineRecords()
                .stream()
                .map(BorrowRecord::transferToBorrowAndFineRecordDTO)
                .toList();

        model.addAttribute("borrowAndFineRecords", borrowAndFineRecords);
        model.addAttribute("pageTitle", "Phiếu phạt");
        return "fineRecords";
    }

    @GetMapping("/{id}")
    public String viewfineRecord(@PathVariable("id") long id, Model model) {
        BorrowRecord result = borrowRecordService.getBorrowRecordById(id)
                .orElseThrow(() -> new IllegalArgumentException("Borrow Record not found with id: " + id));
        float totalFineAmount = result.getFineRecords().stream()
                .map(FineRecord::getFineAmount)
                .reduce(0f, Float::sum);
        Map<String, List<FineRecord>> groupedFineRecords = result.getFineRecords().stream()
                .collect(Collectors.groupingBy(
                        fineRecord -> fineRecord.getFineReason().getDisplayName() + "-" + fineRecord.getFineAmount()
                ));
        boolean isPaid = result.getStatus().equals(BorrowRecordStatus.COMPLETED);
        List<FineRecordGroup> fineRecordGroups = groupedFineRecords.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("-");
                    String fineReasonDisplayName = parts[0];
                    double fineAmount = Double.parseDouble(parts[1]);
                    Long count = (long) entry.getValue().size();
                    return new FineRecordGroup(fineReasonDisplayName, fineAmount, count);
                })
                .collect(Collectors.toList());

        model.addAttribute("fineRecordGroups", fineRecordGroups);
        model.addAttribute("totalFineAmount", totalFineAmount);
        model.addAttribute("borrowRecord", result);
        model.addAttribute("isPaid", isPaid);
        model.addAttribute("pageTitle", "Đơn mượn sách " + result.getId());
        return "fineRecord";
    }


    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable long id,
            @RequestBody BorrowRecordUpdateRequest request) throws Exception {
        Librarian currentLibrarian = librarianService.getCurrentLibrarian();
//        Librarian(id=1, name=Nguyễn Vũ Mạnh Hà, email=20130243@st.hcmuaf.edu.vn, password=null, phone=0344558306, role=1, status=Hoạt động, renewalRecords=[], returnRecords=[])
//        Librarian currentLibrarian = new Librarian(1, "Nguyễn Vũ Mạnh Hà", "20130243@st.hcmuaf.edu.vn", null, "0344558306", 1, Status.ACTIVE, null, null);
        logger.info(currentLibrarian.transferToDTO().toString());
        String status = request.getStatus();


        BorrowRecord borrowRecord = borrowRecordService.getBorrowRecordById(id)
                .orElseThrow(() -> new IllegalArgumentException("Borrow Record not found with id: " + id));

        FineRecordStatus newStatus = FineRecordStatus.valueOf(status);
        try {
            if (newStatus == FineRecordStatus.PAID) {
                float amount = 0;
                for (FineRecord fineRecord : borrowRecord.getFineRecords()) {
                    fineRecord.setStatus(FineRecordStatus.PAID);
                    amount += fineRecord.getFineAmount();
                    fineRecord.setLibrarian(currentLibrarian);
                    fineRecordService.saveOrUpdateFineRecord(fineRecord);
                }

                historyRecordService.saveHistory(borrowRecord, "Thanh toán phiếu phạt của đơn mượn sách ", currentLibrarian.getName());
                if (amount > 0)
                    historyRecordService.saveHistory(borrowRecord, "Nhận tiền phạt " + amount, currentLibrarian.getName());

                System.out.println("complete");

                borrowRecord.setStatus(BorrowRecordStatus.COMPLETED);
                borrowRecordService.saveOrUpdateBorrowRecord(borrowRecord);
                historyRecordService.saveHistory(borrowRecord, "Đã hoàn thành" + borrowRecord.getId(), currentLibrarian.getName());
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            throw new Exception(e.getMessage());

        }


    }
}