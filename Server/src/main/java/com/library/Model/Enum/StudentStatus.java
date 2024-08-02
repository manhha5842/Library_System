package com.library.Model.Enum;

public enum StudentStatus {

    ACTIVE( "Tài khoản đang hoạt động"),
    SUSPENDED( "Tài khoản bị đình chỉ"),
    CLOSED( "Tài khoản đã đóng"),
    PENDING( "Tài khoản đang chờ xác nhận"),
    OVERDUE( "Tài khoản quá hạn đền bù");

    private final String displayName;

    StudentStatus(String displayName) {
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