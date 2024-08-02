package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
public class BorrowRecordUpdateRequest implements Serializable {
    private String status;
    private List<BookConditionDTO> books;
    private String cancelReason;

}