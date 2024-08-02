package com.library.Repository;

import com.library.Model.HistoryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface HistoryRecordRepository extends JpaRepository<HistoryRecord, Long> {
    List<HistoryRecord> findByBorrowRecordId(Long borrowRecordId);
}