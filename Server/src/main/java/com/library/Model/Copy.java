package com.library.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.library.Model.Enum.CopyStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "copies")
@Data
public class Copy implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "book_id", referencedColumnName = "id")
    private Book book;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private CopyStatus status;


    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    @Column(name = "updated_at")
    private Timestamp updatedAt = new Timestamp(System.currentTimeMillis());
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }

}