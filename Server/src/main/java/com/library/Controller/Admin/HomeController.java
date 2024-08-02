package com.library.Controller.Admin;

import com.library.Service.StatisticService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    private final StatisticService statisticService;

    public HomeController(StatisticService statisticService) {
        this.statisticService = statisticService;
    }

    @GetMapping("/")
    public String home(Model model) {


        // Tổng số sinh viên mượn sách trong tháng hiện tại
        model.addAttribute("totalStudentsBorrowingBooksInMonth", statisticService.getTotalStudentsBorrowingBooksInMoth());

        // Phần trăm thay đổi số lượng sinh viên mượn sách so với tháng trước
        model.addAttribute("studentBorrowingBooksChangePercentage", formatPercentage(statisticService.getStudentBorrowingBooksChangePercentage()));
        model.addAttribute("checkStudentBorrowingBooksChangePercentage", statisticService.getStudentBorrowingBooksChangePercentage()>0);

        // Tổng số đơn mượn sách trong tháng hiện tại
        model.addAttribute("totalBorrowRecordsInMonth", statisticService.getTotalBorrowRecordsInMonth());

        // Phần trăm thay đổi số đơn mượn sách so với tháng trước
        model.addAttribute("borrowRecordsChangePercentage", formatPercentage(statisticService.getBorrowRecordsChangePercentage()));
        model.addAttribute("checkBorrowRecordsChangePercentage", statisticService.getBorrowRecordsChangePercentage()>0);

        // Tổng số sách chưa trả
        model.addAttribute("totalBooksBorrowed", statisticService.getTotalBooksBorrowed());


        // Danh sách top 10 sách được mượn nhiều nhất cùng với số lượt mượn
        model.addAttribute("top10MostBorrowedBooks", statisticService.top10MostBooks());

        // Phần trăm mượn sách theo từng thể loại
        model.addAttribute("bookCategoryBorrowingPercentage", statisticService.getBookCategoryBorrowingPercentage());

        // Thống kê mượn sách theo từng tháng trong năm
        model.addAttribute("monthlyBorrowingStatistics", statisticService.getMonthlyBorrowingStatistics());
        model.addAttribute("pageTitle", "Tổng quan");
        return "index";
    }

    private String formatPercentage(double value) {
        return String.format("%d %%", (int) value);
    }



}
