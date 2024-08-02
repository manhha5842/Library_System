package com.library.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;

public class JwtTokenFilter extends GenericFilterBean {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2LoginSuccessHandler.class);
    private final JwtTokenProvider jwtTokenProvider;

    public JwtTokenFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain filterChain)
            throws IOException, ServletException {
        HttpServletRequest httpReq = (HttpServletRequest) req;
        // Log toàn bộ headers trong request
        logger.info("Headers: ");
        httpReq.getHeaderNames().asIterator().forEachRemaining(header ->
                logger.info(header + ": " + httpReq.getHeader(header)));

        String token = jwtTokenProvider.resolveToken(httpReq);
        logger.info("Token resolved: {}", token);

        if (token != null) {
            if (jwtTokenProvider.validateToken(token)) {
                Authentication auth = jwtTokenProvider.getAuthentication(token);
                if (auth != null) {
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    logger.info("Token hợp lệ và Authentication được thiết lập: {}", auth.getName());
                } else {
                    logger.warn("Authentication không thể thiết lập từ token: {}", token);
                }
            } else {
                logger.warn("Token không hợp lệ: {}", token);
            }
        } else {
            logger.warn("Không tìm thấy token trong request");
        }

        filterChain.doFilter(req, res);
    }
}