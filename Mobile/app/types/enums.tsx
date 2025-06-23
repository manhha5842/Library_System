export enum BorrowRecordStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    BORROWED = 'BORROWED',
    RETURNED = 'RETURNED',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
}

export enum FineRecordStatus {
    PAID = 'PAID',
    UNPAID = 'UNPAID',
}

export enum FeedbackStatus {
    NEW = 'NEW',
    SEEN = 'SEEN',
    RESOLVED = 'RESOLVED',
}

export enum CopyStatus {
    AVAILABLE = 'AVAILABLE',
    INACTIVE = 'INACTIVE',
    OFFLINE_ONLY = 'OFFLINE_ONLY',
}
export enum ReturnRecordStatus {
    RETURNED = 'RETURNED',
    PENDING = 'PENDING',
    LOST = 'LOST',
    DAMAGE = 'DAMAGE',
}
