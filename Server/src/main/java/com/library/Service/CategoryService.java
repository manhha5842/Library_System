package com.library.Service;

import com.library.Model.Book;
import com.library.Model.Category;
import com.library.Model.Enum.Status;
import com.library.Repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Thêm mới hoặc cập nhật danh mục
    @Transactional
    public Category saveOrUpdateCategory(Category category) {
        return categoryRepository.save(category);
    }

    // Lấy tất cả danh mục (không bị DELETED)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll().stream()
                .filter(category -> !category.getStatus().equals("DELETED"))
                .collect(Collectors.toList());
    }

    // Lấy danh mục theo ID (nếu không bị DELETED)
    public Optional<Category> getCategoryById(long id) {
        return categoryRepository.findById((int) id)
                .filter(category -> !category.getStatus().equals("DELETED"));
    }

    // Tìm kiếm danh mục theo tên (không bị DELETED)
    public List<Category> searchCategoriesByName(String name) {
        return categoryRepository.findByNameContainingAndStatusNot(name, "DELETED");
    }

    // Lấy tất cả sách thuộc một danh mục
    public List<Book> getBooksByCategory(long categoryId) {
        Optional<Category> category = categoryRepository.findById((int) categoryId);
        return category.isPresent() ? category.get().getBooks() : null;
    }

    // Cập nhật trạng thái của danh mục (xóa bằng cách cập nhật trạng thái)
    @Transactional
    public boolean updateCategoryStatus(long id, Status status) {
        Optional<Category> category = categoryRepository.findById((int) id);
        if (category.isPresent()) {
            category.get().setStatus(status);
            categoryRepository.save(category.get());
            return true;
        }
        return false;
    }

    public Optional<Category> findByName(String trim) {
        return categoryRepository.findByName(trim);
    }
}