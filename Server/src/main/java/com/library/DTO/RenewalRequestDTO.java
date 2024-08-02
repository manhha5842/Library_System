package com.library.DTO;

import lombok.Data;

@Data
public class RenewalRequestDTO {
    private long borrowRecordId;
    private String requestBorrowDate;
    private String requestDueDate;
    private String note;
}