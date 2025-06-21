import React, { useState, useEffect, useCallback } from 'react';
import { Box } from 'native-base';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../constants';
import { Book } from '../types';
import { mockBooks } from '../types/mockData';
import api from '../config/apiConfig';
import BackButton from '../components/BackButton';
import BookGrid from '../components/book/BookGrid';

type BookListRouteProp = RouteProp<RootStackParamList, 'BookList'>;

export default function BookList() {
    const route = useRoute<BookListRouteProp>();
    const { title, type, id } = route.params;

    const [books, setBooks] = useState<Book[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const fetchBooks = useCallback(async (isRefresh: boolean = false) => {
        const currentPage = isRefresh ? 0 : page;
        if ((!hasMore || isLoading) && !isRefresh) return;

        if (isRefresh) {
            setBooks([]);
            setPage(0);
            setHasMore(true);
        }

        setIsLoading(true);

        try {
            const response = await api.get('/books/search', {
                params: {
                    [type]: id,
                    page: currentPage,
                    size: 10,
                },
            });

            const newBooks = response.data.content;
            setBooks(prev => (currentPage === 0 ? newBooks : [...prev, ...newBooks]));
            setHasMore(response.data.totalPages > currentPage + 1);
            setPage(currentPage + 1);

        } catch (error) {
            console.error(`Error fetching books for ${type} ${id}:`, error);
            if (currentPage === 0) {
                setBooks(mockBooks);
            }
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [page, hasMore, isLoading, type, id]);

        useEffect(() => {
        fetchBooks(true);
    }, [type, id]);


    const handleRefresh = () => {
        fetchBooks(true);
    };

    const handleLoadMore = () => {
        fetchBooks();
    };

    return (
        <Box flex={1} bg="white">
            <BookGrid
                books={books}
                isLoading={isLoading}
                hasMore={hasMore}
                onRefresh={handleRefresh}
                onEndReached={handleLoadMore}
            />
        </Box>
    );
}

