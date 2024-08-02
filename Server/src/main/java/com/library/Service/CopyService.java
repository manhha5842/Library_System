package com.library.Service;

import com.library.Model.Book;
import com.library.Model.Copy;
import com.library.Model.Enum.CopyStatus;
import com.library.Repository.BookRepository;
import com.library.Repository.CopyRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CopyService {

    private final BookRepository bookRepository;
    private final CopyRepository copyRepository;

    @Autowired
    public CopyService(BookRepository bookRepository, CopyRepository copyRepository) {
        this.copyRepository = copyRepository;
        this.bookRepository = bookRepository;
    }

    // Thêm hoặc cập nhật một publisher
    @Transactional
    public Copy saveOrUpdateCopy(Copy copy) {
        return copyRepository.save(copy);
    }

    // Cập nhật status của một publisher
    @Transactional
    public Copy updateStatus(Copy copy, CopyStatus status) {
        copy.setStatus(status);
        return copyRepository.save(copy);
    }

    public List<Copy> getAllCopies() {
        return copyRepository.findAll();
    }


    // Lấy ra một publisher theo id, không bao gồm những publisher với status DELETED
    public Optional<Copy> getCopyById(int id) {
        return copyRepository.findById(id);
    }


    public void updateStatusCopy(Book book, CopyStatus oldStatus, CopyStatus newStatus) {

        Optional<Copy> availableCopies = book.getCopies()
                .stream()
                .filter(copy -> copy.getStatus() == oldStatus)
                .findFirst();
        if (availableCopies.isPresent()) {
            Copy copy = availableCopies.get();
            copy.setStatus(newStatus);
            copyRepository.save(copy);
        }

    }

    public List<Copy> getCopiesByBook(Book book) {
        if (!bookRepository.existsById((int) book.getId())) {
            throw new EntityNotFoundException("Book with id " + book.getId() + " not found.");
        }
        return copyRepository.findCopiesByBook(book);
    }
}