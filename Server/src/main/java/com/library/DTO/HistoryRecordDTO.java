package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;
import java.sql.Timestamp;

@Data
@AllArgsConstructor
public class HistoryRecordDTO implements Serializable {
    private Timestamp timestamp;
    private String activity;
    private String performedBy;


}