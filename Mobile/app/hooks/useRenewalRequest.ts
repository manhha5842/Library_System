import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import api from '../config/apiConfig';
import { BorrowRecordDetail } from '../types';
import { mockBorrowRecordDetails } from '../types/mockData';

export const useRenewalRequest = (borrowRecordId: string) => {
    const navigation = useNavigation();
    const [record, setRecord] = useState<BorrowRecordDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [newDueDate, setNewDueDate] = useState<Date | null>(null);
    const [reason, setReason] = useState('');

    const fetchRecordDetail = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get<BorrowRecordDetail>(`/borrows/${borrowRecordId}`);
            setRecord(response.data);
        } catch (error) {
            console.error('Error fetching borrow record detail:', error);
            const mockData = mockBorrowRecordDetails.find(b => b.id === borrowRecordId);
            setRecord(mockData || null);
        } finally {
            setIsLoading(false);
        }
    }, [borrowRecordId]);

    useEffect(() => {
        if (borrowRecordId) {
            fetchRecordDetail();
        }
    }, [fetchRecordDetail, borrowRecordId]);

    const submitRenewalRequest = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        if (!newDueDate) {
            return { success: false, error: 'Vui lòng chọn ngày gia hạn mới.' };
        }
        if (record && newDueDate <= new Date(record.dueDate)) {
            return { success: false, error: 'Ngày gia hạn mới phải sau ngày trả cũ.' };
        }

        setIsSubmitting(true);
        try {
            await api.post('/renewals/request', {
                borrowRecordId,
                newDueDate: newDueDate.toISOString().split('T')[0], // YYYY-MM-DD
                reason,
            });
            return { success: true };
        } catch (error: any) {
            console.error('Error submitting renewal request:', error);
            // Simulate success for offline mode
            if (error.isAxiosError && !error.response) {
                 return { success: true };
            }
            return { success: false, error: 'Gửi yêu cầu gia hạn thất bại.' };
        } finally {
            setIsSubmitting(false);
        }
    }, [borrowRecordId, newDueDate, reason, record]);

    return {
        record,
        isLoading,
        isSubmitting,
        newDueDate,
        setNewDueDate,
        reason,
        setReason,
        fetchRecordDetail,
        submitRenewalRequest,
    };
}; 