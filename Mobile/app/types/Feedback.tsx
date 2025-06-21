import { FeedbackStatus } from "./enums";

export type Feedback = {
    id: string;
    studentId: string;
    purpose: string;
    content: string;
    image: string;
    reason: string;
    proposedSolution: string;
    status: FeedbackStatus;
    createdAt: string;
    updatedAt: string;
    reply: string;
};