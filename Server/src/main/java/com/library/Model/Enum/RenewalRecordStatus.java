package com.library.Model.Enum;

public enum RenewalRecordStatus {
    PENDING("Đang chờ xử lí"),
    ACCEPTED("Được chấp thuân"),
    CANCELLED("Bị từ chối"),
    OVERDUE("Hết hạn");

    private final String displayName;

    RenewalRecordStatus(String displayName) {
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