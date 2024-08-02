package com.library.Service;

import com.library.Model.Author;
import com.library.Model.Book;
import com.library.Repository.AuthorRepository;
import com.library.Repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AuthorService {
    private final AuthorRepository authorRepository;

    private final BookRepository bookRepository;

    @Autowired
    public AuthorService(AuthorRepository authorRepository, BookRepository bookRepository) {
        this.authorRepository = authorRepository;
        this.bookRepository = bookRepository;
    }

    // Lấy tất cả các tác giả
    public List<Author> getAllAuthors() {
        List<Author> result = authorRepository.findAll();
        return result;
    }

    public List<Author> getAllAuthorsWithBook() {
        List<Author> result = authorRepository.findAll();
        for (Author author : result) {
            author.setBooks(getBooksByAuthorId(author.getId()));
        }
        return result;
    }

    // Lấy tác giả theo ID
    public Optional<Author> getAuthorById(long id) {
        return authorRepository.findById((int) id);
    }

    // Thêm mới hoặc cập nhật thông tin tác giả
    @Transactional
    public Author saveOrUpdateAuthor(Author author) {
        return authorRepository.save(author);
    }


    public List<Book> getBooksByAuthorId(long id) {
        Author author = authorRepository.findById((int) id)
                .orElseThrow(() -> new IllegalArgumentException("Author not found with id: " + id));
        return bookRepository.findBooksByAuthorId((int) author.getId());
    }
    public Optional<Author> findByName(String name) {
        return authorRepository.findByName(name);
    }

}