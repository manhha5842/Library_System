import React, { useState, useEffect, useCallback } from 'react';
import { Box, VStack, Text, Select, HStack } from "native-base";
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../constants';
import { Book, Category } from '../types';
import { mockBooks, mockCategories } from '../types/mockData';
import api from '../config/apiConfig';
import BackButton from '../components/BackButton';
import BookGrid from '../components/book/BookGrid';

type BookListSearchRouteProp = RouteProp<RootStackParamList, 'BookListSearch'>;

export default function BookListSearch() {
    const route = useRoute<BookListSearchRouteProp>();
    const { keyword } = route.params;

    const [books, setBooks] = useState<Book[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Filter and Sort States
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
    const [sortOption, setSortOption] = useState<string>('default');

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
            setCategories(mockCategories);
        }
    };

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
            const params: any = {
                keyword: keyword,
                page: currentPage,
                size: 10,
                sort: sortOption === 'default' ? '' : sortOption,
            };
            if (selectedCategoryId) {
                params.categoryId = selectedCategoryId;
            }

            const response = await api.get('/books/search', { params });

            const newBooks = response.data.content;
            setBooks(prev => (currentPage === 0 ? newBooks : [...prev, ...newBooks]));
            setHasMore(response.data.totalPages > currentPage + 1);
            setPage(currentPage + 1);

        } catch (error) {
            console.error(`Error fetching search results:`, error);
            if (currentPage === 0) {
                setBooks(mockBooks);
            }
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [page, hasMore, isLoading, keyword, selectedCategoryId, sortOption]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchBooks(true);
    }, [keyword, selectedCategoryId, sortOption]);


    const handleRefresh = () => {
        fetchBooks(true);
    };

    const handleLoadMore = () => {
        fetchBooks();
    };

    const renderHeader = () => (
        <VStack space={3} p={4}>
            <Text fontSize="lg" fontWeight="bold">Kết quả cho: "{keyword}"</Text>
            <HStack justifyContent="space-between" alignItems="center">
                <Select
                    flex={1}
                    placeholder="Lọc theo thể loại"
                    selectedValue={selectedCategoryId}
                    onValueChange={(itemValue) => setSelectedCategoryId(itemValue)}
                >
                    <Select.Item label="Tất cả thể loại" value={undefined} />
                    {categories.map(cat => <Select.Item key={cat.id} label={cat.name} value={cat.id} />)}
                </Select>
                <Select
                    ml={2}
                    placeholder="Sắp xếp"
                    selectedValue={sortOption}
                    onValueChange={(itemValue) => setSortOption(itemValue)}
                >
                    <Select.Item label="Mặc định" value="default" />
                    <Select.Item label="Tên A-Z" value="title,asc" />
                    <Select.Item label="Tên Z-A" value="title,desc" />
                </Select>
            </HStack>
        </VStack>
    );

    return (
        <Box flex={1} bg="white">
            <BackButton title="Tìm kiếm" />
            <BookGrid
                books={books}
                isLoading={isLoading}
                hasMore={hasMore}
                onRefresh={handleRefresh}
                onEndReached={handleLoadMore}
                listHeaderComponent={renderHeader}
            />
        </Box>
    );
}

