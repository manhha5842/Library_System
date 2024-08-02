package com.library.Repository;

import com.library.Model.BorrowRecord;
import com.library.Model.Enum.ReturnRecordStatus;
import com.library.Model.Librarian;
import com.library.Model.ReturnRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnRecordRepository extends JpaRepository<ReturnRecord, Integer> {


    List<ReturnRecord> findByBorrowRecord(BorrowRecord borrowRecord);

    List<ReturnRecord> findByLibrarian(Librarian librarian);

    List<ReturnRecord> findByStatus(String status);
    boolean existsByBookIdAndStatus(Long bookId, ReturnRecordStatus status);
}
