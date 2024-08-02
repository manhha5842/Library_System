package com.library.Repository;

import com.library.Model.Enum.NotificationStatus;
import com.library.Model.Notification;
import com.library.Model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Notification> findByStudentOrderByCreatedAtDesc(Student student);

    Page<Notification> findByStudentOrderByCreatedAtDesc(Student student, Pageable pageable);

    List<Notification> findByStatusOrderByCreatedAtDesc(NotificationStatus status);

    Page<Notification> findByStatusOrderByCreatedAtDesc(NotificationStatus status, Pageable pageable);

}