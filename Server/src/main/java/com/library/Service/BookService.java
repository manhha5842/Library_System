package com.library.Service;


import com.library.Model.*;
import com.library.Model.Enum.CopyStatus;
import com.library.Repository.BookRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class BookService {
    private final BookRepository bookRepository;

    @Autowired
    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    // Lấy danh sách tất cả các sách
    public List<Book> findAllBooks() {
        return bookRepository.findAll();
    }

    // Lấy sách theo từ khoá tìm kiếm
    public List<Book> findBooksByTitle(String title) {
        return bookRepository.findByTitleContaining(title);
    }


    public List<Book> findBooksByPublisherId(long id) {
        return bookRepository.findBooksByPublisherId(id);
    }

    // Lấy sách theo năm xuất bản
    public List<Book> findBooksByPublicationYear(String year) {
        return bookRepository.findByPublicationYear(year);
    }

    // Lấy sách theo nhà xuất bản
    public List<Book> findBooksByPublisher(Publisher publisher) {
        return bookRepository.findByPublisher(publisher);
    }

    // Lấy sách theo tác giả
    public List<Book> findBooksByAuthor(Author author) {
        return bookRepository.findByAuthorsContaining(author);
    }

    // Lấy sách theo ngôn ngữ
    public List<Book> findBooksByLanguage(String language) {
        return bookRepository.findByLanguage(language);
    }

    // Lấy sách theo ISBN
    public List<Book> findBooksByIsbn(String isbn) {
        return bookRepository.findByIsbn(isbn);
    }

    // Lấy sách theo loại/category
    public List<Book> findBooksByCategory(Category category) {
        return bookRepository.findByCategoriesContaining(category);
    }

    public List<Book> getRecommendBooks() {
        return bookRepository.findRandom10Books();
    }

    // Lấy danh sách các BorrowRecord của một quyển sách
    public List<BorrowRecord> findBorrowRecordsByBook(Book book) {
        // Tương tự bạn lấy thông qua đối tượng sách
        return book.getBorrowRecords();
    }

    // Lấy danh sách các FineRecord của một quyển sách
    public List<FineRecord> findFineRecordsByBook(Book book) {
        // Tương tự bạn lấy thông qua đối tượng sách
        return book.getFineRecords();
    }

    // Thêm mới hoặc cập nhật thông tin sách
    @Transactional
    public Book saveOrUpdate(Book book) {
        return bookRepository.save(book);
    }

    public Optional<Book> getBookById(long id) {
        return bookRepository.findById((int) id);
    }


    public List<Author> getAuthorsByBookId(int bookId) {
        Optional<Book> book = bookRepository.findById(bookId);
        if (book.isPresent()) {
            // Do việc sử dụng @JsonIgnore, thông tin về books sẽ không bị tuần tự hóa
            return book.get().getAuthors();
        } else {
            throw new EntityNotFoundException("Book with id " + bookId + " not found.");
        }
    }


    public Page<Book> searchBooks(String keyword, Pageable pageable) {
        Page<Book> booksPage = bookRepository.findByKeyword(keyword, pageable);

        if (!keyword.isEmpty()) {
            if (keyword.contains(" d") || keyword.charAt(0) == 'd') {
                String newKeyword = "";
                if (keyword.contains(" d")) {
                    newKeyword = keyword.replace(" d", " đ");
                } else if (keyword.charAt(0) == 'd') {
                    newKeyword = 'đ' + keyword.substring(1);
                }
                Page<Book> booksPage2 = bookRepository.findByKeyword(newKeyword, pageable);
                // Gộp kết quả hai page lại rồi trả về một page mới
                List<Book> mergedBooks = Stream.concat(booksPage.getContent().stream(), booksPage2.getContent().stream())
                        .distinct()
                        .collect(Collectors.toList());
                return new PageImpl<>(mergedBooks, pageable, mergedBooks.size());
            }
        }
        return booksPage;
    }


    public List<String> getSearchSuggestions(String keyword) {
        String keywordLowerCase = Utils.removeDiacriticsAndSpecialCases(keyword.toLowerCase());
        List<String> rawSuggestions = bookRepository.findRawSuggestionsByKeyword(keyword);
        List<String> suggestions = new ArrayList<>();

        for (String suggestion : rawSuggestions) {
            String suggestWord = Utils.removeDiacriticsAndSpecialCases(suggestion.toLowerCase());
            int index = suggestWord.indexOf(keywordLowerCase);

            if ((index > 0 && suggestWord.charAt(index - 1) == ' ') || index == 0) {
                int endIndex = Math.min(index + keywordLowerCase.length() + 20, suggestWord.length());
                while (endIndex < suggestWord.length() && suggestWord.charAt(endIndex) != ' ') {
                    endIndex++;
                }

                String clippedSuggestion = suggestion.substring(index, endIndex).trim();
                if (!suggestions.contains(clippedSuggestion)) {
                    suggestions.add(clippedSuggestion);
                }
            }
            if (suggestions.size() > 10) break;
        }

        if (!keyword.isEmpty()) {
            if (keywordLowerCase.contains(" d") || keywordLowerCase.charAt(0) == 'd') {
                String newKeyword = "";
                if (keywordLowerCase.contains(" d")) {
                    newKeyword = keywordLowerCase.replace(" d", " đ");
                } else if (keywordLowerCase.charAt(0) == 'd') {
                    newKeyword = 'đ' + keywordLowerCase.substring(1);
                }

                List<String> rawSuggestions2 = bookRepository.findRawSuggestionsByKeyword(newKeyword);
                for (String suggestion : rawSuggestions2) {
                    String suggestWord = Utils.removeDiacriticsAndSpecialCases(suggestion.toLowerCase());
                    int index = suggestWord.indexOf(Utils.removeDiacriticsAndSpecialCases(newKeyword));
                    if ((index > 0 && suggestWord.charAt(index - 1) == ' ') || index == 0) {
                        int endIndex = Math.min(index + newKeyword.length() + 20, suggestWord.length());
                        while (endIndex < suggestWord.length() && suggestWord.charAt(endIndex) != ' ') {
                            endIndex++;
                        }

                        String clippedSuggestion = suggestion.substring(index, endIndex).trim();
                        if (!suggestions.contains(clippedSuggestion)) {
                            suggestions.add(clippedSuggestion);
                        }
                    }
                    if (suggestions.size() > 10) break;
                }
            }
        }
        return suggestions.stream()
                .sorted(Comparator.comparingInt(String::length))
                .limit(10)
                .collect(Collectors.toList());
    }

    public boolean checkAvailability(long id) {
        Book book = bookRepository.findById((int) id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with id: " + id));

        return !book.getCopies()
                .stream()
                .filter(copy -> copy.getStatus() == CopyStatus.AVAILABLE)
                .toList().isEmpty();

    }
}