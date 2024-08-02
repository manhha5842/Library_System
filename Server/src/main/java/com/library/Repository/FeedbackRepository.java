package com.library.Repository;

import com.library.Model.Enum.FeedbackStatus;
import com.library.Model.Feedback;
import com.library.Model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Page<Feedback> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Feedback> findAllByOrderByCreatedAtDesc();

    Page<Feedback> findByStudentOrderByCreatedAtDesc(Student student, Pageable pageable);

    List<Feedback> findByStudentOrderByCreatedAtDesc(Student student);

    Page<Feedback> findByStudentAndStatusOrderByCreatedAtDesc(Student student, FeedbackStatus status, Pageable pageable);

    List<Feedback> findByStatusAndStudentOrderByCreatedAtDesc(FeedbackStatus status, Student student);

    Page<Feedback> findByStatusAndStudentOrderByCreatedAtDesc(FeedbackStatus status,Student student, Pageable pageable);

    List<Feedback> findByStatusInAndStudentOrderByCreatedAtDesc(Collection<FeedbackStatus> status, Student student);

    Page<Feedback> findByStatusInAndStudentOrderByCreatedAtDesc(List<FeedbackStatus> statuses,Student student, Pageable pageable);


}