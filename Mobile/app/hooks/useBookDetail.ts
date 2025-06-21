import { useState, useEffect, useCallback } from 'react';
import api from '../config/apiConfig';
import { BookDetail } from '../types';
import { mockBookDetails } from '../types/mockData';

export const useBookDetail = (bookId: string) => {
    const [book, setBook] = useState<BookDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBookDetail = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get<BookDetail>(`/books/${bookId}`);
            setBook(response.data);
        } catch (error) {
            console.error('Error fetching book detail:', error);
            const mockData = mockBookDetails.find(b => b.id === bookId);
            setBook(mockData || null);
        } finally {
            setIsLoading(false);
        }
    }, [bookId]);

    useEffect(() => {
        if (bookId) {
            fetchBookDetail();
        }
    }, [fetchBookDetail, bookId]);

    return {
        book,
        isLoading,
        fetchBookDetail, // for refresh
    };
}; 