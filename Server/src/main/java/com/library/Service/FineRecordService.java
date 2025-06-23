package com.library.Service;// Add necessary imports

import com.library.Model.BorrowRecord;
import com.library.Model.Enum.CopyStatus;
import com.library.Model.Enum.FineRecordStatus;
import com.library.Model.Enum.Reason;
import com.library.Model.FineRecord;
import com.library.Model.Librarian;
import com.library.Repository.FineRecordRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class FineRecordService {
    private final FineRecordRepository fineRecordRepository;
    private final BookService bookService;
    private final CopyService copyService;
    private final NotificationService notificationService;
    @Autowired
    public FineRecordService(FineRecordRepository fineRecordRepository, BookService bookService, CopyService copyService, NotificationService notificationService) {
        this.fineRecordRepository = fineRecordRepository;
        this.bookService = bookService;
        this.copyService = copyService;
        this.notificationService = notificationService;
    }

    // Lấy danh sách tất cả FineRecords
    public List<FineRecord> getAllFineRecords() {
        return fineRecordRepository.findAll();
    }

    // Lấy FineRecord theo ID
    public Optional<FineRecord> getFineRecordById(Long id) {
        return fineRecordRepository.findById(Math.toIntExact(id));
    }

    // Lấy danh sách FineRecords theo BorrowRecord
    public List<FineRecord> getFineRecordsByBorrowRecord(BorrowRecord borrowRecord) {
        return fineRecordRepository.findByBorrowRecord(borrowRecord);
    }

    // Lấy danh sách FineRecords của một Librarian
    public List<FineRecord> getFineRecordsByLibrarian(Librarian librarian) {
        return fineRecordRepository.findByLibrarian(librarian);
    }

    // Lấy danh sách FineRecords theo status
    public List<FineRecord> getFineRecordsByStatus(FineRecordStatus status) {
        return fineRecordRepository.findByStatus(status);
    }

    // Lấy danh sách FineRecords theo lý do và trạng thái
    public List<FineRecord> getFineRecordsByReasonsAndStatus(List<Reason> reasons, FineRecordStatus status) {
        return fineRecordRepository.findByFineReasonInAndStatus(reasons, status);
    }

    // Thêm mới hoặc cập nhật FineRecord
    @Transactional
    public FineRecord saveOrUpdateFineRecord(FineRecord fineRecord) {
        if (fineRecord.getStatus().equals(FineRecordStatus.PAID)) {
            return fineRecordRepository.save(fineRecord);
        } else{
            switch (fineRecord.getFineReason()) {
                case LOST, LOST_OVERDUE -> {
                    fineRecord.setFineAmount(fineRecord.getBook().getPrice() * 2);
                    copyService.updateStatusCopy(fineRecord.getBook(), CopyStatus.BORROWED, CopyStatus.LOST);
                }
                case DAMAGED_MAJOR -> {
                    fineRecord.setFineAmount(fineRecord.getBook().getPrice() * 2);
                    copyService.updateStatusCopy(fineRecord.getBook(), CopyStatus.BORROWED, CopyStatus.DAMAGED);
                }
                case DAMAGED_MINOR -> {
                    fineRecord.setFineAmount(50000);
                    copyService.updateStatusCopy(fineRecord.getBook(), CopyStatus.BORROWED, CopyStatus.DAMAGED);
                }
                case LATE_RETURN -> {
                    fineRecord.setFineAmount(5000);
                }
                case LATE_FINE_PAYMENT -> {
                    fineRecord.setFineAmount(10000);
                }
                default -> {
                    fineRecord.setFineAmount(0);
                }
            }
            if (fineRecord.getStatus().equals(FineRecordStatus.PENDING)) {
                fineRecord.setFineDate(Date.valueOf(LocalDate.now()));
                fineRecord.setDueDate(fineRecord.getFineReason().equals(Reason.LOST_OVERDUE)
                        ?  Date.valueOf(LocalDate.now())
                        :  Date.valueOf(LocalDate.now().plusDays(7)));
            }
            notificationService.sendFineRecordNotification(fineRecord);
            return fineRecordRepository.save(fineRecord);
        }

    }
}