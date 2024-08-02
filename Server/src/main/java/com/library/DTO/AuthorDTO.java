package com.library.DTO;

import lombok.Data;

import java.io.Serializable;

@Data
public class AuthorDTO implements Serializable {
    private long id;
    private String name;

    public AuthorDTO(long id, String name) {
        this.id = id;
        this.name = name;
    }
}
