package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;

@AllArgsConstructor
@Data
public class StudentRegistrationDTO implements Serializable {
    private String name;
    private String email;
    private String password;
    private int majorId;
}
