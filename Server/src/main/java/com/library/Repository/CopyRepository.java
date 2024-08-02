package com.library.Repository;

import com.library.Model.Book;
import com.library.Model.Copy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CopyRepository extends JpaRepository<Copy, Integer> {

    Optional<Copy> findById(Long id);

    List<Copy> findCopiesByBook(Book book);
    @Query("SELECT COUNT(c) FROM Copy c WHERE c.status = 'BORROWED'")
    long countBooksBorrowing();


}
