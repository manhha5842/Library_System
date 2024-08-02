package com.library.Model;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.library.DTO.BookShortDTO;
import com.library.DTO.ReturnRecordDTO;
import com.library.Model.Enum.ReturnRecordStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "return_records")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ReturnRecord implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrow_record_id", referencedColumnName = "id")
    @JsonBackReference
    private BorrowRecord borrowRecord;


    @ManyToOne
    @JoinColumn(name = "librarian_id", referencedColumnName = "id")
    private Librarian librarian;

    @ManyToOne
    @JoinColumn(name = "book_id", referencedColumnName = "id")
    private Book book;

    @Column(name = "return_time")
    private Timestamp returnTime = new Timestamp(System.currentTimeMillis());

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ReturnRecordStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    @Column(name = "updated_at")
    private Timestamp updatedAt = new Timestamp(System.currentTimeMillis());

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }

    public ReturnRecordDTO transferToDTO() {
        BookShortDTO bookDTO = this.book.transferToBookShortDTO();
        return new ReturnRecordDTO(this.id,
                this.librarian != null ? librarian.getName() : "",
                bookDTO,
                this.returnTime.toString(),
                this.status.name());
    }
}