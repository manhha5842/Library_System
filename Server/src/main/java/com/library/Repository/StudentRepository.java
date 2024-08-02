package com.library.Repository;

import com.library.Model.Major;
import com.library.Model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    Optional<Student> findByEmail(String email);
    List<Student> findByMajor(Major major);

    @Query("SELECT COUNT(DISTINCT br.student) FROM BorrowRecord br WHERE YEAR(br.borrowDate) = :year AND MONTH(br.borrowDate) = :month")
    long countStudentsBorrowingInMonth(int year, int month);


}