package com.library.Model.Enum;

public enum NotificationType {
    BORROW_RECORD("Thông báo đơn mượn sách"),
    FINE_RECORD("Thông báo phiếu phạt"),
    FEEDBACK("Thông báo đơn góp ý"),
    BOOK_UPDATE("Thông báo cập nhật sách"),
    SYSTEM_UPDATE("Thông báo hệ thống");

    private final String displayName;


    NotificationType(String displayName) {
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
