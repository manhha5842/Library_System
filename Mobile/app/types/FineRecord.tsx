import { BookView } from "./BookView";

export type FineRecord = {
    id: string;
    books: BookView;
    fineReason: string;
    fineAmount: number;
    fineDate: string;
    dueDate: string;
    paymentDate: string | null;
    status: string;
    createdAt: string;
};