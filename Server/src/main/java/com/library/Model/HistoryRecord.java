package com.library.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.library.DTO.HistoryRecordDTO;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "history_records")
@Data
public class HistoryRecord implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "timestamp", nullable = false)
    private Timestamp timestamp;

    @Column(name = "activity", nullable = false)
    private String activity;

    @Column(name = "performed_by", nullable = false)
    private String performedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrow_record_id", referencedColumnName = "id")
    @JsonBackReference
    private BorrowRecord borrowRecord;

    public HistoryRecordDTO transferDTO() {
        return new HistoryRecordDTO(
                this.timestamp,
                this.activity,
                this.performedBy
        );
    }
}