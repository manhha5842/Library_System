package com.library.Service;

import com.library.Model.Book;
import com.library.Model.BorrowRecord;
import com.library.Model.Category;
import com.library.Repository.BookRepository;
import com.library.Repository.BorrowRecordRepository;
import com.library.Repository.CopyRepository;
import com.library.Repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StatisticService {

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private CopyRepository copyRepository;

    public long getTotalStudentsBorrowingBooksInMoth() {
        YearMonth currentYearMonth = YearMonth.now();

        long result= studentRepository.countStudentsBorrowingInMonth(currentYearMonth.getYear(), currentYearMonth.getMonthValue());
        if(result ==0 ){
            return studentRepository.countStudentsBorrowingInMonth(currentYearMonth.minusMonths(1).getYear(), currentYearMonth.minusMonths(1).getMonthValue());
        }
        return result;
    }

    public double getStudentBorrowingBooksChangePercentage() {
        YearMonth currentYearMonth = YearMonth.now();
        YearMonth preivousYearMonth = currentYearMonth.minusMonths(1);
        long currentMonthCount = studentRepository.countStudentsBorrowingInMonth(currentYearMonth.getYear(), currentYearMonth.getMonthValue());
        long previousMonthCount = studentRepository.countStudentsBorrowingInMonth(preivousYearMonth.getYear(), preivousYearMonth.getMonthValue());
        if (currentMonthCount == 0) {
            currentMonthCount = borrowRecordRepository.countBorrowRecordsInMonth(currentYearMonth.minusMonths(1).getYear(), currentYearMonth.minusMonths(1).getMonthValue());
            previousMonthCount = borrowRecordRepository.countBorrowRecordsInMonth(preivousYearMonth.minusMonths(1).getYear(), preivousYearMonth.minusMonths(1).getMonthValue());
        }
        return calculatePercentageChange(currentMonthCount, previousMonthCount);
    }

    public long getTotalBorrowRecordsInMonth() {
        YearMonth currentMonth = YearMonth.now();
        long result = borrowRecordRepository.countBorrowRecordsInMonth(currentMonth.getYear(), currentMonth.getMonthValue());
        if (result == 0) {
            return borrowRecordRepository.countBorrowRecordsInMonth(currentMonth.minusMonths(1).getYear(), currentMonth.minusMonths(1).getMonthValue());
        }
        return result;
    }

    public double getBorrowRecordsChangePercentage() {
        YearMonth currentYearMonth = YearMonth.now();
        YearMonth preivousYearMonth = currentYearMonth.minusMonths(1);
        long currentMonthCount = borrowRecordRepository.countBorrowRecordsInMonth(currentYearMonth.getYear(), currentYearMonth.getMonthValue());
        long previousMonthCount = borrowRecordRepository.countBorrowRecordsInMonth(preivousYearMonth.getYear(), preivousYearMonth.getMonthValue());
        if (currentMonthCount == 0) {
            currentMonthCount = borrowRecordRepository.countBorrowRecordsInMonth(currentYearMonth.minusMonths(1).getYear(), currentYearMonth.minusMonths(1).getMonthValue());
            previousMonthCount = borrowRecordRepository.countBorrowRecordsInMonth(preivousYearMonth.minusMonths(1).getYear(), preivousYearMonth.minusMonths(1).getMonthValue());
        }
        return calculatePercentageChange(currentMonthCount, previousMonthCount);
    }


    public long getTotalBooksBorrowed() {
        return copyRepository.countBooksBorrowing();
    }

    public double getBooksBorrowedChangePercentage() {
        YearMonth currentYearMonth = YearMonth.now();
        YearMonth preivousYearMonth = currentYearMonth.minusMonths(1);
        List<BorrowRecord> borrowRecords = borrowRecordRepository.findAllByCreatedAtIn(currentYearMonth.getYear(), currentYearMonth.getMonthValue());
        List<BorrowRecord> previousBorrowRecords = borrowRecordRepository.findAllByCreatedAtIn(preivousYearMonth.getYear(), preivousYearMonth.getMonthValue());
        if (borrowRecords.isEmpty()) {
            borrowRecords = borrowRecordRepository.findAllByCreatedAtIn(currentYearMonth.minusMonths(1).getYear(), currentYearMonth.minusMonths(1).getMonthValue());
            previousBorrowRecords = borrowRecordRepository.findAllByCreatedAtIn(preivousYearMonth.minusMonths(1).getYear(), preivousYearMonth.minusMonths(1).getMonthValue());
        }
        return calculatePercentageChange(borrowRecords.size(), previousBorrowRecords.size());
    }

    public List<Map.Entry<Book, Integer>> top10MostBooks() {
        Map<Book, Integer> result = new HashMap<>();
        YearMonth currentYearMonth = YearMonth.now();
        List<BorrowRecord> borrowRecords = borrowRecordRepository.findAllByCreatedAtIn(currentYearMonth.getYear(), currentYearMonth.getMonthValue());

        if (borrowRecords.isEmpty()) {
            currentYearMonth = currentYearMonth.minusMonths(1);
            borrowRecords = borrowRecordRepository.findAllByCreatedAtIn(currentYearMonth.getYear(), currentYearMonth.getMonthValue());
        }
        for (BorrowRecord borrowRecord : borrowRecords) {
            List<Book> books = borrowRecord.getBooks();
            for (Book book : books) {
                result.put(book, result.getOrDefault(book, 0) + 1);
            }
        }
        return result.entrySet().stream()
                .sorted(Map.Entry.<Book, Integer>comparingByValue().reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    public Map<String, Double> getBookCategoryBorrowingPercentage() {
        YearMonth currentMonth = YearMonth.now();
        List<BorrowRecord> borrowRecords = borrowRecordRepository.findAllByCreatedAtIn(currentMonth.getYear(), currentMonth.getMonthValue());
        Map<Category, Integer> categoryCount = new HashMap<>();
        // Tính tổng số lần mượn cho từng thể loại sách
        for (BorrowRecord borrowRecord : borrowRecords) {
            List<Book> books = borrowRecord.getBooks();
            for (Book book : books) {
                List<Category> categories = book.getCategories();
                for (Category category : categories) {
                    categoryCount.put(category, categoryCount.getOrDefault(category, 0) + 1);
                }
            }
        }

        // Tính tổng số lần mượn tất cả các thể loại
        int total = categoryCount.values().stream().mapToInt(Integer::intValue).sum();
        if (total == 0) {

            currentMonth = currentMonth.minusMonths(1);
            borrowRecords = borrowRecordRepository.findAllByCreatedAtIn(currentMonth.getYear(), currentMonth.getMonthValue());
            categoryCount = new HashMap<>();
            // Tính tổng số lần mượn cho từng thể loại sách
            for (BorrowRecord borrowRecord : borrowRecords) {
                List<Book> books = borrowRecord.getBooks();
                for (Book book : books) {
                    List<Category> categories = book.getCategories();
                    for (Category category : categories) {
                        categoryCount.put(category, categoryCount.getOrDefault(category, 0) + 1);
                    }
                }
            }

            total = categoryCount.values().stream().mapToInt(Integer::intValue).sum();
        }

        // Tính phần trăm cho từng thể loại sách
        Map<String, Double> result = new HashMap<>();
        for (Map.Entry<Category, Integer> entry : categoryCount.entrySet()) {
            double percentage = (entry.getValue() * 100.0) / total;
            result.put(entry.getKey().getName(), percentage); // Giả sử Category có phương thức getName()
        }
        return result;
    }

    public Map<YearMonth, Long> getMonthlyBorrowingStatistics() {
        List<Object[]> results = borrowRecordRepository.getMonthlyBorrowingStatistics();
        Map<YearMonth, Long> statistics = new HashMap<>();
        for (Object[] result : results) {
            int year = (int) result[0];
            int month = (int) result[1];
            long count = (long) result[2];
            statistics.put(YearMonth.of(year, month), count);
        }
        return statistics;
    }

    private double calculatePercentageChange(long current, long previous) {
        if (previous == 0) {
            return current == 0 ? 0 : 100;
        }
        return ((double) (current - previous) / previous) * 100;
    }

}