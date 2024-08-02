import { BookView } from "./BookView";
import { RenewalRecord } from "./RenewalRecord";
import { FineRecord } from "./FineRecord";
import { ReturnRecord } from "./ReturnRecord";

export type FineRecordView = {
    id: string;
    borrowDate: string;
    dueDate: string; 
    status: string; 
    books: BookView[];
    createdAt: string; 
    unpaidAmount: number;
    fineRecords: FineRecord[];
};