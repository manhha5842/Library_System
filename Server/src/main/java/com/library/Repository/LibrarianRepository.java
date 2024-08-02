package com.library.Repository;

import com.library.Model.BorrowRecord;
import com.library.Model.Librarian;
import com.library.Model.RenewalRecord;
import com.library.Model.ReturnRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LibrarianRepository extends JpaRepository<Librarian, Integer> {


    Optional<Librarian> findByEmail(String email);


}
