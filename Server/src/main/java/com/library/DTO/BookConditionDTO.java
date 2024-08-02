package com.library.DTO;

import lombok.Data;

import java.io.Serializable;

@Data
public class BookConditionDTO implements Serializable {
    private Long bookId;
    private String condition;

}