package com.library.Service;

import com.library.Model.Librarian;
import com.library.Repository.LibrarianRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class LibrarianService {
    private final LibrarianRepository librarianRepository;

    @Autowired
    public LibrarianService(LibrarianRepository librarianRepository) {
        this.librarianRepository = librarianRepository;
    }

    public Librarian getCurrentLibrarian() {

        OAuth2User principal = (OAuth2User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Map<String, Object> attributes = principal.getAttributes();
        String email= (String) attributes.get("email");
        return librarianRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Librarian not found"));
    }
}