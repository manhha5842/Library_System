package com.library.Controller.Admin;

import com.library.Model.Enum.StudentStatus;
import com.library.Model.Librarian;
import com.library.Model.Student;
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
@RequestMapping("/students")
public class StudentController {
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
    public StudentController(BorrowRecordService borrowRecordService, StudentService studentService, BookService bookService, ReturnRecordService returnRecordService, LibrarianService librarianService, HistoryRecordService historyRecordService, FineRecordService fineRecordService, CopyService copyService, FeedbackService feedbackService, RenewalRecordService renewalRecordService) {
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
    public String student(Model model) {
        List<Student> students = studentService.getAllStudents();
        model.addAttribute("pageTitle", "Tài khoản sinh viên");
        model.addAttribute("students", students);
        return "studentAccounts";
    }

    @GetMapping("/{id}")
    public String renewalRecord(@PathVariable("id") long id, Model model) {
        Student student = studentService.getStudentById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + id));


        model.addAttribute("student", student);
        model.addAttribute("pageTitle", "Thông tin sinh viên");
        return "studentAccount";
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<?> updateStudent(
            @PathVariable long id,
            @RequestBody String status) throws Exception {

         Librarian currentLibrarian = librarianService.getCurrentLibrarian();
        // Librarian(id=1, name=Nguyễn Vũ Mạnh Hà, email=20130243@st.hcmuaf.edu.vn, password=null, phone=0344558306, role=1, status=Hoạt động, renewalRecords=[], returnRecords=[])
//        Librarian currentLibrarian = new Librarian(1, "Nguyễn Vũ Mạnh Hà", "20130243@st.hcmuaf.edu.vn", null, "0344558306", 1, Status.ACTIVE, null, null);

        Student student = studentService.getStudentById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + id));

        if (status != null && !status.isEmpty()) {
            student.setStatus(StudentStatus.valueOf(status.trim().toUpperCase()));
            studentService.saveOrUpdateStudent(student);
        }

        return ResponseEntity.noContent().build();
    }

}