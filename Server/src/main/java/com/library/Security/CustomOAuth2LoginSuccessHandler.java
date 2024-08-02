package com.library.Security;

import com.library.Model.CustomOAuth2User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomOAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2LoginSuccessHandler.class);

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        logger.info("Đăng nhập thành công");
        setDefaultTargetUrl("/"); // Chuyển hướng sau khi đăng nhập thành công

        if (authentication.getPrincipal() instanceof CustomOAuth2User) {
            CustomOAuth2User oauthUser = (CustomOAuth2User) authentication.getPrincipal();
            String email = oauthUser.getEmail();
            logger.info("Email người dùng: " + email); // Log thêm thông tin email để kiểm tra
            request.getSession().setAttribute("email", email);
        }

        super.onAuthenticationSuccess(request, response, authentication);
    }
}