package com.library.Model.Enum;

public enum BorrowRecordStatus {
    PENDING("Đang chờ xử lý"),
    CANCELLED("Đã hủy"),
    BORROWED("Đã mượn"),
    RETURN_PENDING("Đang chờ trả"),
    COMPLETED("Hoàn thành"),
    OVERDUE("Quá hạn"),
    ARCHIVED("Lưu trữ");

    private final String displayName;

    BorrowRecordStatus(String displayName) {
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