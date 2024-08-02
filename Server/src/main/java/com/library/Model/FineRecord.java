package com.library.Model;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.library.DTO.FineRecordDTO;
import com.library.Model.Enum.Reason;
import com.library.Model.Enum.FineRecordStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.sql.Date;
import java.sql.Timestamp;

@Entity
@Table(name = "fine_records")
@Data
public class FineRecord implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrow_record_id", referencedColumnName = "id")
    @JsonBackReference
    private BorrowRecord borrowRecord;

    @ManyToOne
    @JoinColumn(name = "book_id", referencedColumnName = "id")
    @JsonBackReference
    private Book book;

    @Enumerated(EnumType.STRING)
    @Column(name = "fine_reason")
    private Reason fineReason;

    @Column(name = "fine_amount")
    private float fineAmount;

    @Column(name = "fine_date")
    private Date fineDate;

    @Column(name = "due_date")
    private Date dueDate;

    @Column(name = "payment_date")
    private Date paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private FineRecordStatus status;

    @ManyToOne
    @JoinColumn(name = "librarian_id", referencedColumnName = "id")
    private Librarian librarian;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    @Column(name = "updated_at")
    private Timestamp updatedAt = new Timestamp(System.currentTimeMillis());

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }

    public FineRecordDTO transferToDTO() {

        return new FineRecordDTO(this.id,
                this.book.transferToBookShortDTO(),
                this.fineReason.getDisplayName(),
                this.fineAmount,
                this.fineDate,
                this.dueDate,
                this.paymentDate,
                this.status.name(),
                this.createdAt.toString());
    }
}
