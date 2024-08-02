package com.library.DTO;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class BookInfoDTO implements Serializable {
    private long id;
    private String title;
    private List<AuthorDTO> author;
    private List<CategoryDTO> category;
    private String description;
    private String image;
    private String publicationYear;
    private String publisher;
    private String language;
    private String isbn;
    private String format;
    private float price;
    private String status;

    public BookInfoDTO(long id, String title, List<AuthorDTO> author, List<CategoryDTO> category, String description, String image, String publicationYear, String publisher, String language, String isbn, String format, float price, String status) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.category = category;
        this.description = description;
        this.image = image;
        this.publicationYear = publicationYear;
        this.publisher = publisher;
        this.language = language;
        this.isbn = isbn;
        this.format = format;
        this.price = price;
        this.status = status;
    }
}
