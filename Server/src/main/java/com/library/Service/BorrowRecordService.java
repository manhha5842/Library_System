package com.library.Service;

import com.library.Controller.Admin.GlobalControllerAdvice;
import com.library.Model.*;
import com.library.Model.Enum.*;
import com.library.Repository.BorrowRecordRepository;
import com.library.Repository.RenewalRecordRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Service
public class BorrowRecordService {
    private final BorrowRecordRepository borrowRecordRepository;
    private final BookService bookService;
    private final HistoryRecordService historyRecordService;
    private final ReturnRecordService returnRecordService;
    private final FineRecordService fineRecordService;
    private final CopyService copyService;
    private static final Logger logger = LoggerFactory.getLogger(GlobalControllerAdvice.class);
    private final RenewalRecordService renewalRecordService;
    private final NotificationService notificationService;
    private final RenewalRecordRepository renewalRecordRepository;

    @Autowired
    public BorrowRecordService(BorrowRecordRepository borrowRecordRepository, BookService bookService, HistoryRecordService historyRecordService, ReturnRecordService returnRecordService, FineRecordService fineRecordService, CopyService copyService, RenewalRecordService renewalRecordService, NotificationService notificationService, RenewalRecordRepository renewalRecordRepository) {
        this.borrowRecordRepository = borrowRecordRepository;
        this.bookService = bookService;
        this.historyRecordService = historyRecordService;
        this.returnRecordService = returnRecordService;
        this.fineRecordService = fineRecordService;
        this.copyService = copyService;
        this.renewalRecordService = renewalRecordService;
        this.notificationService = notificationService;
        this.renewalRecordRepository = renewalRecordRepository;
    }

    public List<BorrowRecord> getAllBorrowRecords() {
        return borrowRecordRepository.findAll();
    }

    public Page<BorrowRecord> getBorrowRecordsByStudentAndStatuses(Student student, List<String> statuses, Pageable pageable) {
        List<BorrowRecordStatus> borrowRecordStatuses = statuses.stream()
                .map(String::toUpperCase)
                .map(BorrowRecordStatus::valueOf)
                .toList();
        Pageable sortedByDateDesc = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
        return borrowRecordRepository.findByStudentAndStatusIn(student, borrowRecordStatuses, sortedByDateDesc);
    }

    public Page<BorrowRecord> getBorrowRecordsAndFindRecordsByStudentAndStatuses(Student student, List<String> statuses, Pageable pageable) {
        List<BorrowRecordStatus> borrowRecordStatuses = statuses.stream()
                .map(String::toUpperCase)
                .map(BorrowRecordStatus::valueOf)
                .toList();
        Pageable sortedByDateDesc = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
        return borrowRecordRepository.findAllWithFineRecordsByStudentAndStatusIn(student, borrowRecordStatuses, sortedByDateDesc);
    }


    // Lấy BorrowRecord theo ID
    public Optional<BorrowRecord> getBorrowRecordById(Long id) {
        return borrowRecordRepository.findById(id);
    }

    // Lấy BorrowRecord kèm theo ReturnRecords
    public BorrowRecord getBorrowRecordWithReturnRecords(Long id) {
        return borrowRecordRepository.findWithReturnRecordsById(id);
    }

    public Page<BorrowRecord> getBorrowRecordsByStudent(Student student, Pageable pageable) {
        Pageable sortedByDateDesc = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
        return borrowRecordRepository.findByStudent(student, sortedByDateDesc);
    }

    // Lấy danh sách BorrowRecords theo status
    public List<BorrowRecord> getBorrowRecordsByStatus(String status) {
        return borrowRecordRepository.findByStatus(BorrowRecordStatus.valueOf(status));
    }

