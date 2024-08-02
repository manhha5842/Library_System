package com.library.Model.Enum;

public enum BookCondition {
    GOOD("Tốt"),
    DAMAGED_MINOR("Hỏng nhẹ"),
    DAMAGED_MAJOR("Hỏng nặng"),
    LOST("Mất");

    private final String displayName;

    BookCondition(String displayName) {
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