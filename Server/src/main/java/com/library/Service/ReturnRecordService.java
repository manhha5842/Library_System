package com.library.Service;// Add necessary imports

import com.library.Model.*;
import com.library.Model.Enum.CopyStatus;
import com.library.Model.Enum.ReturnRecordStatus;
import com.library.Repository.ReturnRecordRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReturnRecordService {
    private final ReturnRecordRepository returnRecordRepository;
    private final BookService bookService;
    private final CopyService copyService;

    @Autowired
    public ReturnRecordService(ReturnRecordRepository returnRecordRepository, BookService bookService, CopyService copyService) {
        this.returnRecordRepository = returnRecordRepository;
        this.bookService = bookService;
        this.copyService = copyService;
    }

    // Lấy danh sách tất cả ReturnRecords
    public List<ReturnRecord> getAllReturnRecords() {
        return returnRecordRepository.findAll();
    }

    // Lấy ReturnRecord theo ID
    public Optional<ReturnRecord> getReturnRecordById(Long id) {
        return returnRecordRepository.findById(Math.toIntExact(id));
    }

    // Lấy danh sách ReturnRecords theo BorrowRecord
    public List<ReturnRecord> getReturnRecordsByBorrowRecord(BorrowRecord borrowRecord) {
        return returnRecordRepository.findByBorrowRecord(borrowRecord);
    }

    // Lấy danh sách ReturnRecords của một Librarian
    public List<ReturnRecord> getReturnRecordsByLibrarian(Librarian librarian) {
        return returnRecordRepository.findByLibrarian(librarian);
    }

    // Lấy danh sách ReturnRecords theo status
    public List<ReturnRecord> getReturnRecordsByStatus(String status) {
        return returnRecordRepository.findByStatus(status);
    }

    public boolean isBookReturned(Long bookId) {
        return returnRecordRepository.existsByBookIdAndStatus(bookId, ReturnRecordStatus.PENDING);
    }

    // Thêm mới hoặc cập nhật ReturnRecord
    @Transactional
    public ReturnRecord saveOrUpdateReturnRecord(ReturnRecord returnRecord) {
        ReturnRecord savedRecord = returnRecordRepository.save(returnRecord);
        if (returnRecord.getStatus() == ReturnRecordStatus.RETURNED) {
            Book book = returnRecord.getBook();

            Copy availableCopies = book.getCopies()
                    .stream()
                    .filter(copy -> copy.getStatus() == CopyStatus.BORROWED)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Copy available not found with book: " + book.getTitle()));

            availableCopies.setStatus(CopyStatus.AVAILABLE);
            copyService.saveOrUpdateCopy(availableCopies);
            bookService.saveOrUpdate(book);
            System.out.println("save copy status available");
        }

        return savedRecord;
    }
}