    // Thêm hoặc cập nhật BorrowRecord
    @Transactional
    public BorrowRecord saveOrUpdateBorrowRecord(BorrowRecord borrowRecord) {
        BorrowRecord savedRecord = borrowRecordRepository.save(borrowRecord);
        switch (borrowRecord.getStatus()) {
            case PENDING -> {
                for (Book book : borrowRecord.getBooks()) {
                    copyService.updateStatusCopy(book, CopyStatus.AVAILABLE, CopyStatus.BORROWED);
                }
                notificationService.sendBorrowRecordNotificationWithoutEmail(borrowRecord);

            }
            case CANCELLED -> {
                for (Book book : borrowRecord.getBooks()) {
                    copyService.updateStatusCopy(book, CopyStatus.BORROWED, CopyStatus.AVAILABLE);
                }
                notificationService.sendBorrowRecordNotification(borrowRecord);
            }
            case COMPLETED -> {
                for (Book book : borrowRecord.getBooks()) {
                    copyService.updateStatusCopy(book, CopyStatus.BORROWED, CopyStatus.AVAILABLE);
                }

                List<RenewalRecord> overdueRenewalRecords = borrowRecord.getRenewalRecords()
                        .stream()
                        .filter(renewalRecord -> renewalRecord.getStatus().equals(RenewalRecordStatus.OVERDUE))
                        .toList();
                for (RenewalRecord overdueRenewalRecord : overdueRenewalRecords) {
                    overdueRenewalRecord.setStatus(RenewalRecordStatus.CANCELLED);
                    renewalRecordService.saveOrUpdateRenewalRecord(overdueRenewalRecord);
                }
                notificationService.sendBorrowRecordNotification(borrowRecord);
            }
            case RETURN_PENDING -> {
                List<Book> books = borrowRecord.getReturnRecords()
                        .stream()
                        .filter(returnRecord -> returnRecord.getStatus().equals(ReturnRecordStatus.RETURNED))
                        .map(ReturnRecord::getBook)
                        .toList();
                for (Book book : books) {
                    copyService.updateStatusCopy(book, CopyStatus.BORROWED, CopyStatus.AVAILABLE);
                }
                notificationService.sendBorrowRecordNotification(borrowRecord);
            }
            case BORROWED -> {
                List<RenewalRecord> renewalRecords = borrowRecord.getRenewalRecords();
                for (RenewalRecord renewalRecord : renewalRecords) {
                    if (renewalRecord.getRequestBorrowDate() != null &&
                            !renewalRecord.getRequestBorrowDate().equals(borrowRecord.getBorrowDate())) {
                        renewalRecord.setStatus(RenewalRecordStatus.OVERDUE);
                        renewalRecordService.saveOrUpdateRenewalRecord(renewalRecord);
                    }
                }
                notificationService.sendBorrowRecordNotification(borrowRecord);
            }
            case OVERDUE, ARCHIVED -> {
                List<RenewalRecord> overdueRenewalRecords = borrowRecord.getRenewalRecords()
                        .stream()
                        .filter(renewalRecord -> renewalRecord.getStatus().equals(RenewalRecordStatus.OVERDUE))
                        .toList();
                for (RenewalRecord overdueRenewalRecord : overdueRenewalRecords) {
                    overdueRenewalRecord.setStatus(RenewalRecordStatus.CANCELLED);
                    renewalRecordService.saveOrUpdateRenewalRecord(overdueRenewalRecord);
                }
                notificationService.sendBorrowRecordNotification(borrowRecord);
            }
        }
        return savedRecord;
    }

    @Transactional
    public BorrowRecord saveWithoutNotification(BorrowRecord borrowRecord) {
        return borrowRecordRepository.save(borrowRecord);
    }

