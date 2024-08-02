package com.library.Service;

import com.library.Model.Book;
import com.library.Model.Category;
import com.library.Model.Enum.StudentStatus;
import com.library.Model.Major;
import com.library.Model.Student;
import com.library.Repository.MajorRepository;
import com.library.Repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class StudentService {
    @Autowired
    private final StudentRepository studentRepository;
    @Autowired
    private final MajorRepository majorRepository;

    @Autowired
    public StudentService(StudentRepository studentRepository, MajorRepository majorRepository) {
        this.studentRepository = studentRepository;
        this.majorRepository = majorRepository;
    }

    // Lấy tất cả sinh viên
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // Lấy sinh viên theo ID
    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(Math.toIntExact(id));
    }

    // Lấy sinh viên theo email - Chưa xác định email trong class Student, cần thêm nếu cần
    public Optional<Student> getStudentByEmail(String email) {
        return studentRepository.findByEmail(email);
    }

    // Lấy danh sách sinh viên theo major
    public List<Student> getStudentsByMajor(Integer majorId) {
        Major major = majorRepository.findById(majorId)
                .orElseThrow(() -> new IllegalArgumentException("Major not found with id: " + majorId));
        return studentRepository.findByMajor(major);
    }

    // Lấy tất cả sách có major của student - Cần xác định rõ ràng mối quan hệ sách và major, giả định có method getBooksByMajor
    @Transactional(readOnly = true)
    public Set<Book> getBooksByStudentMajor(Long studentId) {
        Student student = studentRepository.findById(Math.toIntExact(studentId))
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));
        Set<Category> categories = student.getMajor().getCategories();
        Set<Book> books = new HashSet<>();

        for (Category category : categories) {
            books.addAll(category.getBooks()); // Giả sử rằng getBooks() đã được định nghĩa trong Category entity
        }

        return books;
    }

    // Cập nhật thông tin sinh viên
    @Transactional
    public Student saveOrUpdateStudent(Student student) {
        return studentRepository.save(student);
    }

    public Student updateExpoPushToken(Long studentId, String expoPushToken) {
        Optional<Student> studentOpt = studentRepository.findById(Math.toIntExact(studentId));

        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            student.setExpoPushToken(expoPushToken);
            return studentRepository.save(student);
        }
        return null;
    }

    // Xóa sinh viên (dùng Soft delete thông qua cập nhật trạng thái)
    @Transactional
    public Student updateStatus(Student student, StudentStatus status) {

        student.setStatus(status);
        return studentRepository.save(student);
    }
}