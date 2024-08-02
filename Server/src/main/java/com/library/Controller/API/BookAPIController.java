package com.library.Controller.API;

import com.library.Controller.Admin.GlobalControllerAdvice;
import com.library.DTO.BookDTO;
import com.library.Model.Author;
import com.library.Model.Book;
import com.library.Model.Category;
import com.library.Model.Student;
import com.library.Service.AuthorService;
import com.library.Service.BookService;
import com.library.Service.CategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookAPIController {

    private static final Logger logger = LoggerFactory.getLogger(GlobalControllerAdvice.class);
    private final BookService bookService;
    private final CategoryService categoryService;
    private final AuthorService authorService;

    public BookAPIController(BookService bookService, CategoryService categoryService, AuthorService authorService) {
        this.bookService = bookService;
        this.categoryService = categoryService;
        this.authorService = authorService;
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getAll() {
        logger.info("đang lấy tất cả sách");
        List<BookDTO> books = bookService.findAllBooks()
                .stream()
                .map(Book::transferToBookDTO)
                .toList();
        return ResponseEntity.ok(books);
    }

    @GetMapping("/getRecommendBooks")
    public ResponseEntity<?> getRecommendBooks() {
        logger.info("đang lấy sách gợi ý");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Student student) {
            String email = student.getEmail();
            List<BookDTO> books = bookService.getRecommendBooks()
                    .stream()
                    .map(Book::transferToBookDTO)
                    .toList();

            return ResponseEntity.ok(books);
        } else {
            logger.info("Not found student information");
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/getBooksByCategory/{id}")
    public ResponseEntity<?> getBooksByCategory(@PathVariable("id") long id) {
        logger.info("đang lấy sách bằng category");
        Category category = categoryService.getCategoryById(id)
                .orElseThrow(() -> new IllegalArgumentException("Could not find category with id " + id));
        List<BookDTO> books = category.getBooks().stream()
                .map(Book::transferToBookDTO)
                .toList();
        return ResponseEntity.ok(books);

    }

    @GetMapping("/getBooksByAuthor/{id}")
    public ResponseEntity<?> getBooksByAuthor(@PathVariable("id") long id) {
        logger.info("đang lấy sách với author id");
        Author author = authorService.getAuthorById(id)
                .orElseThrow(() -> new IllegalArgumentException("Could not find author with id " + id));
        List<BookDTO> books = bookService.findBooksByAuthor(author).stream()
                .map(Book::transferToBookDTO)
                .toList();
        return ResponseEntity.ok(books);


    }

    @GetMapping("/getBooksByTitle/{title}")
    public ResponseEntity<?> getBooksByTitle(@PathVariable("title") String title) {
        logger.info("đang lấy sách với title");
        List<BookDTO> books = bookService.findBooksByTitle(title).stream()
                .map(Book::transferToBookDTO)
                .toList();

        return ResponseEntity.ok(books);
    }


    @GetMapping("/getBookInfo/{id}")
    public ResponseEntity<?> getBookInfo(@PathVariable("id") long id) {
        logger.info("đang lấy sách chi tiết với id");
        Book book = bookService.getBookById(id)
                .orElseThrow(() -> new IllegalArgumentException("Could not find book with id " + id));

        return ResponseEntity.ok(book.transferToBookInfoDTO());

    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBook(@PathVariable("id") long id) {
        logger.info("đang lấy sách với id");
        Book book = bookService.getBookById(id)
                .orElseThrow(() -> new IllegalArgumentException("Could not find book with id " + id));

        return ResponseEntity.ok(book.transferToBookDTO());
    }

    @GetMapping("/search/suggestions")
    public ResponseEntity<?> getSearchSuggestions(@RequestParam String keyword) {
        return ResponseEntity.ok(bookService.getSearchSuggestions(keyword));

    }

    @GetMapping("/search")
    public ResponseEntity<?> getSearch(@RequestParam String keyword,
                                       @PageableDefault(size = 20) Pageable pageable) {
        logger.info(keyword);
        logger.info(pageable.toString());
        return ResponseEntity.ok(bookService.searchBooks(keyword, pageable).map(Book::transferToBookDTO));
    }

}
