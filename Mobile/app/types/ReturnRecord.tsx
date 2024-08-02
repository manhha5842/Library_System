import { BookView } from "./BookView";

export type ReturnRecord = {
    id: number;
    librarian: string;
    book: BookView;
    returnTime: string;
    status: string;
};