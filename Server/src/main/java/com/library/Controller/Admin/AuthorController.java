package com.library.Controller.Admin;

import com.library.Model.Author;
import com.library.Service.AuthorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/authors")
public class AuthorController {
    private static final Logger logger = LoggerFactory.getLogger(GlobalControllerAdvice.class);
    private final AuthorService authorService;

    @Autowired
    public AuthorController(AuthorService authorService) {
        this.authorService = authorService;
    }

    @GetMapping("")
    public String authors(Model model) {
        List<Author> authorList = authorService.getAllAuthorsWithBook();
        model.addAttribute("pageTitle", "Danh sách tác giả");
        model.addAttribute("authorList", authorList);
        return "authors";
    }

    @GetMapping("/{id}")
    public String viewAuthor(@PathVariable("id") Long authorId, Model model) {
        Optional<Author> author = authorService.getAuthorById(Math.toIntExact(authorId));
        if (author.isPresent()) {
            Author result = author.get();
            result.setBooks(authorService.getBooksByAuthorId(result.getId()));
            model.addAttribute("author", result);

            model.addAttribute("pageTitle", result.getName());
        }
        return "author";
    }
    @PostMapping("/update")
    public ResponseEntity<Author> updateAuthor(@RequestParam("id") int id, @RequestParam("name") String name) {
        // Lấy author cần cập nhật
        Author author = authorService.getAuthorById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid author Id:" + id));

        // Cập nhật thông tin và lưu
        author.setName(name);
        authorService.saveOrUpdateAuthor(author);
        logger.info("erro" + author);
        return ResponseEntity.ok(author);
    }
}
