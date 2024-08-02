package com.library.Model.Enum;


public enum NotificationStatus {
    NEW("Mới"),
    SEEN("Đã xem");

    private final String displayName;

    NotificationStatus(String displayName) {
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