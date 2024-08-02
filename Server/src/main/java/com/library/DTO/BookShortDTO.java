package com.library.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
public class BookShortDTO implements Serializable {
    private long id;
    private String title;
    private List<String> author;
    private String image;


}

