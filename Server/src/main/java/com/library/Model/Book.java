package com.library.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.library.DTO.*;
import com.library.Model.Enum.CopyStatus;
import com.library.Model.Enum.Status;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "books")
@Data
public class Book implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "image")
    private String image;

    @Column(name = "publication_year")
    private String publicationYear;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "publisher_id", referencedColumnName = "id")
    private Publisher publisher;

    @Column(name = "language")
    private String language;

    @Column(name = "ISBN")
    private String isbn;

    @Column(name = "format")
    private String format;

    @Column(name = "price")
    private float price;

    @ManyToMany
    @JoinTable(
            name = "book_category",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @JsonManagedReference
    private List<Category> categories;


    @ManyToMany
    @JoinTable(
            name = "book_author",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "author_id")
    )
    @JsonManagedReference
    private List<Author> authors;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;

    @ManyToMany(mappedBy = "books")
    @JsonIgnore
    private List<BorrowRecord> borrowRecords;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<FineRecord> fineRecords;


    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Copy> copies;

    public BookShortDTO transferToBookShortDTO() {
        List<String> authors = this.authors.stream()
                .map(Author::getName)
                .collect(Collectors.toList());
        return new BookShortDTO(this.id, this.title,authors,this.image);
    }

    public BookDTO transferToBookDTO() {
        List<AuthorDTO> authors = this.authors.stream()
                .map(Author::transferToAuthorDTO)
                .collect(Collectors.toList());
        List<CategoryDTO> categories = this.categories.stream()
                .map(Category::transferToCategoryDTO)
                .collect(Collectors.toList());
        String status = !this.copies.
                stream()
                .filter(c -> c.getStatus().equals(CopyStatus.AVAILABLE))
                .toList().isEmpty()
                ? "ACTIVE"
                : "INACTIVE";

        return new BookDTO(String.valueOf(this.id), this.title, authors, categories, this.image, status);
    }
    public BookInfoDTO transferToBookInfoDTO() {
        List<AuthorDTO> authorDTOs = this.authors.stream()
                .map(author -> new AuthorDTO(author.getId(), author.getName()))
                .collect(Collectors.toList());
        List<CategoryDTO> categoryDTOs = this.categories.stream()
                .map(Category::transferToCategoryDTO)
                .collect(Collectors.toList());
        String status = !this.copies.
                stream()
                .filter(c -> c.getStatus().equals(CopyStatus.AVAILABLE))
                .toList().isEmpty()
                ? "ACTIVE"
                : !this.copies.
                stream()
                .filter(c -> c.getStatus().equals(CopyStatus.OFFLINE_ONLY))
                .toList().isEmpty()
                ? "OFFLINE_ONLY"
                : "INACTIVE";
        return new BookInfoDTO(this.id,
                this.title,
                authorDTOs,
                categoryDTOs,
                this.description,
                this.image,
                this.publicationYear,
                this.publisher.getName(),
                this.language, this.isbn,
                this.format,
                this.price,
                status);
    }
}