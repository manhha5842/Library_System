package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;


@Data
@AllArgsConstructor
public class ReturnRecordDTO implements Serializable {
    private Long id;
    private String librarian;
    private BookShortDTO book;
    private String returnTime;
    private String status;
}