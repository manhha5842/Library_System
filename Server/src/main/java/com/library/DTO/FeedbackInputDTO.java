package com.library.DTO;

import com.library.Model.Enum.FeedbackPurpose;
import lombok.Data;

@Data
public class FeedbackInputDTO {
    private FeedbackPurpose purpose;
    private String content;
    private String reason;
    private String proposedSolution;
}