package com.library.Service;

import com.library.Model.Librarian;
import com.library.Repository.LibrarianRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private LibrarianRepository librarianRepository;
    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        logger.info("Đăng nhập bằng " + userRequest.getClientRegistration().getRegistrationId());
        logger.info("Tên người dùng: " + oauth2User.getName());
        logger.info("Thuộc tính người dùng: " + oauth2User.getAttributes());

        return processOAuthUser(oauth2User);
    }

    private OAuth2User processOAuthUser(OAuth2User oauth2User) {
        Map<String, Object> attributes = oauth2User.getAttributes();
        String email = (String) attributes.get("email");

        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("email_not_found"), "Email không tìm thấy từ nhà cung cấp OAuth2");
        }

        Optional<Librarian> librarianOptional = librarianRepository.findByEmail(email);

        if (!librarianOptional.isPresent()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("user_not_found"), "User không tìm thấy trong cơ sở dữ liệu");
        }

        Librarian librarian = librarianOptional.get();

        logger.info("User found: " + librarian.getEmail() + ", Role: " + librarian.getRole());

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + librarian.getRole())),
                attributes,
                "email"
        );
    }
}