import { Badge, Box, Button, Center, Divider, FlatList, Heading, HStack, Image, Pressable, ScrollView, Spinner, Stack, Text, VStack } from 'native-base';
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../constants';
import { Feedback, Notification } from '../types';
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { RefreshControl } from 'react-native-gesture-handler';
type NotificationPageNavigationProp = StackNavigationProp<
    RootStackParamList,
    'NotificationPage'
>;
export default function NotificationPage() {

    const [refreshing, setRefreshing] = useState(false);

    const navigation = useNavigation<NotificationPageNavigationProp>();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const fetchData = async () => {
        if (!isLoading) {
            setIsLoading(true);
            try {
                const response = await axios.get(`${apiConfig.baseURL}/api/notifications`);

                if (response.status === 200) {
                    const newNotifications = response.data;
                    setNotifications(newNotifications);
                    setPage(prevPage => prevPage + 1);
                    // if (response.data.totalElements <= notifications.length + newNotifications.length) {
                    //     setHasMore(false);
                    // }
                }
            } catch (error) {
                console.log('Error fetching feedback records', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const loadMoreData = () => {
        fetchData();
    };
    const handlePress = (notification: Notification) => {
        const data = notification.data;

        if (data.includes('borrowRecordId')) {
            const borrowRecordId = data.match(/\d+/)[0]; // Lấy ID từ chuỗi
            navigation.navigate('BorrowRecordDetailPage', { borrowRecordId });
        } else if (data.includes('feedbackId')) {
            const feedbackId = data.match(/\d+/)[0]; // Lấy ID từ chuỗi
            navigation.navigate('FeedbackDetail', { feedbackId });
        } else if (data.includes('fineRecordId')) {
            const fineRecordId = data.match(/\d+/)[0]; // Lấy ID từ chuỗi
            navigation.navigate('FineRecordDetail', { borrowRecordId });
        }
    };
    const onRefresh = useCallback(async () => {
        await setRefreshing(true);
        try {
            setPage(0);
            setNotifications(undefined);
            await fetchData();
        } catch (error) {
            console.info('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const fetchDataWithLoading = async () => {
            setIsLoading(true);
            try {
                await fetchData();
            } finally {
                setIsLoading(false);
            }
        };
        fetchDataWithLoading();
    }, []);
    return (
        <VStack space={3} safeArea>
            <Center mt={10}>

                <Heading>
                    THÔNG BÁO
                </Heading>
                <Divider bg="indigo.500" thickness="2" my={2} w={40} orientation="horizontal" />

            </Center>
            <FlatList
                refreshControl={<RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />}
                data={notifications}
                contentContainerStyle={{ flexGrow: 1 }}
                keyExtractor={(item, index) => item.id.toString() + index}
                renderItem={({ item: notification }) => (
                    <Pressable
                        key={notification.id}
                        onPress={() => handlePress(notification)}
                        p={3}>
                        {({ isPressed }) => {
                            const { label, color } = getStatusDetails(notification.status);
                            return (
                                <Box bg={!isPressed ? 'white' : 'coolGray.100'} shadow={3} borderRadius={16} w={'100%'} p={1}>
                                    <HStack justifyContent={'space-between'} p={2}>
                                        <Text>
                                            Mã thông báo #<Text fontWeight={800}>{notification.id}</Text>
                                        </Text>
                                        <Text color={color} fontWeight={700}>
                                            {label}
                                        </Text>
                                    </HStack>
                                    <Divider bg="indigo.500" thickness="0.5" orientation="horizontal" />
                                    <VStack p={2}>
                                        <Text>Nội dung:  {notification.body}</Text>

                                    </VStack>
                                    <Divider bg="coolGray.400" thickness="0.5" orientation="horizontal" />
                                    <Text color={'light.800'} textAlign={'center'} p={2}>Xem chi tiết</Text>
                                </Box>
                            );
                        }}
                    </Pressable>
                )}
                ListFooterComponent={() => isLoading && hasMore && <Spinner size="large" />}
                onEndReached={hasMore ? loadMoreData : null}
                onEndReachedThreshold={0.7}
            />
        </VStack>
    );
}

const getFeedbackPurpose = (status: string) => {
    switch (status) {
        case 'REQUEST_NEW_BOOKS':
            return { label: 'Yêu cầu nhập thêm sách' };
        case 'REPORT_FACILITY_ISSUES':
            return { label: 'Báo cáo cơ sở vật chất bị hỏng' };
        case 'SUGGEST_SERVICE_IMPROVEMENTS':
            return { label: 'Đề xuất cải tiến dịch vụ' };
        case 'FEEDBACK_STUDY_SPACE':
            return { label: 'Góp ý về không gian học tập' };
        case 'FEEDBACK_STAFF':
            return { label: 'Phản hồi về nhân viên thư viện' };
        case 'FEEDBACK_MANAGEMENT_SYSTEM':
            return { label: 'Phản hồi về hệ thống thư viện' };
        default:
            return { label: status };
    }
};
const getStatusDetails = (status: string) => {
    switch (status) {
        case 'NEW':
            return { label: 'Mới', color: 'success.500' };
        case 'SEEN':
            return { label: 'Đã xem', color: 'info.500' };

        default:
            return { label: status, color: 'black' };
    }
};