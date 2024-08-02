package com.library.Model;

import com.library.DTO.NotificationDTO;
import com.library.Model.Enum.NotificationStatus;
import com.library.Model.Enum.NotificationType;
import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

@Entity
@Data
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", referencedColumnName = "id")
    private Student student;

    @Column(name = "title")
    private String title;

    @Column(name = "body")
    private String body;

    @Column(name = "data")
    private String data;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private NotificationStatus status  ;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Timestamp(System.currentTimeMillis());
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }

    public NotificationDTO transferToDTO() {
        return new NotificationDTO(
                this.id,
                this.title,
                this.body,
                this.data,
                this.type.name(),
                this.status.name(),
                this.createdAt.toString(),
                this.updatedAt.toString()
        );
    }
}