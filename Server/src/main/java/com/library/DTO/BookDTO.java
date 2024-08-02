package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
public class BookDTO implements Serializable {
    private String id;
    private String title;
    private List<AuthorDTO> author;
    private List<CategoryDTO> category;
    private String image;
    private String status;

}
