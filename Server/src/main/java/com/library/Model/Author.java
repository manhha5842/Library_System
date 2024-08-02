package com.library.Model;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.library.DTO.AuthorDTO;
import com.library.Model.Enum.Status;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Entity
@Table(name = "authors")
@Data
public class Author implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "name", nullable = false)
    private String name;


    @ManyToMany(mappedBy = "authors")
    @JsonBackReference
    private List<Book> books;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;



    public AuthorDTO transferToAuthorDTO() {
        return new AuthorDTO(this.id, this.name);
    }
}