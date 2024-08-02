package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;

@AllArgsConstructor
@Data
public class UserLoginWithGoogleDTO implements Serializable {
    private String id;
    private String email;
    private String fullName;
    private String avatar;

}
