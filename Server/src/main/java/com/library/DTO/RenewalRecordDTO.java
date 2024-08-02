package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;

@Data
@AllArgsConstructor
public class RenewalRecordDTO implements Serializable {
    private long id;
    private String originalBorrowDate;
    private String originalDueDate;
    private String requestBorrowDate;
    private String requestDueDate;
    private String note;
    private String status;
    private String createdAt;
}