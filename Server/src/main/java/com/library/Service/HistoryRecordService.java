package com.library.Service;

import com.library.DTO.HistoryRecordDTO;
import com.library.Model.BorrowRecord;
import com.library.Model.HistoryRecord;
import com.library.Repository.HistoryRecordRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HistoryRecordService {

    private final HistoryRecordRepository historyRecordRepository;

    @Autowired
    public HistoryRecordService(HistoryRecordRepository historyRecordRepository) {
        this.historyRecordRepository = historyRecordRepository;
    }

    public List<HistoryRecordDTO> getBorrowRecordHistory(Long borrowRecordId) {
        List<HistoryRecord> historyRecords = historyRecordRepository.findByBorrowRecordId(borrowRecordId);
        return historyRecords.stream()
                .map(HistoryRecord::transferDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public HistoryRecord saveHistory(BorrowRecord borrowRecord, String activity, String performedBy) {
        System.out.println("hự");
        HistoryRecord historyRecord = new HistoryRecord();
        historyRecord.setTimestamp(new Timestamp(System.currentTimeMillis()));
        historyRecord.setActivity(activity);
        historyRecord.setPerformedBy(performedBy);
        historyRecord.setBorrowRecord(borrowRecord);
        return historyRecordRepository.save(historyRecord);
    }
}