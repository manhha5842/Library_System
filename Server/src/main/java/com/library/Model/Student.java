package com.library.Model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.library.DTO.MajorInfoDTO;
import com.library.DTO.StudentInfoDTO;
import com.library.Model.Enum.StudentStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "students")
@Data
public class Student implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "email")
    private String email;

    @JsonIgnore
    @Column(name = "password")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StudentStatus status;

    @ManyToOne
    @JoinColumn(name = "major_id", referencedColumnName = "id")
    private Major major;

    @Column(name = "expo_push_token")
    private String expoPushToken="";

    @OneToMany(mappedBy = "student")
    private Set<Notification> notifications;

    @OneToMany(mappedBy = "student")
    @JsonManagedReference
    private List<BorrowRecord> borrowRecords;

    public StudentInfoDTO transferToStudentInfo(String token) {
        MajorInfoDTO majorInfoDTO = null;
        if (this.major != null) {
            majorInfoDTO = new MajorInfoDTO(this.major.getId(), this.major.getName());
        }
        return new StudentInfoDTO(this.id, this.name, this.email, this.status.name(), majorInfoDTO, token);
    }
}