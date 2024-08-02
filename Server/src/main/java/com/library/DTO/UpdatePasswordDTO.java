package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;

@AllArgsConstructor
@Data
public class UpdatePasswordDTO implements Serializable {
    private String currentPassword;
    private String newPassword;
}