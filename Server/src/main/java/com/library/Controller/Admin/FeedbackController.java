package com.library.Controller.Admin;

import com.library.DTO.FeedbackUpdateRequest;
import com.library.Model.Feedback;
import com.library.Model.Librarian;
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
@RequestMapping("/feedbacks")
public class FeedbackController {
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

    @Autowired
    public FeedbackController(BorrowRecordService borrowRecordService, StudentService studentService, BookService bookService, ReturnRecordService returnRecordService, LibrarianService librarianService, HistoryRecordService historyRecordService, FineRecordService fineRecordService, CopyService copyService, FeedbackService feedbackService) {
        this.borrowRecordService = borrowRecordService;
        this.studentService = studentService;
        this.bookService = bookService;
        this.returnRecordService = returnRecordService;
        this.librarianService = librarianService;
        this.historyRecordService = historyRecordService;
        this.fineRecordService = fineRecordService;
        this.copyService = copyService;
        this.feedbackService = feedbackService;
    }

    @GetMapping("")
    public String feedbacks(Model model) {
        List<Feedback> feedbackList = feedbackService.getAllFeedbacksOrderByCreatedAtDesc();
        model.addAttribute("pageTitle", "Đơn góp ý");
        model.addAttribute("feedbackList", feedbackList);
        return "feedbacks";
    }

    @GetMapping("/{id}")
    public String borrowRecord(@PathVariable("id") long id, Model model) {
        Feedback result = feedbackService.getFeedbackById(id)
                .orElseThrow(() -> new IllegalArgumentException("Borrow Record not found with id: " + id));

        model.addAttribute("feedback", result);
        model.addAttribute("pageTitle", "Đơn góp ý " + result.getId());
        return "feedback";
    }
    @PatchMapping("/{id}")
    public ResponseEntity<Void> updateFeedback(
            @PathVariable long id,
            @RequestBody FeedbackUpdateRequest request) throws Exception {
        Librarian currentLibrarian = librarianService.getCurrentLibrarian();
//        Librarian(id=1, name=Nguyễn Vũ Mạnh Hà, email=20130243@st.hcmuaf.edu.vn, password=null, phone=0344558306, role=1, status=Hoạt động, renewalRecords=[], returnRecords=[])
//        Librarian currentLibrarian = new Librarian(1, "Nguyễn Vũ Mạnh Hà", "20130243@st.hcmuaf.edu.vn", null, "0344558306", 1, Status.ACTIVE, null, null);

        feedbackService.updateFeedback(id, request,currentLibrarian);
        return ResponseEntity.noContent().build();
    }




}