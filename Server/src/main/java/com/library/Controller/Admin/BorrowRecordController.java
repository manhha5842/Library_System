package com.library.Controller.Admin;

import com.library.DTO.BookConditionDTO;
import com.library.DTO.BorrowRecordUpdateRequest;
import com.library.Model.*;
import com.library.Model.Enum.*;
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
@RequestMapping("/borrowRecords")
public class BorrowRecordController {
    private static final Logger logger = LoggerFactory.getLogger(GlobalControllerAdvice.class);
    private final BorrowRecordService borrowRecordService;
    private final StudentService studentService;
    private final BookService bookService;
    private final ReturnRecordService returnRecordService;
    private final LibrarianService librarianService;
    private final HistoryRecordService historyRecordService;
    private final FineRecordService fineRecordService;
    private final CopyService copyService;

    @Autowired
    public BorrowRecordController(BorrowRecordService borrowRecordService, StudentService studentService, BookService bookService, ReturnRecordService returnRecordService, LibrarianService librarianService, HistoryRecordService historyRecordService, FineRecordService fineRecordService, CopyService copyService) {
        this.borrowRecordService = borrowRecordService;
        this.studentService = studentService;
        this.bookService = bookService;
        this.returnRecordService = returnRecordService;
        this.librarianService = librarianService;
        this.historyRecordService = historyRecordService;
        this.fineRecordService = fineRecordService;
        this.copyService = copyService;
    }

    @GetMapping("")
    public String borrowRecords(Model model) {
        List<BorrowRecord> borrowRecordList = borrowRecordService.getAllBorrowRecords();
        model.addAttribute("pageTitle", "Yêu cầu mượn sách");
        model.addAttribute("borrowRecordList", borrowRecordList);
        return "borrowRecords";
    }

