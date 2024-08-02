package com.library.DTO;

import com.library.Model.Book;
import com.library.Model.Enum.BorrowRecordStatus;
import com.library.Model.FineRecord;
import com.library.Model.Librarian;
import com.library.Model.Student;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;
import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;

@Data
@AllArgsConstructor
public class BorrowAndFineRecordDTO implements Serializable {
    private long id;
    private Student student;
    private Date borrowDate;
    private Date dueDate;
    private String note;
    private BorrowRecordStatus status;
    private String cancelReason;
    private Librarian librarian;
    private List<Book> books;
    private List<FineRecord> fineRecords;
    private float totalFineAmount;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}