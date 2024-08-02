package com.library.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.library.DTO.CategoryDTO;
import com.library.Model.Enum.Status;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "categories")
@Data
public class Category implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "name")
    private String name;

    @ManyToMany(mappedBy = "categories")
    @JsonBackReference
    private List<Book> books;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;

    @ManyToMany
    @JoinTable(
            name = "category_major",
            joinColumns = @JoinColumn(name = "category_id"),
            inverseJoinColumns = @JoinColumn(name = "major_id")
    )
    @JsonBackReference
    private Set<Major> majors;

    // Phương thức chuyển đổi Category sang CategoryDTO
    public CategoryDTO transferToCategoryDTO() {
        return new CategoryDTO(this.id, this.name);
    }
}