package com.library.Controller.Admin;


import com.library.Model.Category;
import com.library.Service.CategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/categories")
public class CategoryController {
    private static final Logger logger = LoggerFactory.getLogger(GlobalControllerAdvice.class);
    private final CategoryService categoryService;


    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }


    @GetMapping("")
    public String categories(Model model) {
        List<Category> categories = categoryService.getAllCategories();
        model.addAttribute("categoryList", categories);
        model.addAttribute("pageTitle", "Các thể loại");
        return "categories";
    }

    @GetMapping("/{id}")
    public String viewAuthor(@PathVariable("id") Long categoryId, Model model) {
        Optional<Category> category = categoryService.getCategoryById(Math.toIntExact(categoryId));
        if (category.isPresent()) {
            Category result = category.get();

            model.addAttribute("category", result);
            model.addAttribute("pageTitle", result.getName());
        }
        return "category";
    }

    @PostMapping("/update")
    public ResponseEntity<Category> updateCategory(@RequestParam("id") int id, @RequestParam("name") String name) {

        Category category = categoryService.getCategoryById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid category Id:" + id));

        // Cập nhật thông tin và lưu
        category.setName(name);
        categoryService.saveOrUpdateCategory(category);

        return ResponseEntity.ok(category);
    }
}
