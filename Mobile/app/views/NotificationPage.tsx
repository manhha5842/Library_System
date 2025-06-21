import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { Box, Text, Spinner } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../components/BackButton';
import NotificationCard from '../components/notification/NotificationCard';
import { Notification } from '../types';
import { mockNotifications } from '../types/mockData';
import api from '../config/apiConfig';

export default function NotificationPage() {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchNotifications = useCallback(async () => {
        // On initial load, don't set loading to true again if it's already true
        if (!isLoading) setIsLoading(true);
        try {
            const response = await api.get('/notifications/me');
            // Ensure data is an array
            if (Array.isArray(response.data)) {
                setNotifications(response.data);
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            setNotifications(mockNotifications);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    useEffect(() => {
        fetchNotifications();
    }, []); // Removed fetchNotifications from dependency array to avoid re-running

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchNotifications();
        setIsRefreshing(false);
    };

    const handleNotificationPress = async (notification: Notification) => {
        try {
            if (!notification.isRead) {
                // Optimistic update
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notification.id ? { ...n, isRead: true } : n
                    )
                );
                await api.put(`/notifications/read/${notification.id}`);
            }
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
             // Revert on error
             setNotifications(prev =>
                prev.map(n =>
                    n.id === notification.id ? { ...n, isRead: false } : n
                )
            );
        }
        console.log("Notification pressed:", notification.id);
    };

    const renderEmptyComponent = () => (
        <Box flex={1} justifyContent="center" alignItems="center">
            <Text>Bạn chưa có thông báo nào.</Text>
        </Box>
    );

    if (isLoading) {
        return (
            <Box flex={1} bg="white">
                <BackButton title="Thông báo" />
                <Spinner flex={1} color="gray.500" />
            </Box>
        )
    }

    return (
        <Box flex={1} bg="white">
            <BackButton title="Thông báo" />
            <FlatList
                data={notifications}
                renderItem={({ item }) => (
                    <NotificationCard
                        notification={item}
                        onPress={() => handleNotificationPress(item)}
                    />
                )}
                keyExtractor={item => item.id}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={renderEmptyComponent}
                contentContainerStyle={{ flexGrow: 1 }}
            />
        </Box>
    );
}