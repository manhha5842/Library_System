package com.library.Model;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.library.DTO.MajorInfoDTO;
import com.library.Model.Enum.Status;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.util.Set;

@Entity
@Table(name = "majors")
@Data
public class Major implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "name")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;

    @OneToMany(mappedBy = "major")
    private Set<Student> students;

    @ManyToMany(mappedBy = "majors")
    @JsonManagedReference
    private Set<Category> categories;

    public MajorInfoDTO transferToMajorInfo() {
        return new MajorInfoDTO(this.id, this.name);
    }
}