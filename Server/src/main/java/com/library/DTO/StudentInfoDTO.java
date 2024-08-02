package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;

@AllArgsConstructor
@Data
public class StudentInfoDTO implements Serializable {
    private Long id;
    private String name;
    private String email;
    private String status;
    private MajorInfoDTO major;
    private String token;


}
