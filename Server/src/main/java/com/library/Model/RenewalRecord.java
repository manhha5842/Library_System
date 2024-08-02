package com.library.Model;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.library.DTO.RenewalRecordDTO;
import com.library.Model.Enum.RenewalRecordStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.sql.Date;
import java.sql.Timestamp;

@Entity
@Table(name = "renewal_records")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RenewalRecord implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrow_record_id", referencedColumnName = "id")
    @JsonBackReference
    private BorrowRecord borrowRecord;

    @ManyToOne
    @JoinColumn(name = "librarian_id", referencedColumnName = "id")
    private Librarian librarian;

    @Column(name = "original_borrow_date")
    private Date originalBorrowDate;

    @Column(name = "original_due_date")
    private Date originalDueDate;

    @Column(name = "request_borrow_date")
    private Date requestBorrowDate;

    @Column(name = "request_due_date")
    private Date requestDueDate;

    @Column(name = "note")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RenewalRecordStatus status;


    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    @Column(name = "updated_at")
    private Timestamp updatedAt = new Timestamp(System.currentTimeMillis());

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }

    public RenewalRecordDTO transferToDTO() {
        return new RenewalRecordDTO(
                this.id,
                this.originalBorrowDate != null ? this.originalBorrowDate.toString() : null,
                this.originalDueDate != null ? this.originalDueDate.toString() : null,
                this.requestBorrowDate != null ? this.requestBorrowDate.toString() : null,
                this.requestDueDate != null ? this.requestDueDate.toString() : null,
                this.note,
                this.status != null ? this.status.name() : null,
                this.createdAt != null ? this.createdAt.toString() : null
        );
    }
}
