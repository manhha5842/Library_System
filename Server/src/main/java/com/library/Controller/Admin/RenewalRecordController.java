package com.library.Controller.Admin;

import com.library.Model.BorrowRecord;
import com.library.Model.Enum.RenewalRecordStatus;
import com.library.Model.Librarian;
import com.library.Model.RenewalRecord;
import com.library.Service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/renewalRecords")
public class RenewalRecordController {
    private static final Logger logger = LoggerFactory.getLogger(GlobalControllerAdvice.class);
    private final BorrowRecordService borrowRecordService;
    private final StudentService studentService;
    private final BookService bookService;
    private final ReturnRecordService returnRecordService;
    private final LibrarianService librarianService;
    private final HistoryRecordService historyRecordService;
    private final FineRecordService fineRecordService;
    private final CopyService copyService;
    private final FeedbackService feedbackService;
    private final RenewalRecordService renewalRecordService;

    @Autowired
    public RenewalRecordController(BorrowRecordService borrowRecordService, StudentService studentService, BookService bookService, ReturnRecordService returnRecordService, LibrarianService librarianService, HistoryRecordService historyRecordService, FineRecordService fineRecordService, CopyService copyService, FeedbackService feedbackService, RenewalRecordService renewalRecordService) {
        this.borrowRecordService = borrowRecordService;
        this.studentService = studentService;
        this.bookService = bookService;
        this.returnRecordService = returnRecordService;
        this.librarianService = librarianService;
        this.historyRecordService = historyRecordService;
        this.fineRecordService = fineRecordService;
        this.copyService = copyService;
        this.feedbackService = feedbackService;
        this.renewalRecordService = renewalRecordService;
    }


    @GetMapping("")
    public String renewalRecords(Model model) {
        List<RenewalRecord> renewalRecords = renewalRecordService.getAllRenewalRecordsOrderByStatusPendingFirst();
        model.addAttribute("pageTitle", "Đơn cầu gia hạn");
        model.addAttribute("renewalRecords", renewalRecords);
        return "renewalRecords";
    }

    @GetMapping("/{id}")
    public String renewalRecord(@PathVariable("id") long id, Model model) {
        BorrowRecord borrowRecord = borrowRecordService.getBorrowRecordById(id)
                .orElseThrow(() -> new IllegalArgumentException("Borrow Record not found with id: " + id));


        List<RenewalRecord> renewalRecords = borrowRecord.getRenewalRecords();
        model.addAttribute("renewalRecords", renewalRecords);
        model.addAttribute("borrowRecord", borrowRecord);
        model.addAttribute("pageTitle", "Yêu cầu gia hạn");
        return "renewalRecord";
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Void> updateFeedback(
            @PathVariable long id,
            @RequestBody String status) throws Exception {
        Librarian currentLibrarian = librarianService.getCurrentLibrarian();
//        Librarian(id=1, name=Nguyễn Vũ Mạnh Hà, email=20130243@st.hcmuaf.edu.vn, password=null, phone=0344558306, role=1, status=Hoạt động, renewalRecords=[], returnRecords=[])
//        Librarian currentLibrarian = new Librarian(1, "Nguyễn Vũ Mạnh Hà", "20130243@st.hcmuaf.edu.vn", null, "0344558306", 1, Status.ACTIVE, null, null);

        System.out.println(status);
        RenewalRecord renewalRecord = renewalRecordService.updateRenewalRecord(id, RenewalRecordStatus.valueOf(status), currentLibrarian);
        if (renewalRecord.getStatus().equals(RenewalRecordStatus.ACCEPTED)) {
            BorrowRecord borrowRecord = renewalRecord.getBorrowRecord();
            borrowRecord.setBorrowDate(renewalRecord.getRequestBorrowDate());
            borrowRecord.setDueDate(renewalRecord.getRequestDueDate());
            borrowRecordService.saveWithoutNotification(borrowRecord);
            historyRecordService.saveHistory(borrowRecord, "Gia hạn thời gian, thời gian nhận cũ: " + renewalRecord.getOriginalBorrowDate() +
                    ", thời gian trả cũ: " + renewalRecord.getOriginalDueDate() +
                    ", thời gian nhận mới: " + renewalRecord.getRequestBorrowDate() +
                    ", thời gian trả mới: " + renewalRecord.getRequestDueDate(), currentLibrarian.getName());
        }
        return ResponseEntity.noContent().build();
    }


}