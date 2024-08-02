package com.library.Security;

import com.library.Service.CustomOAuth2UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
@Component
public class CustomAuthenticationFailureHandler
        implements AuthenticationFailureHandler {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {

        logger.error("Lỗi đăng nhập: " + exception.getMessage());

        // Thêm thông báo lỗi vào request attribute để hiển thị trên UI
        request.setAttribute("error", "Email không tồn tại trong hệ thống");

        // Chuyển hướng trở lại trang đăng nhập với thông báo lỗi
        request.getRequestDispatcher("/login?error")
                .forward(request, response);
    }
}