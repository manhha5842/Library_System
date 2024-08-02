package com.library.Repository;

import com.library.Model.BorrowRecord;
import com.library.Model.Enum.BorrowRecordStatus;
import com.library.Model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    Page<BorrowRecord> findByStudent(Student student, Pageable pageable);

    Page<BorrowRecord> findByStudentAndStatus(Student student, BorrowRecordStatus status, Pageable pageable);

    Page<BorrowRecord> findByStudentAndStatusIn(Student student, List<BorrowRecordStatus> statuses, Pageable pageable);

    List<BorrowRecord> findByStudentId(Long id);

    List<BorrowRecord> findByStatus(BorrowRecordStatus status);

    @EntityGraph(attributePaths = "returnRecords")
    @Query("SELECT br FROM BorrowRecord br WHERE br.id = :id")
    BorrowRecord findWithReturnRecordsById(@Param("id") Long id);

    List<BorrowRecord> findByStatusIn(List<BorrowRecordStatus> statuses);

    // Truy vấn JPQL để lấy BorrowRecord có fineRecords không rỗng
    @Query("SELECT br FROM BorrowRecord br WHERE br.fineRecords IS NOT EMPTY")
    List<BorrowRecord> findAllWithFineRecords();

    // Truy vấn JPQL để lấy BorrowRecord có renewalRecords không rỗng
    @Query("SELECT br FROM BorrowRecord br WHERE br.renewalRecords IS NOT EMPTY")
    List<BorrowRecord> findAllWithRenewalRecords();

    @Query("SELECT br FROM BorrowRecord br WHERE br.student = :student AND br.fineRecords IS NOT EMPTY")
    Page<BorrowRecord> findAllWithFineRecordsByStudent(@Param("student") Student student, Pageable pageable);

    @Query("SELECT br FROM BorrowRecord br WHERE br.student = :student AND br.fineRecords IS NOT EMPTY AND br.status IN :statuses")
    Page<BorrowRecord> findAllWithFineRecordsByStudentAndStatusIn(@Param("student") Student student, @Param("statuses") List<BorrowRecordStatus> statuses, Pageable pageable);


    @Query("SELECT br FROM BorrowRecord br WHERE YEAR(br.createdAt) = :year AND MONTH(br.createdAt) = :month")
    List<BorrowRecord> findAllByCreatedAtIn(int year, int month);

    @Query("SELECT YEAR(br.createdAt) AS year, MONTH(br.createdAt) AS month, COUNT(br) AS count FROM BorrowRecord br GROUP BY YEAR(br.createdAt), MONTH(br.createdAt)")
    List<Object[]> getMonthlyBorrowingStatistics();

    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE YEAR(br.createdAt) = :year AND MONTH(br.createdAt) = :month")
    long countBorrowRecordsInMonth(int year, int month);
}