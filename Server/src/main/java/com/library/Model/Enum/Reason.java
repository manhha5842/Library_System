package com.library.Model.Enum;

public enum Reason {
    DAMAGED_MINOR("Sách hỏng nhẹ"),
    DAMAGED_MAJOR("Sách hỏng nặng"),
    LOST("Mất sách"),
    LOST_OVEVERDUE("Mất do quá hạn trả sách"),
    LATE_RETURN("Trễ hạn trả sách"),
    LATE_FINE_PAYMENT("Trễ hạn nộp phạt");

    private final String displayName;

    Reason(String displayName) {
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