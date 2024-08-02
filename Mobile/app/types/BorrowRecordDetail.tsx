import { BookView } from "./BookView"; 
import { RenewalRecord } from "./RenewalRecord";
import { FineRecord } from "./FineRecord";
import { ReturnRecord } from "./ReturnRecord";

export type BorrowRecordDetail = {
    id: string;
    borrowDate: string;
    dueDate: string;
    note: string;
    status: string;
    cancelReason: string | null;
    books: BookView[];
    createdAt: string;
    returnRecords: ReturnRecord[];
    renewalRecords: RenewalRecord[];
    fineRecords: FineRecord[];
};