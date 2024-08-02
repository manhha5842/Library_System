package com.library.Controller.API;


import com.library.DTO.NotificationDTO;
import com.library.Model.Student;
import com.library.Service.NotificationService;
import com.library.Service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/student")
public class StudentAPIController {

    @Autowired
    private NotificationService notificationService;
    @Autowired
    private StudentService studentService;

    @GetMapping("/{id}/notifications")
    public ResponseEntity<List<NotificationDTO>> getNotifications(@PathVariable Long id) {
        List<NotificationDTO> notifications = notificationService.getNotificationsByStudentId(id);
        return ResponseEntity.ok(notifications);
    }




}