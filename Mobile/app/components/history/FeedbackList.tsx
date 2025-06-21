import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { Box, Spinner, Text } from 'native-base';
import { Feedback } from '../../types';
import { FeedbackStatus } from '../../types/enums';
import { mockFeedbacks } from '../../types/mockData';
import api from '../../config/apiConfig';
import FeedbackCard from './FeedbackCard';

interface FeedbackListProps {
    statuses: FeedbackStatus[];
    listHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

const FeedbackList: React.FC<FeedbackListProps> = ({ statuses, listHeaderComponent }) => {
    const [records, setRecords] = useState<Feedback[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchRecords = useCallback(async (isRefresh: boolean = false) => {
        const currentPage = isRefresh ? 0 : page;
        if ((!hasMore || isLoading) && !isRefresh) return;

        if (isRefresh) {
            setRecords([]);
            setPage(0);
            setHasMore(true);
        }

        setIsLoading(true);

        try {
            const response = await api.get('/feedbacks/me', {
                params: {
                    statuses: statuses.join(','),
                    page: currentPage,
                    size: 10,
                },
            });

            const newRecords = response.data.content;
            setRecords(prev => (currentPage === 0 ? newRecords : [...prev, ...newRecords]));
            setHasMore(response.data.totalPages > currentPage + 1);
            setPage(currentPage + 1);

        } catch (error) {
            console.error(`Error fetching feedback for statuses ${statuses.join(',')}:`, error);
            if (currentPage === 0) {
                const filteredMock = mockFeedbacks.filter(r => statuses.includes(r.status));
                setRecords(filteredMock);
            }
            setHasMore(false); // Stop fetching on error
        } finally {
            setIsLoading(false);
            if (isRefresh) setIsRefreshing(false);
        }
    }, [page, hasMore, isLoading, statuses]);

    useEffect(() => {
        fetchRecords(true); // Initial fetch
    }, [statuses]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchRecords(true);
    };

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            fetchRecords();
        }
    };

    const renderFooter = () => {
        if (!isLoading) return null;
        return <Spinner my={4} color="gray.500" />;
    };

    const renderEmptyComponent = () => (
        <Box flex={1} justifyContent="center" alignItems="center" mt={20}>
            <Text>Không có phản hồi nào.</Text>
        </Box>
    );

    return (
        <FlatList
            data={records}
            renderItem={({ item }) => <FeedbackCard record={item} />}
            keyExtractor={item => item.id.toString()}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyComponent}
            ListHeaderComponent={listHeaderComponent}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            contentContainerStyle={{ flexGrow: 1 }}
        />
    );
};

export default FeedbackList; 