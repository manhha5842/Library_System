package com.library.Model.Enum;

public enum FeedbackPurpose {
    REQUEST_NEW_BOOKS("Yêu cầu nhập thêm sách"),
    REPORT_FACILITY_ISSUES("Báo cáo cơ sở vật chất bị hỏng"),
    SUGGEST_SERVICE_IMPROVEMENTS("Đề xuất cải tiến dịch vụ"),
    FEEDBACK_STUDY_SPACE("Góp ý về không gian học tập"),
    FEEDBACK_STAFF("Phản hồi về nhân viên thư viện"),
    FEEDBACK_MANAGEMENT_SYSTEM("Phản hồi về hệ thống thư viện");

    private final String displayName;

    FeedbackPurpose(String displayName) {
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