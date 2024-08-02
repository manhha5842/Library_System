import { BookView } from "./BookView";


export type BorrowRecord = {
    id: string;
    borrowDate: string;
    dueDate: string;
    status: string;
    books: BookView[];
    createdAt: string;
};