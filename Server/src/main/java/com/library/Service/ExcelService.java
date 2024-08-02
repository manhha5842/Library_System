package com.library.Service;

import com.library.Model.Author;
import com.library.Model.Book;
import com.library.Model.Category;
import com.library.Model.Publisher;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class ExcelService {

    private final CategoryService categoryService;
    private final AuthorService authorService;
    private final PublisherService publisherService;
    private final BookService bookService;

    public ExcelService(CategoryService categoryService, AuthorService authorService, PublisherService publisherService, BookService bookService) {
        this.categoryService = categoryService;
        this.authorService = authorService;
        this.publisherService = publisherService;
        this.bookService = bookService;
    }

    public void generateBookTemplate(HttpServletResponse response) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Books");

        List<String> categories = categoryService.getAllCategories().stream().map(Category::getName).toList();
        List<String> authors = authorService.getAllAuthors().stream().map(Author::getName).toList();
        List<String> publishers = publisherService.getAllPublishers().stream().map(Publisher::getName).toList();
        // Tạo header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Tiêu đề", "Mô tả", "Năm xuất bản", "Nhà xuất bản", "Ngôn ngữ", "ISBN", "Kích thước", "Giá", "Thể loại", "Tác giả","Số lượng"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }
        List<Book> books = bookService.getRecommendBooks();
        int rowNum = 1;
        for (Book book : books) {
            Row row = sheet.createRow(rowNum++);

            row.createCell(0).setCellValue(book.getTitle());
            row.createCell(1).setCellValue(book.getDescription());
            row.createCell(2).setCellValue(book.getPublicationYear());
            row.createCell(3).setCellValue(book.getPublisher().getName());
            row.createCell(4).setCellValue(book.getLanguage());
            row.createCell(5).setCellValue(book.getIsbn());
            row.createCell(6).setCellValue(book.getFormat());
            row.createCell(7).setCellValue(book.getPrice());
            row.createCell(8).setCellValue(String.join(", ", book.getCategories().stream().map(Category::getName).toArray(String[]::new)));
            row.createCell(9).setCellValue(String.join(", ", book.getAuthors().stream().map(Author::getName).toArray(String[]::new)));
            row.createCell(10).setCellValue( book.getCopies().size());
        }

        createDropdownSheet(workbook, "Publishers", publishers);

        // Thiết lập dropdown cho các cột
        setDropdown(sheet, 1, 100, 3, "Publishers");

        // Thiết lập response headers
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=book_template.xlsx");

        // Ghi workbook vào output stream
        ServletOutputStream outputStream = response.getOutputStream();
        workbook.write(outputStream);
        workbook.close();
        outputStream.close();
    }

    private void createDropdownSheet(Workbook workbook, String sheetName, List<String> values) {
        Sheet sheet = workbook.createSheet(sheetName);
        for (int i = 0; i < values.size(); i++) {
            Row row = sheet.createRow(i);
            Cell cell = row.createCell(0);
            cell.setCellValue(values.get(i));
        }
    }

    private void setDropdown(Sheet sheet, int firstRow, int lastRow, int col, String dropdownSheet) {
        DataValidationHelper validationHelper = sheet.getDataValidationHelper();
        String formula = dropdownSheet + "!$A$1:$A$" + sheet.getWorkbook().getSheet(dropdownSheet).getLastRowNum();
        DataValidationConstraint constraint = validationHelper.createFormulaListConstraint(formula);
        CellRangeAddressList addressList = new CellRangeAddressList(firstRow, lastRow, col, col);
        DataValidation validation = validationHelper.createValidation(constraint, addressList);
        validation.setShowErrorBox(true);
        sheet.addValidationData(validation);
    }


    public void exportBooksToExcel(HttpServletResponse response) throws IOException {
        List<Book> books = bookService.findAllBooks();

        List<String> categories = categoryService.getAllCategories().stream().map(Category::getName).toList();
        List<String> authors = authorService.getAllAuthors().stream().map(Author::getName).toList();
        List<String> publishers = publisherService.getAllPublishers().stream().map(Publisher::getName).toList();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Books");

        // Tạo header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "Tiêu đề", "Mô tả", "Năm xuất bản", "Nhà xuất bản", "Ngôn ngữ", "ISBN", "Kích thước", "Giá", "Thể loại", "Tác giả","Số lượng"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }

        // Tạo các row cho từng cuốn sách
        int rowNum = 1;
        for (Book book : books) {
            Row row = sheet.createRow(rowNum++);

            row.createCell(0).setCellValue(book.getId());
            row.createCell(1).setCellValue(book.getTitle());
            row.createCell(2).setCellValue(book.getDescription());
            row.createCell(3).setCellValue(book.getPublicationYear());
            row.createCell(4).setCellValue(book.getPublisher().getName());
            row.createCell(5).setCellValue(book.getLanguage());
            row.createCell(6).setCellValue(book.getIsbn());
            row.createCell(7).setCellValue(book.getFormat());
            row.createCell(8).setCellValue(book.getPrice());
            row.createCell(9).setCellValue(String.join(", ", book.getCategories().stream().map(Category::getName).toArray(String[]::new)));
            row.createCell(10).setCellValue(String.join(", ", book.getAuthors().stream().map(Author::getName).toArray(String[]::new)));
            row.createCell(11).setCellValue( book.getCopies().size());
        }
        // Tạo sheet cho danh sách lựa chọn
        createDropdownSheet(workbook, "Publishers", publishers);

        // Thiết lập dropdown cho các cột
        setDropdown(sheet, 1, 100, 4, "Publishers");

        // Thiết lập response headers
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=book_template.xlsx");
        // Thiết lập response headers
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=books.xlsx");

        // Ghi workbook vào output stream
        ServletOutputStream outputStream = response.getOutputStream();
        workbook.write(outputStream);
        workbook.close();
        outputStream.close();
    }
}