    @GetMapping("/{id}")
    public String borrowRecord(@PathVariable("id") long id, Model model) {

        BorrowRecord result = borrowRecordService.getBorrowRecordById(id)
                .orElseThrow(() -> new IllegalArgumentException("Borrow Record not found with id: " + id));
        boolean isAnyBookNotReturnYet = !result.getReturnRecords()
                .stream()
                .filter(returnRecord -> returnRecord.getStatus() == ReturnRecordStatus.PENDING)
                .toList().isEmpty();
        model.addAttribute("conditions", BookCondition.values());
        model.addAttribute("isAnyBookNotReturnYet",isAnyBookNotReturnYet);
        model.addAttribute("borrowRecord", result);
        model.addAttribute("pageTitle", "Đơn mượn sách " + result.getId());
        return "borrowRecord";
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
        List<BookConditionDTO> books = request.getBooks();
        logger.info(status);
        BorrowRecord borrowRecord = borrowRecordService.getBorrowRecordById(id)
                .orElseThrow(() -> new IllegalArgumentException("Borrow Record not found with id: " + id));

        BorrowRecordStatus newStatus = BorrowRecordStatus.valueOf(status);
        try {
            if (newStatus == BorrowRecordStatus.BORROWED) {
                for (Book book : borrowRecord.getBooks()) {
                    ReturnRecord returnRecord = borrowRecord.getReturnRecords().stream()
                            .filter(rr -> rr.getBook().getId() == (book.getId()))
                            .findFirst()
                            .orElse(new ReturnRecord());
                    returnRecord.setBorrowRecord(borrowRecord);
                    returnRecord.setBook(book);
                    returnRecord.setStatus(ReturnRecordStatus.PENDING);
                    returnRecordService.saveOrUpdateReturnRecord(returnRecord);
                }
                borrowRecord.setLibrarian(currentLibrarian);
                borrowRecord.setStatus(newStatus);
                borrowRecordService.saveOrUpdateBorrowRecord(borrowRecord);
                historyRecordService.saveHistory(borrowRecord, "Bàn giao sách", currentLibrarian.getName());
            } else if (newStatus == BorrowRecordStatus.RETURN_PENDING && books != null) {
                for (BookConditionDTO bookCondition : books) {
                    //Lấy dữ liệu sách
                    Book book = bookService.getBookById(bookCondition.getBookId())
                            .orElseThrow(() -> new IllegalArgumentException("Book not found with id: " + bookCondition.getBookId()));

                    //Lấy đơn trả
                    ReturnRecord returnRecord = borrowRecord.getReturnRecords().stream()
                            .filter(rr -> rr.getBook().getId() == (bookCondition.getBookId()))
                            .findFirst()
                            .orElseThrow(() -> new IllegalArgumentException("Return Record not found for book id: " + bookCondition.getBookId()));
                    returnRecord.setLibrarian(currentLibrarian);
                    //nếu không có sách nào hư
                    if (BookCondition.valueOf(bookCondition.getCondition()).equals(BookCondition.GOOD)) {
                        returnRecord.setStatus(ReturnRecordStatus.RETURNED);
                        returnRecordService.saveOrUpdateReturnRecord(returnRecord);
                        historyRecordService.saveHistory(borrowRecord, "Xác nhận sinh viên trả sách " + book.getTitle(), currentLibrarian.getName());

                        System.out.println("haha");
                    } else {
                        // Lưu fine record
                        FineRecord fineRecord = new FineRecord();
                        fineRecord.setBorrowRecord(borrowRecord);
                        fineRecord.setBook(book);
                        fineRecord.setStatus(FineRecordStatus.PENDING);
                        switch (BookCondition.valueOf(bookCondition.getCondition())) {
                            case LOST -> {
                                returnRecord.setStatus(ReturnRecordStatus.LOST);
                                historyRecordService.saveHistory(borrowRecord,
                                        "Xác nhận sách bị mất: " + book.getTitle(),
                                        currentLibrarian.getName());
                                fineRecord.setFineReason(Reason.LOST);
                                historyRecordService.saveHistory(borrowRecord,
                                        "Tạo đơn phạt với lí do sinh viên làm mất sách",
                                        currentLibrarian.getName());
                            }
                            case DAMAGED_MINOR -> {
                                returnRecord.setStatus(ReturnRecordStatus.DAMAGED);
                                historyRecordService.saveHistory(borrowRecord,
                                        "Xác nhận sách bị hư hỏng: " + book.getTitle(),
                                        currentLibrarian.getName());
                                fineRecord.setFineReason(Reason.DAMAGED_MAJOR);
                                historyRecordService.saveHistory(borrowRecord,
                                        "Tạo đơn phạt với lí do sinh viên hỏng sách mức độ nặng",
                                        currentLibrarian.getName());
                            }
                            case DAMAGED_MAJOR -> {
                                returnRecord.setStatus(ReturnRecordStatus.DAMAGED);
                                historyRecordService.saveHistory(borrowRecord,
                                        "Xác nhận sách bị hư hỏng: " + book.getTitle(),
                                        currentLibrarian.getName());
                                fineRecord.setFineReason(Reason.DAMAGED_MINOR);
                                historyRecordService.saveHistory(borrowRecord,
                                        "Tạo đơn phạt với lí do sinh viên hỏng sách mức độ nhẹ",
                                        currentLibrarian.getName());
                            }
                        }

                        returnRecordService.saveOrUpdateReturnRecord(returnRecord);
                        fineRecordService.saveOrUpdateFineRecord(fineRecord);
                    }

                }
                // Kiểm tra nếu tất cả các sách đều đã được trả
                boolean allBooksReturned = borrowRecord.getReturnRecords().stream()
                        .allMatch(returnRecord -> returnRecord.getStatus() == ReturnRecordStatus.RETURNED);
                if (allBooksReturned) {

                    borrowRecord.setStatus(BorrowRecordStatus.COMPLETED);
                    borrowRecordService.saveOrUpdateBorrowRecord(borrowRecord);
                    historyRecordService.saveHistory(borrowRecord, "Hoàn thành đơn", currentLibrarian.getName());
                } else {
                    borrowRecord.setStatus(BorrowRecordStatus.RETURN_PENDING);
                    borrowRecordService.saveOrUpdateBorrowRecord(borrowRecord);
                }
            } else if (newStatus == BorrowRecordStatus.CANCELLED && borrowRecord.getStatus() == BorrowRecordStatus.PENDING) {
                borrowRecord.setCancelReason(request.getCancelReason());
                borrowRecord.setStatus(newStatus);
                borrowRecordService.saveOrUpdateBorrowRecord(borrowRecord);
                historyRecordService.saveHistory(borrowRecord, "Huỷ đơn", currentLibrarian.getName());
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            throw new Exception(e.getMessage());

        }


    }

}