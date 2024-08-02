package com.library.Model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.library.Model.Enum.Status;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Entity
@Table(name = "publishers")
@Data
public class Publisher implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "name")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;

    @OneToMany(mappedBy = "publisher")
    @JsonManagedReference
    private List<Book> books;
}