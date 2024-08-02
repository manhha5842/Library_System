package com.library.Model.Enum;

public enum ReturnRecordStatus {
    PENDING("Đang chờ trả"),
    LOST("Đã mất"),
    DAMAGED("Bị hư hỏng"),
    RETURNED("Đã trả");

    private final String displayName;

    ReturnRecordStatus(String displayName) {
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