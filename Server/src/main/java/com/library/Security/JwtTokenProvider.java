package com.library.Security;

import com.library.Model.Student;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {
    @Value("${jwt.secret-key}")
    private String secretKey;

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2LoginSuccessHandler.class);

    // Tạo JWT token
    public String createToken(Student student) {
        Claims claims = Jwts.claims().setSubject(student.getEmail());
        claims.put("status", student.getStatus());

        Date now = new Date();
        long validityInMilliseconds = 360000000;
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    // Xác minh JWT token
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.error("Token không hợp lệ: {}", e.getMessage());
            return false;
        }
    }

    // Lấy thông tin người dùng từ JWT token
    public String getEmail(String token) {
        return Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token).getBody().getSubject();
    }

    public String getRole(String token) {
        return Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token).getBody().get("status").toString();
    }

    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    // Thêm log chi tiết trong các phương thức của JwtTokenProvider
    public Authentication getAuthentication(String token) {
        String roleStr = getRole(token);
        List<SimpleGrantedAuthority> authorities =
                Arrays.stream(roleStr.split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

        Student principal = new Student();
        principal.setEmail(getEmail(token));

        logger.info("Tạo đối tượng Authentication cho người dùng: {}, Quyền: {}", principal.getEmail(), authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

}