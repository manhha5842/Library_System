package com.library.Service;

import com.library.Model.Category;
import com.library.Model.Major;
import com.library.Model.Student;
import com.library.Repository.MajorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class MajorService {
    private final MajorRepository majorRepository;

    @Autowired
    public MajorService(MajorRepository majorRepository) {
        this.majorRepository = majorRepository;
    }

    // Lấy tất cả majors
    public List<Major> getAllMajors() {
        return majorRepository.findAll();
    }

    // Lấy major theo ID
    public Optional<Major> getMajorById(int id) {
        return majorRepository.findById(id);
    }

    // Lấy major theo tên
    public Optional<Major> getMajorByName(String name) {
        return majorRepository.findByName(name);
    }

    // Lấy tất cả sinh viên thuộc một major
    public Set<Student> getStudentsByMajor(int majorId) {
        Optional<Major> major = majorRepository.findById(majorId);
        return major.map(Major::getStudents).orElse(Collections.emptySet());
    }

    // Lấy tất cả categories liên quan đến một major
    public Set<Category> getCategoriesByMajor(int majorId) {
        Optional<Major> major = majorRepository.findById(majorId);
        return major.map(Major::getCategories).orElse(Collections.emptySet());
    }

    // Thêm một hoặc nhiều categories vào major
    @Transactional
    public void addCategoriesToMajor(int majorId, Set<Category> categories) {
        Major major = majorRepository.findById(majorId)
                .orElseThrow(() -> new IllegalArgumentException("Major not found with id " + majorId));
        major.getCategories().addAll(categories);
        majorRepository.save(major);
    }

    // Xoá category khỏi major
    @Transactional
    public void removeCategoryFromMajor(int majorId, Category category) {
        Major major = majorRepository.findById(majorId)
                .orElseThrow(() -> new IllegalArgumentException("Major not found with id " + majorId));
        major.getCategories().remove(category);
        majorRepository.save(major);
    }

    // Cập nhật thông tin major
    @Transactional
    public Major updateMajor(Major major) {
        return majorRepository.save(major);
    }

    // Thêm nhiều sinh viên vào major
    @Transactional
    public void addStudentsToMajor(int majorId, Set<Student> students) {
        Major major = majorRepository.findById(majorId)
                .orElseThrow(() -> new IllegalArgumentException("Major not found with id " + majorId));
        major.getStudents().addAll(students);
        majorRepository.save(major);
    }
}