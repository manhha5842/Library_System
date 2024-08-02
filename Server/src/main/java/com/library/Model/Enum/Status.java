package com.library.Model.Enum;

public enum Status {
    ACTIVE("Hoạt động"),
    INACTIVE("Không hoạt động"),
    DELETED("Đã xóa");

    private final String displayName;

    Status(String displayName) {
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