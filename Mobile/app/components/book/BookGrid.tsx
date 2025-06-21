import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { Box, Spinner, Text, VStack } from 'native-base';
import { Book } from '../../types';
import BookCard from './BookCard';

interface BookGridProps {
    books: Book[];
    isLoading: boolean;
    hasMore: boolean;
    onRefresh?: () => void;
    onEndReached?: () => void;
    listHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

const BookGrid: React.FC<BookGridProps> = ({
    books,
    isLoading,
    hasMore,
    onRefresh,
    onEndReached,
    listHeaderComponent,
}) => {
    const refreshing = onRefresh ? isLoading : false;

    const renderFooter = () => {
        if (!isLoading || !hasMore) return null;
        return <Spinner my={4} color="gray.500" />;
    };

    const renderEmptyComponent = () => {
        if (isLoading) return null; // Don't show empty message while loading
        return (
            <VStack flex={1} justifyContent="center" alignItems="center" mt={20}>
                <Text>Không tìm thấy cuốn sách nào.</Text>
            </VStack>
        );
    }

    return (
        <FlatList
            data={books}
            numColumns={2}
            renderItem={({ item }) => <BookCard book={item} />}
            keyExtractor={(item) => item.id.toString()}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyComponent}
            ListHeaderComponent={listHeaderComponent}
            refreshControl={
                onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
            }
            contentContainerStyle={{ flexGrow: 1 }}
            p={2}
        />
    );
};

export default BookGrid; 