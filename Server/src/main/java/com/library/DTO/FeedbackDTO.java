package com.library.DTO;

import com.library.Model.Enum.FeedbackPurpose;
import com.library.Model.Enum.FeedbackStatus;
import lombok.Data;

import java.sql.Timestamp;

@Data
public class FeedbackDTO {
    private long id;
    private long studentId;
    private FeedbackPurpose purpose;
    private String content;
    private String image;
    private String reason;
    private String proposedSolution;
    private FeedbackStatus status;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private String reply;
    private long handledById;
}