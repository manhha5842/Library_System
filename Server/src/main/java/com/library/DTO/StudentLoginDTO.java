package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;

@AllArgsConstructor
@Data
public class StudentLoginDTO implements Serializable {
    private String email;
    private String password;

}