    // Hàm tự động cập nhật các đơn mượn sách mỗi ngày lúc 8h sáng
    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void autoUpdateBorrowStatus() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1); // Ngày hôm qua

        // Cập nhật đơn sinh viên không đến nhận sách
        updatePendingBorrowRecords(yesterday);

        // Cập nhật đơn bị trễ hạn trả sách
        updateOverdueBorrowRecords(yesterday);

        // Cập nhật đơn sinh viên quá hạn trả phiếu phạt không phải đơn trả sách
        updateFineOverdueRecords(yesterday);
    }

    private void updatePendingBorrowRecords(LocalDate cutoffDate) {
        List<BorrowRecord> pendingRecords = borrowRecordRepository.findByStatus(BorrowRecordStatus.PENDING);
        for (BorrowRecord borrowedRecord : pendingRecords) {
            if (borrowedRecord.getBorrowDate() != null) {
                LocalDate borrowDate = convertToLocalDateViaInstant(borrowedRecord.getBorrowDate());
                if (borrowDate.isEqual(cutoffDate) || borrowDate.isBefore(cutoffDate)) {
                    for (Book book : borrowedRecord.getBooks()) {
                        List<Copy> availableCopies = book.getCopies()
                                .stream()
                                .filter(copy -> copy.getStatus() == CopyStatus.BORROWED)
                                .toList();
                        if (!availableCopies.isEmpty()) {
                            availableCopies.get(0).setStatus(CopyStatus.AVAILABLE);
                            copyService.saveOrUpdateCopy(availableCopies.get(0));
                        }
                    }

                    borrowedRecord.setStatus(BorrowRecordStatus.CANCELLED);
                    borrowRecordRepository.save(borrowedRecord);
                    notificationService.sendBorrowRecordNotification(borrowedRecord);
                    historyRecordService.saveHistory(borrowedRecord, "Huỷ đơn mượn sách do quá hạn nhận sách", "Hệ thống");
                }
            } else {
                logger.warn("BorrowRecord with ID " + borrowedRecord.getId() + " has a null borrowDate");
            }
        }
    }

    private void updateOverdueBorrowRecords(LocalDate cutoffDate) {
        List<BorrowRecordStatus> statuses = List.of(BorrowRecordStatus.BORROWED, BorrowRecordStatus.RETURN_PENDING, BorrowRecordStatus.OVERDUE);
        List<BorrowRecord> borrowedRecords = borrowRecordRepository.findByStatusIn(statuses);

        for (BorrowRecord borrowedRecord : borrowedRecords) {
            LocalDate dueDate = convertToLocalDateViaInstant(borrowedRecord.getDueDate());
            long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(dueDate, cutoffDate);

            // Kiểm tra nếu quá hạn nhưng chưa đến ngày thứ 30
            if (dueDate.isEqual(cutoffDate) || dueDate.isBefore(cutoffDate)) {
                List<Book> bookNotReturnYet = borrowedRecord.getReturnRecords()
                        .stream()
                        .filter(returnRecord -> returnRecord.getStatus().equals(ReturnRecordStatus.PENDING))
                        .map(ReturnRecord::getBook)
                        .toList();
                if (daysOverdue > 0 && daysOverdue <= 30) {
                    for (Book book : bookNotReturnYet) {
                        FineRecord fineRecord = new FineRecord();
                        fineRecord.setBorrowRecord(borrowedRecord);
                        fineRecord.setBook(book);
                        fineRecord.setStatus(FineRecordStatus.PENDING);
                        fineRecord.setFineReason(Reason.LATE_RETURN);
                        fineRecordService.saveOrUpdateFineRecord(fineRecord);
                        historyRecordService.saveHistory(borrowedRecord, "Tạo đơn phạt với lý do quá hạn " + daysOverdue, "Hệ thống");
                        if (!borrowedRecord.getStatus().equals(BorrowRecordStatus.OVERDUE)) {
                            borrowedRecord.setStatus(BorrowRecordStatus.OVERDUE);
                            borrowRecordRepository.save(borrowedRecord);
                            notificationService.sendBorrowRecordNotification(borrowedRecord);
                            historyRecordService.saveHistory(borrowedRecord, "Cập nhật trạng thái quá hạn trả sách", "Hệ thống");
                        }
                    }
                } else if (daysOverdue > 30) {
                    for (Book book : bookNotReturnYet) {
                        FineRecord fineRecord = new FineRecord();
                        fineRecord.setBorrowRecord(borrowedRecord);
                        fineRecord.setBook(book);
                        fineRecord.setDueDate(null);
                        fineRecord.setStatus(FineRecordStatus.PENDING);
                        fineRecord.setFineReason(Reason.LOST_OVERDUE);
                        fineRecordService.saveOrUpdateFineRecord(fineRecord);
                        historyRecordService.saveHistory(borrowedRecord, "Tạo đơn phạt với lý do sách bị mất vì quá hạn trả", "Hệ thống");
                    }

                    borrowedRecord.setStatus(BorrowRecordStatus.ARCHIVED);
                    borrowRecordRepository.save(borrowedRecord);
                    notificationService.sendBorrowRecordNotification(borrowedRecord);
                    historyRecordService.saveHistory(borrowedRecord, "Đơn được lưu trữ và sách chưa trả được đánh dấu là đã mất", "Hệ thống");
                }
            }
        }
    }

    private void updateFineOverdueRecords(LocalDate cutoffDate) {
        List<Reason> statuses = List.of(Reason.LOST, Reason.DAMAGED_MAJOR, Reason.DAMAGED_MINOR);
        List<FineRecord> overdueFines = fineRecordService.getFineRecordsByReasonsAndStatus(statuses, FineRecordStatus.PENDING);

        for (FineRecord fineRecord : overdueFines) {
            LocalDate fineDueDate = convertToLocalDateViaInstant(fineRecord.getDueDate());
            LocalDate lastFineUpdatedDate = convertToLocalDateViaInstant(fineRecord.getFineDate());

            if (fineDueDate.isBefore(cutoffDate)) {
                // Khoá tài khoản sinh viên
            }
        }
    }

    @Transactional
    public BorrowRecord cancelBorrowRecord(Long id) {
        Optional<BorrowRecord> optionalBorrowRecord = borrowRecordRepository.findById(id);
        if (optionalBorrowRecord.isEmpty()) {
            throw new IllegalStateException("BorrowRecord not found");
        }

        BorrowRecord borrowRecord = optionalBorrowRecord.get();
        if (borrowRecord.getStatus() == BorrowRecordStatus.PENDING) {
            borrowRecord.setStatus(BorrowRecordStatus.CANCELLED);
            for (Book book : borrowRecord.getBooks()) {
                copyService.updateStatusCopy(book, CopyStatus.BORROWED, CopyStatus.AVAILABLE);
            }

            borrowRecordRepository.save(borrowRecord);
            notificationService.sendBorrowRecordNotification(borrowRecord);
            historyRecordService.saveHistory(borrowRecord, "Huỷ đơn mượn sách", "Người dùng");

        } else if (borrowRecord.getStatus() == BorrowRecordStatus.CANCELLED) {
            throw new IllegalStateException("BorrowRecord is already cancelled");
        } else {
            throw new IllegalStateException("BorrowRecord cannot be canceled");
        }
        List<RenewalRecord> renewalRecords = borrowRecord.getRenewalRecords();
        if(!renewalRecords.isEmpty()){
            for(RenewalRecord renewalRecord : renewalRecords){
                renewalRecord.setStatus(RenewalRecordStatus.OVERDUE);
                renewalRecordRepository.save(renewalRecord);
            }
        }
        return borrowRecord;
    }

    public static LocalDate convertToLocalDateViaInstant(Date dateToConvert) {
        if (dateToConvert == null) {
            throw new IllegalArgumentException("Date to convert cannot be null");
        }
        return dateToConvert.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
    }

    public List<BorrowRecord> getAllBorrowRecordsWithFineRecords() {
        return borrowRecordRepository.findAllWithFineRecords();
    }

    public List<BorrowRecord> getAllWithRenewalRecords() {
        return borrowRecordRepository.findAllWithRenewalRecords();
    }

    public Page<BorrowRecord> getBorrowRecordsAndFindRecordsByStudent(Student student, Pageable pageable) {
        Pageable sortedByDateDesc = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
        return borrowRecordRepository.findAllWithFineRecordsByStudent(student, sortedByDateDesc);
    }


}