package com.library.Repository;

import com.library.Model.Major;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MajorRepository extends JpaRepository<Major, Integer> {
    Optional<Major> findByName(String name);
    Optional<Major> findById(Long id);

}
