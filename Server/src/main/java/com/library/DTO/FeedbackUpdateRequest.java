package com.library.DTO;

import com.library.Model.Enum.FeedbackStatus;

public class FeedbackUpdateRequest {
    private FeedbackStatus status;
    private String content;

    // Getters và setters
    public FeedbackStatus getStatus() {
        return status;
    }

    public void setStatus(FeedbackStatus status) {
        this.status = status;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}