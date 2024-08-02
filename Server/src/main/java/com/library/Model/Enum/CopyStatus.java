package com.library.Model.Enum;

import lombok.Getter;

@Getter
public enum CopyStatus {
    AVAILABLE("Có sẵn"),
    OFFLINE_ONLY("Chỉ được mượn tại thư viện"),
    BORROWED("Đã được muợn"),
    LOST("Bị mất"),
    DAMAGED("Bị hỏng"),
    DESTROYED("Bị tiêu huỷ"); // sách bị tiêu hủy

    private final String displayName;

    CopyStatus(String displayName) {
        this.displayName = displayName;
    }

    @Override
    public String toString() {
        return this.displayName;
    }
}