package com.library.Service;

import com.library.Model.Book;
import com.library.Model.Enum.Status;
import com.library.Model.Publisher;
import com.library.Repository.BookRepository;
import com.library.Repository.PublisherRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PublisherService {
    private final PublisherRepository publisherRepository;

    private final BookRepository bookRepository;

    @Autowired
    public PublisherService(PublisherRepository publisherRepository, BookRepository bookRepository) {
        this.publisherRepository = publisherRepository;
        this.bookRepository = bookRepository;
    }

    // Thêm hoặc cập nhật một publisher
    @Transactional
    public Publisher saveOrUpdatePublisher(Publisher publisher) {
        return publisherRepository.save(publisher);
    }

    // Cập nhật status của một publisher
    @Transactional
    public boolean updateStatus(int id, String status) {
        Optional<Publisher> publisher = publisherRepository.findById(id);
        if (publisher.isPresent()) {
            publisher.get().setStatus(Status.valueOf(status));
            publisherRepository.save(publisher.get());
            return true;
        }
        return false;
    }

    public List<Publisher> getAllPublishers() {
        return publisherRepository.findAll();
    }


    // Lấy ra một publisher theo id, không bao gồm những publisher với status DELETED
    public Optional<Publisher> getPublisherById(int id) {
        return publisherRepository.findById(id);
    }

    // Tìm kiếm publisher theo tên, không bao gồm những publisher với status DELETED
    public List<Publisher> searchPublishersByName(String name) {
        return publisherRepository.findAll();
    }

    // Lấy ra tổng số lượng sách mà một publisher đã xuất bản, không tính những sách có status DELETED cho Publisher
    public int getTotalNumberOfBooksPublishedByPublisher(int publisherId) {
        return getBooksByPublisherId(publisherId).size();
    }

    public List<Publisher> getAllPublishersWithBook() {
        List<Publisher> result = publisherRepository.findAll();
        for (Publisher publisher : result) {
            publisher.setBooks(getBooksByPublisherId(publisher.getId()));
        }
        return result;
    }

    public List<Book> getBooksByPublisherId(long publisherId) {
        if (!publisherRepository.existsById((int) publisherId)) {
            throw new EntityNotFoundException("Publisher with id " + publisherId + " not found.");
        }
        return bookRepository.findBooksByAuthorId((int) publisherId);
    }

    public Optional<Publisher> findByName(String publisherName) {
        return publisherRepository.findByName(publisherName);
    }
}