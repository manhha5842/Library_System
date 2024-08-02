package com.library.Controller.API;

import com.library.DTO.NotificationDTO;
import com.library.Model.Enum.NotificationStatus;
import com.library.Model.Enum.NotificationType;
import com.library.Model.Notification;
import com.library.Model.Student;
import com.library.Service.NotificationService;
import com.library.Service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationAPIController {

    @Autowired
    private NotificationService notificationService;
    @Autowired
    private StudentService studentService;

    @GetMapping
    public ResponseEntity<?> getAllNotifications() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Student auth) {
                Student student = studentService.getStudentByEmail(auth.getEmail())
                        .orElseThrow(() -> new IllegalStateException("Could not find student"));

                return ResponseEntity.ok(notificationService.getNotificationsByStudent(student).stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException e) {
            System.out.println(e);
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/paged")
    public ResponseEntity<?> getAllNotifications(Pageable pageable) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Student auth) {
                Student student = studentService.getStudentByEmail(auth.getEmail())
                        .orElseThrow(() -> new IllegalStateException("Could not find student"));

                return ResponseEntity.ok(notificationService.getNotificationsByStudent(student, pageable).stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException e) {
            System.out.println(e);
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationDTO> getNotificationById(@PathVariable Long id) {
        return notificationService.getNotificationById(id)
                .map(notification -> ResponseEntity.ok(convertToDTO(notification)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }



    @PutMapping("/{id}")
    public ResponseEntity<NotificationDTO> updateNotification(@PathVariable Long id, @RequestBody NotificationDTO notificationDTO) {
        return notificationService.getNotificationById(id)
                .map(existingNotification -> {
                    Notification notification = convertToEntity(notificationDTO);
                    notification.setId(existingNotification.getId());
                    return ResponseEntity.ok(convertToDTO(notificationService.saveOrUpdateNotification(notification)));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }



    @GetMapping("/status/{status}")
    public List<NotificationDTO> getNotificationsByStatus(@PathVariable NotificationStatus status) {
        return notificationService.getNotificationsByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/status/{status}/paged")
    public Page<NotificationDTO> getNotificationsByStatus(@PathVariable NotificationStatus status, Pageable pageable) {
        return notificationService.getNotificationsByStatus(status, pageable).map(this::convertToDTO);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        return new NotificationDTO(
                notification.getId(),
                notification.getTitle(),
                notification.getBody(),
                notification.getData(),
                notification.getType().name(),
                notification.getStatus().name(),
                notification.getCreatedAt().toString(),
                notification.getUpdatedAt().toString()
        );
    }

    private Notification convertToEntity(NotificationDTO notificationDTO) {
        Notification notification = new Notification();
        notification.setTitle(notificationDTO.getTitle());
        notification.setBody(notificationDTO.getBody());
        notification.setData(notificationDTO.getData());
        notification.setType(NotificationType.valueOf(notificationDTO.getType()));
        notification.setStatus(NotificationStatus.valueOf(notificationDTO.getStatus()));
        notification.setCreatedAt(Timestamp.valueOf(notificationDTO.getCreatedAt()));
        notification.setUpdatedAt(Timestamp.valueOf(notificationDTO.getUpdatedAt()));
        return notification;
    }
}