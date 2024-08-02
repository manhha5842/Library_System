package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
public class BorrowRecordAndFineRecordViewDTO implements Serializable {
    private long id;
    private String borrowDate;
    private String dueDate;
    private String status;
    private List<BookDTO> books;
    private String createdAt;
    private float unpaidAmount;
    private List<FineRecordDTO> fineRecords;
}
