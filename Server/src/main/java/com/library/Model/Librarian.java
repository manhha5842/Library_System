package com.library.Model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.library.DTO.LibrarianDTO;
import com.library.Model.Enum.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;
import java.util.Set;

@Entity
@Table(name = "librarians")
@Data
@AllArgsConstructor
public class Librarian implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false)
    private String email;

    @JsonIgnore
    @Column(name = "password")
    private String password;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "role")
    private int role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;

    @OneToMany(mappedBy = "librarian")
    private Set<RenewalRecord> renewalRecords;

    @OneToMany(mappedBy = "librarian")
    private Set<ReturnRecord> returnRecords;


    public Librarian() {
    }

    public LibrarianDTO transferToDTO() {
        return new LibrarianDTO(this.id, this.name, this.email);
    }
}
