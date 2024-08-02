export type RootStackParamList = {
    Intro: undefined;
    HomePage: undefined;
    SearchPage: undefined;
    ProfilePage: undefined;
    NotificationPage: undefined;
    BookList: {
        authorId?: string;
        categoryId?: string;
        categoryName?: string;
        authorName?: string;
        title?: string;
        isbn?: string;
        keyword?: string;
    };
    BookListSearch: {
        keyword?: string;
    };
    SearchBook: undefined;
    HomeTabs: undefined;
    Category: undefined;
    FeedbackPage: undefined;
    BookDetail: { bookId: string };
    BorrowRecordDetailPage: { borrowRecordId: string };
    FineRecordDetail: { borrowRecordId: string };
    RenewalRequestPage: { borrowRecordId: string };
    Cart: { isDefault: boolean };
    BorrowRequest: { selectedBookIds: string[], selectDate?: string | null, dueDate?: string | null };
    HistoryBorrowRecord: undefined;
    HistoryFineRecord: undefined;
    HistoryFeedback: undefined;
    FeedbackDetail: { feedbackId: string };

};