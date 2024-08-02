package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
public class BorrowRecordDTO implements Serializable {
    private long id;
    private String borrowDate;
    private String dueDate;
    private String note;
    private String status;
    private String cancelReason;
    private List<BookDTO> books;
    private String createdAt;
    private List<ReturnRecordDTO> returnRecords;
    private List<RenewalRecordDTO> renewalRecords;
    private List<FineRecordDTO> fineRecords;
}
