package com.library.Model.Enum;

public enum FineRecordStatus {
    PENDING("Đang chờ thanh toán    "),
    PAID("Đã thanh toán"),
    UNPAID("Chưa thanh toán");

    private final String displayName;

    FineRecordStatus(String displayName) {
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