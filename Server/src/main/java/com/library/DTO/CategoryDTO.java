package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;

@Data
@AllArgsConstructor
public class CategoryDTO implements Serializable {
    private long id;
    private String name;

}
