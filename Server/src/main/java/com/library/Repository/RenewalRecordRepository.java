package com.library.Repository;

import com.library.Model.*;
import com.library.Model.Enum.RenewalRecordStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RenewalRecordRepository extends JpaRepository<RenewalRecord, Integer> {

    Optional<RenewalRecord> findById(Long id);

    List<RenewalRecord> findByBorrowRecord(BorrowRecord borrowRecord);

    List<RenewalRecord> findByLibrarian(Librarian librarian);

    List<RenewalRecord> findByStatus(RenewalRecordStatus status);

    List<RenewalRecord> findByBorrowRecord_Student(Student student);

}
