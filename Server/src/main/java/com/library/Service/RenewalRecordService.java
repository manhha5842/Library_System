package com.library.Service;

import com.library.DTO.RenewalRequestDTO;
import com.library.Model.BorrowRecord;
import com.library.Model.Enum.RenewalRecordStatus;
import com.library.Model.Librarian;
import com.library.Model.RenewalRecord;
import com.library.Model.Student;
import com.library.Repository.BorrowRecordRepository;
import com.library.Repository.RenewalRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RenewalRecordService {
    private final RenewalRecordRepository renewalRecordRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final NotificationService notificationService;

    @Autowired
    public RenewalRecordService(RenewalRecordRepository renewalRecordRepository, BorrowRecordRepository borrowRecordRepository, NotificationService notificationService) {
        this.renewalRecordRepository = renewalRecordRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.notificationService = notificationService;
    }


    // Lấy danh sách tất cả RenewalRecords
    public List<RenewalRecord> getAllRenewalRecords() {
        return renewalRecordRepository.findAll();
    }

    // Lấy RenewalRecords theo BorrowRecord
    public List<RenewalRecord> getRenewalRecordsByBorrowRecord(BorrowRecord borrowRecord) {
        return renewalRecordRepository.findByBorrowRecord(borrowRecord);
    }

    // Lấy RenewalRecords theo Librarian
    public List<RenewalRecord> getRenewalRecordsByLibrarian(Librarian librarian) {
        return renewalRecordRepository.findByLibrarian(librarian);
    }

    // Lấy RenewalRecords theo Status
    public List<RenewalRecord> getRenewalRecordsByStatus(RenewalRecordStatus status) {
        return renewalRecordRepository.findByStatus(status);
    }
    public List<RenewalRecord> getAllRenewalRecordsOrderByStatusPendingFirst() {
        return renewalRecordRepository.findAll()
                .stream()
                .sorted(Comparator.comparing((RenewalRecord r) -> r.getStatus() == RenewalRecordStatus.PENDING ? 0 : 1)
                        .thenComparing(RenewalRecord::getStatus))
                .collect(Collectors.toList());
    }
    // Lấy RenewalRecords theo sinh viên từ BorrowRecord tương ứng
    public List<RenewalRecord> getRenewalRecordsByStudent(Student student) {
        return renewalRecordRepository.findByBorrowRecord_Student(student);
    }

    // Thêm mới hoặc cập nhật RenewalRecord
    @Transactional
    public RenewalRecord saveOrUpdateRenewalRecord(RenewalRecord renewalRecord) {

        return renewalRecordRepository.save(renewalRecord);
    }

    @Transactional
    public RenewalRecord createRenewalRecord(RenewalRequestDTO renewalRequestDTO) {
        BorrowRecord borrowRecord = borrowRecordRepository.findById(renewalRequestDTO.getBorrowRecordId())
                .orElseThrow(() -> new IllegalStateException("BorrowRecord not found"));
        if (!borrowRecord.getRenewalRecords().isEmpty()) {
            List<RenewalRecord> renewalRecords = borrowRecord.getRenewalRecords();
            for (RenewalRecord renewalRecord : renewalRecords) {
                if (renewalRecord.getStatus().equals(RenewalRecordStatus.PENDING)) {
                    renewalRecord.setStatus(RenewalRecordStatus.OVERDUE);
                    renewalRecordRepository.save(renewalRecord);
                }
            }
        }
        RenewalRecord renewalRecord = new RenewalRecord();
        renewalRecord.setBorrowRecord(borrowRecord);
        renewalRecord.setOriginalBorrowDate(borrowRecord.getBorrowDate());
        renewalRecord.setOriginalDueDate(borrowRecord.getDueDate());
        renewalRecord.setRequestBorrowDate(Date.valueOf(renewalRequestDTO.getRequestBorrowDate()));
        renewalRecord.setRequestDueDate(Date.valueOf(renewalRequestDTO.getRequestDueDate()));
        renewalRecord.setNote(renewalRequestDTO.getNote());
        renewalRecord.setStatus(RenewalRecordStatus.PENDING);
        return renewalRecordRepository.save(renewalRecord);
    }

    public RenewalRecord updateRenewalRecord(long id, RenewalRecordStatus status,Librarian librarian) {
            RenewalRecord renewalRecord = renewalRecordRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Renewal record not found with id: " + id));

            renewalRecord.setStatus(status);
            renewalRecord.setLibrarian(librarian);
            notificationService.sendRenewalRecordNotification(renewalRecord);
          return  renewalRecordRepository.save(renewalRecord);
        }


}