package com.library.Controller.Admin;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(GlobalControllerAdvice.class);

    @GetMapping("/login")
    public String showLogin(Model model) {
        model.addAttribute("pageTitle", "Đăng nhập");
        return "login";
    }

    @GetMapping("/logged_out")
    public String showLogout(Model model) {
        model.addAttribute("pageTitle", "Đăng xuất");
        return "logout";
    }

    @PostMapping("/perform_logout")
    public String performLogout(HttpServletRequest request, HttpServletResponse response) {
        logger.info("Perform logout");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            new SecurityContextLogoutHandler().logout(request, response, auth);
        }
        return "redirect:/logged_out";
    }

}
