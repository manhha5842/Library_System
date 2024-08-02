package com.library.Controller.API;

import com.library.Security.JwtTokenProvider;
import com.library.DTO.CategoryDTO;
import com.library.Model.Category;
import com.library.Service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryAPIController {

    @Autowired
    private CategoryService categoryService;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @GetMapping("/getAll")
    public ResponseEntity<?> getAll() {
        System.out.println("đang lấy danh sách category");
        List<Category> categories = categoryService.getAllCategories();
        if (categories.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else {
            List<CategoryDTO> result = new ArrayList<>();
            for (Category category : categories) {
                result.add(category.transferToCategoryDTO());
            }
        }
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/getCategoriesById/{id}")
    public ResponseEntity<?> getCategoriesById(@PathVariable("id") int id) {
        System.out.println("đang lấy category");
        if (categoryService.getCategoryById(id).isPresent()) {
            Category category = categoryService.getCategoryById(id).get();

            return ResponseEntity.ok(category.transferToCategoryDTO());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
