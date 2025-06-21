import { FineRecordStatus } from "./enums";

export type FineRecord = {
    id: string;
    borrowRecordId: string;
    amount: number;
    reason: string;
    fineDate: string;
    paymentDate: string | null;
    status: FineRecordStatus;
    createdAt: string;
};