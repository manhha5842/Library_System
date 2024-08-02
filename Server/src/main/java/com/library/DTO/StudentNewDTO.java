package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;

@AllArgsConstructor
@Data
public class StudentNewDTO implements Serializable {
    private int id;
    private String name;
    private String major;
    private String email;
    private String password;

}
