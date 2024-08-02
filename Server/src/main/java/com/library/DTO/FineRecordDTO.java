package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;
import java.sql.Date;

@Data
@AllArgsConstructor
public class FineRecordDTO implements Serializable {
    private long id;
    private BookShortDTO books;
    private String fineReason;
    private float fineAmount;
    private Date fineDate;
    private Date dueDate;
    private Date paymentDate;
    private String status;
    private String createdAt;
}