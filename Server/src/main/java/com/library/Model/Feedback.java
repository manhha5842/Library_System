package com.library.Model;

import com.library.Model.Enum.FeedbackPurpose;
import com.library.Model.Enum.FeedbackStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "feedbacks")
@Data
public class Feedback implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", referencedColumnName = "id")
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "purpose", nullable = false)
    private FeedbackPurpose purpose;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "image")
    private String image;

    @Column(name = "reason")
    private String reason;

    @Column(name = "proposed_solution")
    private String proposedSolution;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private FeedbackStatus status = FeedbackStatus.NEW;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    @Column(name = "updated_at")
    private Timestamp updatedAt = new Timestamp(System.currentTimeMillis());

    @ManyToOne
    @JoinColumn(name = "handled_by", referencedColumnName = "id")
    private Librarian handledBy;

    @Column(name = "reply")
    private String reply;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }
}