package com.library.Model.Enum;

public enum FeedbackStatus {
    NEW("Mới"),
    NOTED("Đã ghi nhận"),
    REJECTED("Bị từ chối");

    private final String displayName;

    FeedbackStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return this.displayName;
    }
}