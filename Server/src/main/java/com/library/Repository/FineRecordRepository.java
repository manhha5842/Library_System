package com.library.Repository;

import com.library.Model.BorrowRecord;
import com.library.Model.Enum.FineRecordStatus;
import com.library.Model.Enum.Reason;
import com.library.Model.FineRecord;
import com.library.Model.Librarian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FineRecordRepository extends JpaRepository<FineRecord, Integer> {
    List<FineRecord> findByBorrowRecord(BorrowRecord borrowRecord);

    List<FineRecord> findByFineReasonInAndStatus(List<Reason> reasons, FineRecordStatus status);

    List<FineRecord> findByLibrarian(Librarian librarian);

    List<FineRecord> findByStatus(FineRecordStatus status);
    boolean existsByBookIdAndStatus(Long bookId, FineRecordStatus status);
}
