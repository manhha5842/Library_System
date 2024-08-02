package com.library.Repository;

import com.library.Model.Author;
import com.library.Model.Book;
import com.library.Model.Category;
import com.library.Model.Publisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {

    List<Book> findByTitleContaining(String keyword);

    List<Book> findByPublicationYear(String year);

    List<Book> findByPublisher(Publisher publisher);

    List<Book> findByAuthorsContaining(Author author);

    List<Book> findByLanguage(String language);

    List<Book> findByIsbn(String isbn);

    List<Book> findByCategoriesContaining(Category category);

    @Query("SELECT b FROM Book b JOIN b.authors a WHERE a.id = :authorId")
    List<Book> findBooksByAuthorId(@Param("authorId") int authorId);


    @Query("SELECT b FROM Book b JOIN b.publisher a WHERE a.id = :publisherId")
    List<Book> findBooksByPublisherId(@Param("publisherId") long publisherId);

    @Query("SELECT b FROM Book b ORDER BY RAND() LIMIT 10")
    List<Book> findRandom10Books();

    @Query("SELECT DISTINCT b FROM Book b " +
            "LEFT JOIN b.authors a " +
            "LEFT JOIN b.publisher p " +
            "WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Book> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query(value = "SELECT DISTINCT a.name AS suggestion FROM authors a " +
            "JOIN book_author ba ON a.id = ba.author_id " +
            "JOIN books b ON b.id = ba.book_id " +
            "WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "UNION " +
            "SELECT DISTINCT p.name AS suggestion FROM publishers p " +
            "JOIN books b ON p.id = b.publisher_id " +
            "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "UNION " +
            "SELECT title AS suggestion FROM books " +
            "WHERE LOWER(title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "UNION " +
            "SELECT DISTINCT isbn AS suggestion FROM books " +
            "WHERE LOWER(isbn) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "LIMIT 100",
            nativeQuery = true)
    List<String> findRawSuggestionsByKeyword(@Param("keyword") String keyword);


}
