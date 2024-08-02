package com.library.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.library.DTO.*;
import com.library.Model.Enum.BorrowRecordStatus;
import com.library.Model.Enum.FineRecordStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.sql.Date;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "borrow_records")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BorrowRecord implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference
    @JoinColumn(name = "student_id", referencedColumnName = "id")
    private Student student;

    @Column(name = "borrow_date")
    private Date borrowDate;

    @Column(name = "due_date")
    private Date dueDate;

    @Column(name = "note")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BorrowRecordStatus status;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @ManyToOne
    @JoinColumn(name = "librarian_id", referencedColumnName = "id")
    private Librarian librarian;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "borrow_record_book",
            joinColumns = @JoinColumn(name = "borrow_record_id"),
            inverseJoinColumns = @JoinColumn(name = "book_id")
    )
    private List<Book> books;

    @JsonManagedReference
    @OneToMany(mappedBy = "borrowRecord", fetch = FetchType.LAZY)
    private List<RenewalRecord> renewalRecords;

    @JsonManagedReference
    @OneToMany(mappedBy = "borrowRecord", fetch = FetchType.LAZY)
    private List<ReturnRecord> returnRecords;

    @JsonManagedReference
    @OneToMany(mappedBy = "borrowRecord", fetch = FetchType.LAZY)
    private List<FineRecord> fineRecords;

    @JsonManagedReference
    @OneToMany(mappedBy = "borrowRecord", fetch = FetchType.LAZY)
    private List<HistoryRecord> historyRecords;

    @Column(name = "updated_at")
    private Timestamp updatedAt = new Timestamp(System.currentTimeMillis());

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }

    public BorrowRecordDTO transferToDTO() {
        List<BookDTO> bookDTOs = this.books.stream()
                .map(Book::transferToBookDTO)
                .collect(Collectors.toList());

        List<ReturnRecordDTO> returnRecordDTOList = new ArrayList<>();

        if (this.returnRecords !=null ) {
            returnRecordDTOList = this.returnRecords.stream()
                    .map(ReturnRecord::transferToDTO)
                    .toList();
        }
        List<RenewalRecordDTO> renewalRecordDTOList = new ArrayList<>();
        if (this.renewalRecords !=null ) {
            renewalRecordDTOList = this.renewalRecords.stream()
                    .map(RenewalRecord::transferToDTO)
                    .toList();
        }



        List<FineRecordDTO> fineRecordDTOList = new ArrayList<>();
        if (this.fineRecords != null) {
            fineRecordDTOList = this.fineRecords.stream()
                    .map(FineRecord::transferToDTO)
                    .toList();
        }
        return new BorrowRecordDTO(
                this.id,
                this.borrowDate.toString(),
                this.dueDate.toString(),
                this.note,
                this.status.name(),
                this.cancelReason,
                bookDTOs,
                this.createdAt.toString(),
                returnRecordDTOList,
                renewalRecordDTOList,
                fineRecordDTOList);
    }

    public BorrowRecordShortDTO transferToShortDTO() {
        List<BookShortDTO> bookDTOs = this.books.stream()
                .map(Book::transferToBookShortDTO)
                .collect(Collectors.toList());
        return new BorrowRecordShortDTO(
                this.id,
                this.borrowDate.toString(),
                this.dueDate.toString(),
                this.status.name(),
                bookDTOs,
                this.createdAt.toString());
    }

    public BorrowAndFineRecordDTO transferToBorrowAndFineRecordDTO() {
        float totalFineAmount = this.fineRecords.stream()
                .map(FineRecord::getFineAmount)
                .reduce(0f, Float::sum);
        return new BorrowAndFineRecordDTO(
                this.id,
                this.student,
                this.borrowDate,
                this.dueDate,
                this.note,
                this.status,
                this.cancelReason,
                this.librarian,
                this.books,
                this.fineRecords,
                totalFineAmount,
                this.createdAt,
                this.updatedAt
        );
    }
    public BorrowRecordAndFineRecordViewDTO transferToBorrowRecordAndFineRecordViewDTO() {
        List<BookDTO> bookDTOs = this.books.stream()
                .map(Book::transferToBookDTO)
                .collect(Collectors.toList());

        List<FineRecordDTO> fineRecordDTOList = new ArrayList<>();
        float unpaidAmount = 0f;

        if (this.fineRecords != null) {
            fineRecordDTOList = this.fineRecords.stream()
                    .map(FineRecord::transferToDTO)
                    .collect(Collectors.toList());

            unpaidAmount = this.fineRecords.stream()
                    .filter(fineRecord -> fineRecord.getStatus() == FineRecordStatus.PENDING || fineRecord.getStatus() == FineRecordStatus.UNPAID)
                    .map(FineRecord::getFineAmount)
                    .reduce(0f, Float::sum);
        }

        return new BorrowRecordAndFineRecordViewDTO(
                this.id,
                this.borrowDate.toString(),
                this.dueDate.toString(),
                this.status.name(),
                bookDTOs,
                this.createdAt.toString(),
                unpaidAmount,
                fineRecordDTOList
        );
    }
}