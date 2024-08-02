package com.library.Repository;

import com.library.Model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    List<Category> findByNameContainingAndStatusNot(String name, String status);

    Optional<Category> findByName(String trim);
}