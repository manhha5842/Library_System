package com.library.Model;

import lombok.Data;

@Data
public class UserInformation {
    private String sub;
    private String name;
    private String picture;
    private String email;
    private boolean emailVerified;
    private String hd;
}
