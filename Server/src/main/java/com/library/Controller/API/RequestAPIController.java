package com.library.Controller.API;

import com.library.Controller.Admin.GlobalControllerAdvice;
import com.library.DTO.BookDTO;
import com.library.DTO.BorrowRecordInputDTO;
import com.library.DTO.RenewalRecordDTO;
import com.library.DTO.RenewalRequestDTO;
import com.library.Model.Book;
import com.library.Model.BorrowRecord;
import com.library.Model.Enum.BorrowRecordStatus;
import com.library.Model.RenewalRecord;
import com.library.Model.Student;
import com.library.Service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/request")
public class RequestAPIController {
    @Autowired
    private BookService bookService;
    @Autowired
    private CategoryService categoryService;
    @Autowired
    private HistoryRecordService historyRecordService;
    @Autowired
    private AuthorService authorService;
    @Autowired
    private StudentService studentService;
    @Autowired
    private BorrowRecordService borrowRecordService;
    @Autowired
    private CopyService copyService;

    private static final Logger logger = LoggerFactory.getLogger(GlobalControllerAdvice.class);
    @Autowired
    private RenewalRecordService renewalRecordService;

    @GetMapping("/getBorrowRecord/{id}")
    public ResponseEntity<?> getBorrowRecordById(@PathVariable("id") long id) {
        try {
            logger.info("đang lấy đơn mượn sách");
            BorrowRecord borrowRecord = borrowRecordService.getBorrowRecordById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Borrow record not found"));
            return ResponseEntity.ok(borrowRecord.transferToDTO());
        } catch (Exception e) {
            logger.error(e.toString());
            return ResponseEntity.notFound().build();
        }

    }
    @GetMapping("/renewalRecords")
    public List<RenewalRecordDTO> getAllRenewalRecords() {
        List<RenewalRecord> renewalRecords = renewalRecordService.getAllRenewalRecords();
        System.out.println("Size of renewalRecords: " + renewalRecords.size());
        return renewalRecords.stream()
                .map(RenewalRecord::transferToDTO)
                .collect(Collectors.toList());
    }
    @GetMapping("/getHistories")
    public ResponseEntity<?> getHistories(@PageableDefault(size = 10) Pageable pageable) {
        logger.info("Đang lấy lịch sử mượn sách");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Student auth) {
            Student student = studentService.getStudentByEmail(auth.getEmail())
                    .orElseThrow(() -> new IllegalStateException("Could not find student"));
            return ResponseEntity.ok(borrowRecordService.getBorrowRecordsByStudent(student, pageable)
                    .map(BorrowRecord::transferToShortDTO));
        } else {
            return ResponseEntity.notFound().build();
        }
    }



    @GetMapping("/getHistoriesByStatuses")
    public ResponseEntity<?> getHistoriesByStatuses(
            @RequestParam(value = "status", required = false) List<String> status,
            @PageableDefault(size = 10) Pageable pageable) {
        logger.info("Đang lấy lịch sử mượn sách bằng status");
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Student auth) {
                Student student = studentService.getStudentByEmail(auth.getEmail())
                        .orElseThrow(() -> new IllegalStateException("Could not find student"));

                Page<BorrowRecord> borrowRecords;
                if (status != null && !status.isEmpty()) {
                    borrowRecords = borrowRecordService.getBorrowRecordsByStudentAndStatuses(student, status, pageable);
                } else {
                    borrowRecords = borrowRecordService.getBorrowRecordsByStudent(student, pageable);
                }

                return ResponseEntity.ok(borrowRecords.map(BorrowRecord::transferToShortDTO));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException e) {
            System.out.println(e);
            return ResponseEntity.badRequest().body(null);
        }

    }
    @GetMapping("/getFineRecordHistories")
    public ResponseEntity<?> getFineRecordHistories(@PageableDefault(size = 10) Pageable pageable) {
        logger.info("Đang lấy lịch sử mượn sách và phiếu phạt");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Student auth) {
            Student student = studentService.getStudentByEmail(auth.getEmail())
                    .orElseThrow(() -> new IllegalStateException("Could not find student"));
            return ResponseEntity.ok(borrowRecordService.getBorrowRecordsAndFindRecordsByStudent(student, pageable)
                    .map(BorrowRecord::transferToBorrowRecordAndFineRecordViewDTO));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/getFineRecordHistoriesByStatuses")
    public ResponseEntity<?> getFineRecordHistoriesByStatuses(
            @RequestParam(value = "status", required = false) List<String> status,
            @PageableDefault(size = 10) Pageable pageable) {
        logger.info("Đang lấy lịch sử mượn sách và phiếu phạt bằng status");
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Student auth) {
                Student student = studentService.getStudentByEmail(auth.getEmail())
                        .orElseThrow(() -> new IllegalStateException("Could not find student"));

                Page<BorrowRecord> borrowRecords;
                if (status != null && !status.isEmpty()) {
                    borrowRecords = borrowRecordService.getBorrowRecordsAndFindRecordsByStudentAndStatuses(student, status, pageable);
                } else {
                    borrowRecords = borrowRecordService.getBorrowRecordsByStudent(student, pageable);
                }

                return ResponseEntity.ok(borrowRecords.map(BorrowRecord::transferToBorrowRecordAndFineRecordViewDTO));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException e) {
            System.out.println(e);
            return ResponseEntity.badRequest().body(null);
        }

    }
    @PostMapping("/createRenewalRecord")
    public ResponseEntity<?> createRenewalRecord(@RequestBody RenewalRequestDTO renewalRequestDTO) {
        try {
            logger.info(renewalRequestDTO.toString());
            RenewalRecord renewalRecord = renewalRecordService.createRenewalRecord(renewalRequestDTO);
            return ResponseEntity.ok(renewalRecord.transferToDTO());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/createBorrowRecord")
    public ResponseEntity<?> createBorrowRecord(@RequestBody BorrowRecordInputDTO borrowRecordInputDTO) {
        logger.info(borrowRecordInputDTO.toString());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Student auth) {
            try {
                Student student = studentService.getStudentByEmail(auth.getEmail())
                        .orElseThrow(() -> new IllegalArgumentException("Could not find student with email " + auth.getEmail()));

                BorrowRecord borrowRecord = new BorrowRecord();
                borrowRecord.setStudent(student);
                borrowRecord.setBorrowDate(Date.valueOf(borrowRecordInputDTO.getBorrowDate()));
                borrowRecord.setDueDate(Date.valueOf(borrowRecordInputDTO.getDueDate()));
                borrowRecord.setNote(borrowRecordInputDTO.getNote());
                borrowRecord.setStatus(BorrowRecordStatus.PENDING);

                List<Book> books = new ArrayList<>();
                for (BookDTO item : borrowRecordInputDTO.getBooks()) {
                    if (bookService.checkAvailability(Long.parseLong(item.getId()))) {
                        books.add(bookService.getBookById(Long.parseLong(item.getId()))
                                .orElseThrow(() -> new IllegalArgumentException("Book not found with id: " + item.getId())));
                    } else {
                        logger.info("Some books have already changed. Please check again.");
                        return ResponseEntity.badRequest().body("Some books have already changed. Please check again.");
                    }
                }
                borrowRecord.setBooks(books);

                BorrowRecord newBorrowRecord = borrowRecordService.saveOrUpdateBorrowRecord(borrowRecord);
                historyRecordService.saveHistory(newBorrowRecord, "Đơn mượn sách được tạo", borrowRecord.getStudent().getName());
                return ResponseEntity.ok(newBorrowRecord.transferToDTO());
            } catch (Exception e) {
                System.out.println(e.getMessage());
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        } else {
            logger.info("Not found student information");
            return ResponseEntity.notFound().build();
        }

    }

    @PutMapping("/cancel/{id}")
    public ResponseEntity<?> cancelBorrowRecord(@PathVariable Long id) {
        logger.info("Huỷ đơn " + id);
        try {
            BorrowRecord cancelledRecord = borrowRecordService.cancelBorrowRecord(id);
            return ResponseEntity.ok(cancelledRecord.transferToDTO());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
