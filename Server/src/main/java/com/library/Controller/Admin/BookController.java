

package com.library.Controller.Admin;

import com.library.Model.*;
import com.library.Model.Enum.CopyStatus;
import com.library.Model.Enum.Status;
import com.library.Service.*;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/books")
public class BookController {
    private static final Logger logger = LoggerFactory.getLogger(GlobalControllerAdvice.class);
    private final BookService bookService;

    @Autowired
    private ExcelService excelService;
    @Autowired
    private CategoryService categoryService;
    @Autowired
    private AuthorService authorService;
    @Autowired
    private PublisherService publisherService;
    @Autowired
    private ImageUploadService imageUploadService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("")
    public String books(Model model) {
        List<Book> bookList = bookService.findAllBooks();
        List<Category> categories = categoryService.getAllCategories();
        List<Author> authors = authorService.getAllAuthors();
        List<Publisher> publishers = publisherService.getAllPublishers();
        model.addAttribute("categories", categories);
        model.addAttribute("authors", authors);
        model.addAttribute("publishers", publishers);
        model.addAttribute("bookList", bookList);
        model.addAttribute("pageTitle", "Sách");
        return "books";
    }

    @GetMapping("/{id}")
    public String viewBook(@PathVariable("id") int bookId, Model model) {
        Book book = bookService.getBookById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with id: " + bookId));

        List<Copy> availableCopies = book.getCopies().stream()
                .filter(copy -> copy.getStatus() == CopyStatus.AVAILABLE)
                .collect(Collectors.toList());
        model.addAttribute("availableCopies", availableCopies);

        List<Copy> borrowedCopies = book.getCopies().stream()
                .filter(copy -> copy.getStatus() == CopyStatus.BORROWED)
                .collect(Collectors.toList());
        model.addAttribute("borrowedCopies", borrowedCopies);

        List<Copy> otherCopies = book.getCopies().stream()
                .filter(copy -> (copy.getStatus() == CopyStatus.LOST
                        || copy.getStatus() == CopyStatus.DAMAGED
                        || copy.getStatus() == CopyStatus.DESTROYED))
                .collect(Collectors.toList());
        model.addAttribute("otherCopies", otherCopies);

        List<Copy> offlineCopies = book.getCopies().stream()
                .filter(copy -> (copy.getStatus() == CopyStatus.OFFLINE_ONLY))
                .collect(Collectors.toList());
        model.addAttribute("offlineCopies", offlineCopies);

        model.addAttribute("book", book);
        model.addAttribute("pageTitle", book.getTitle());

        return "book";
    }
    @PostMapping("/add")
    public String addBook(@RequestParam("title") String title,
                          @RequestParam("description") String description,
                          @RequestParam("publicationYear") String publicationYear,
                          @RequestParam("publisher") String publisher,
                          @RequestParam("language") String language,
                          @RequestParam("isbn") String isbn,
                          @RequestParam("format") String format,
                          @RequestParam("price") float price,
                          @RequestParam("categories") String categories,
                          @RequestParam("authors") String authors,
                          @RequestParam("quantity") int quantity,
                          @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        // Tìm hoặc thêm mới nhà xuất bản
        Publisher publisher1 = publisherService.findByName(publisher)
                .orElseGet(() -> {
                    Publisher newPublisher = new Publisher();
                    newPublisher.setName(publisher);
                    newPublisher.setStatus(Status.ACTIVE);
                    return publisherService.saveOrUpdatePublisher(newPublisher);
                });
        List<Category> categoryList = new ArrayList<>();
        for (String categoryName : categories.split(",")) {
            Category category = categoryService.findByName(categoryName.trim())
                    .orElseGet(() -> {
                        Category newCategory = new Category();
                        newCategory.setName(categoryName.trim());
                        newCategory.setStatus(Status.ACTIVE);
                        return categoryService.saveOrUpdateCategory(newCategory);
                    });
            categoryList.add(category);
        }
        List<Author> authorList = new ArrayList<>();
        for (String authorName : authors.split(",")) {
            Author author = authorService.findByName(authorName.trim())
                    .orElseGet(() -> {
                        Author newAuthor = new Author();
                        newAuthor.setName(authorName.trim());
                        newAuthor.setStatus(Status.ACTIVE);
                        return authorService.saveOrUpdateAuthor(newAuthor);
                    });
            authorList.add(author);
        }

        Book book = new Book();
        book.setTitle(title);
        book.setDescription(description);
        book.setPublicationYear(publicationYear);
        book.setPublisher(publisher1);
        book.setLanguage(language);
        book.setIsbn(isbn);
        book.setFormat(format);
        book.setPrice(price);
        book.setCategories(categoryList);
        book.setAuthors(authorList);
        book.setStatus(Status.ACTIVE);

        // Tạo các bản sao (copies) cho sách
        List<Copy> copies = new ArrayList<>();
        for (int i = 0; i < quantity; i++) {
            Copy copy = new Copy();
            copy.setBook(book);
            copy.setStatus(CopyStatus.AVAILABLE);
            copies.add(copy);
        }
        book.setCopies(copies);

        if (image != null && !image.isEmpty()) {
            String imagePath = imageUploadService.uploadImageToFreeimageHost(image);
            book.setImage(imagePath);
        }else {
            book.setImage("https://i.pinimg.com/564x/69/c2/d0/69c2d0cc909acc8dce9d147216ecd374.jpg");
        }

        bookService.saveOrUpdate(book);
        return "books";
    }
    @GetMapping("/template")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        excelService.generateBookTemplate(response);
    }

    @GetMapping("/export")
    public void exportBooksToExcel(HttpServletResponse response) throws IOException {
        excelService.exportBooksToExcel(response);
    }

    @PostMapping("/upload")
    public String uploadBooks(@RequestParam("file") MultipartFile file) throws IOException {
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String title = row.getCell(0).getStringCellValue();
            String description = row.getCell(1).getStringCellValue();
            String publicationYear = row.getCell(2).getStringCellValue();
            String publisherName = row.getCell(3).getStringCellValue();
            String language = row.getCell(4).getStringCellValue();
            String isbn = row.getCell(5).getStringCellValue();
            String format = row.getCell(6).getStringCellValue();
            float price = (float) row.getCell(7).getNumericCellValue();
            String categoryNames = row.getCell(8).getStringCellValue();
            String authorNames = row.getCell(9).getStringCellValue();
            int quantity = (int) row.getCell(10).getNumericCellValue();

            // Tìm hoặc thêm mới nhà xuất bản
            Publisher publisher = publisherService.findByName(publisherName)
                    .orElseGet(() -> {
                        Publisher newPublisher = new Publisher();
                        newPublisher.setName(publisherName);
                        newPublisher.setStatus(Status.ACTIVE);
                        return publisherService.saveOrUpdatePublisher(newPublisher);
                    });

            // Tìm hoặc thêm mới các thể loại
            List<Category> categories = new ArrayList<>();
            for (String categoryName : categoryNames.split(",")) {
                Category category = categoryService.findByName(categoryName.trim())
                        .orElseGet(() -> {
                            Category newCategory = new Category();
                            newCategory.setName(categoryName.trim());
                            newCategory.setStatus(Status.ACTIVE);
                            return categoryService.saveOrUpdateCategory(newCategory);
                        });
                categories.add(category);
            }

            // Tìm hoặc thêm mới các tác giả
            List<Author> authors = new ArrayList<>();
            for (String authorName : authorNames.split(",")) {
                Author author = authorService.findByName(authorName.trim())
                        .orElseGet(() -> {
                            Author newAuthor = new Author();
                            newAuthor.setName(authorName.trim());
                            newAuthor.setStatus(Status.ACTIVE);
                            return authorService.saveOrUpdateAuthor(newAuthor);
                        });
                authors.add(author);
            }

            // Tạo đối tượng Book và lưu vào cơ sở dữ liệu
            Book book = new Book();
            book.setTitle(title);
            book.setDescription(description);
            book.setPublicationYear(publicationYear);
            book.setPublisher(publisher);
            book.setLanguage(language);
            book.setIsbn(isbn);
            book.setFormat(format);
            book.setPrice(price);
            book.setCategories(categories);
            book.setAuthors(authors);
            book.setStatus(Status.ACTIVE);
    book.setImage("https://i.pinimg.com/564x/69/c2/d0/69c2d0cc909acc8dce9d147216ecd374.jpg");
            // Tạo các bản sao (copies) cho sách
            List<Copy> copies = new ArrayList<>();
            for (int j = 0; j < quantity; j++) {
                Copy copy = new Copy();
                copy.setBook(book);
                copy.setStatus(CopyStatus.AVAILABLE);
                copies.add(copy);
            }
            book.setCopies(copies);


            bookService.saveOrUpdate(book);
        }
        return "books";
    }
}
