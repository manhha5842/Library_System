import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FlatList, Dimensions, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Box, VStack, Text, HStack, Image, Pressable, Divider, Spinner, Center, useColorModeValue } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../constants';
import { SceneMap, TabView } from 'react-native-tab-view';
import { BorrowRecord, Feedback, FineRecordView } from '../types';
import { apiConfig } from '../config/apiConfig';
import axios, { AxiosResponse } from 'axios';
import { RefreshControl } from 'react-native-gesture-handler';

type HistoryFeedbackRecordNavigationProp = StackNavigationProp<
    RootStackParamList,
    'HistoryFeedback'
>;

export default function HistoryFeedback() {


    const [refreshing, setRefreshing] = useState(false);

    const FirstRoute = () => {
        const navigation = useNavigation<HistoryFeedbackRecordNavigationProp>();
        const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
        const [hasMore, setHasMore] = useState(true);
        const [page, setPage] = useState(0);
        const fetchData = async () => {
            if (!isLoading) {
                setIsLoading(true);
                try {
                    const response = await axios.get(`${apiConfig.baseURL}/api/feedbacks/paged`, {
                        params: { page, size: 4 },
                    });

                    if (response.status === 200) {
                        const newFeedbacks = response.data.content;
                        setFeedbacks(prevRecords => [...prevRecords, ...newFeedbacks]);
                        setPage(prevPage => prevPage + 1);
                        if (response.data.totalElements <= feedbacks.length + newFeedbacks.length) {
                            setHasMore(false);
                        }
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

        const onRefresh = useCallback(async () => {
            await setRefreshing(true);
            try {
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
            <VStack space={3}>
                <FlatList
                    refreshControl={<RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />}
                    data={feedbacks}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyExtractor={(item, index) => item.id}
                    renderItem={({ item: feedback }) => (
                        <Pressable
                            key={feedback.id}
                            onPress={() => navigation.navigate('FeedbackDetail', { feedbackId: feedback.id })}
                            p={3}>
                            {({ isPressed }) => {
                                const { label, color } = getStatusDetails(feedback.status);
                                return (
                                    <Box bg={!isPressed ? 'white' : 'coolGray.100'} shadow={3} borderRadius={16} w={'100%'} p={1}>
                                        <HStack justifyContent={'space-between'} p={2}>
                                            <Text>
                                                Mã đơn #<Text fontWeight={800}>{feedback.id}</Text>
                                            </Text>
                                            <Text color={color} fontWeight={700}>
                                                {label}
                                            </Text>
                                        </HStack>
                                        <Divider bg="indigo.500" thickness="0.5" orientation="horizontal" />
                                        <VStack p={2}>
                                            <Text color={'dark.200'} fontWeight={700}>{getFeedbackPurpose(feedback.purpose).label}</Text>
                                            <Text>Nội dung:  {feedback.content}</Text>

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

    const SecondRoute = () => {
        const navigation = useNavigation<HistoryFeedbackRecordNavigationProp>();
        const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
        const [hasMore, setHasMore] = useState(true);
        const [page, setPage] = useState(0);
        const fetchHistoriesByStatuses = async (page: number, size: number, statuses: string[]): Promise<AxiosResponse<any, any>> => {
            try {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('size', size.toString());
                statuses.forEach(status => params.append('statuses', status));
                const response = await axios.get(`${apiConfig.baseURL}/api/feedbacks/statuses?${params.toString()}`);
                return response;
            } catch (error) {
                console.log('Error fetching histories:', error);
                throw error;
            }
        };
        const fetchData = async () => {
            if (!isLoading) {
                setIsLoading(true);
                try {
                    const response = await fetchHistoriesByStatuses(page, 4, ["NEW"]);
                    if (response.status === 200) {
                        const newFeedbacks = response.data;
                        console.log(newFeedbacks);
                        setFeedbacks(prevRecords => [...prevRecords, ...newFeedbacks]);
                        setPage(prevPage => prevPage + 1);
                        if (response.data.totalElements <= feedbacks.length + newFeedbacks.length) {
                            setHasMore(false);
                        }
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
        const onRefresh = useCallback(async () => {
            await setRefreshing(true);
            try {
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
            <VStack space={3}>
                <FlatList
                    refreshControl={<RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />}
                    data={feedbacks}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyExtractor={(item, index) => item.id}
                    renderItem={({ item: feedback }) => (
                        <Pressable
                            key={feedback.id}
                            onPress={() => navigation.navigate('FeedbackDetail', { feedbackId: feedback.id })}
                            p={3}>
                            {({ isPressed }) => {
                                const { label, color } = getStatusDetails(feedback.status);
                                return (
                                    <Box bg={!isPressed ? 'white' : 'coolGray.100'} shadow={3} borderRadius={16} w={'100%'} p={1}>
                                        <HStack justifyContent={'space-between'} p={2}>
                                            <Text>
                                                Mã đơn #<Text fontWeight={800}>{feedback.id}</Text>
                                            </Text>
                                            <Text color={color} fontWeight={700}>
                                                {label}
                                            </Text>
                                        </HStack>
                                        <Divider bg="indigo.500" thickness="0.5" orientation="horizontal" />
                                        <VStack p={2}>
                                            <Text color={'dark.200'} fontWeight={700}>{getFeedbackPurpose(feedback.purpose).label}</Text>
                                            <Text>Nội dung:  {feedback.content}</Text>

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
    const ThirdRoute = () => {
        const navigation = useNavigation<HistoryFeedbackRecordNavigationProp>();
        const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
        const [hasMore, setHasMore] = useState(true);
        const [page, setPage] = useState(0);
        const fetchHistoriesByStatuses = async (page: number, size: number, statuses: string[]): Promise<AxiosResponse<any, any>> => {
            try {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('size', size.toString());
                statuses.forEach(status => params.append('statuses', status));
                const response = await axios.get(`${apiConfig.baseURL}/api/feedbacks/statuses?${params.toString()}`);
                return response;
            } catch (error) {
                console.log('Error fetching histories:', error);
                throw error;
            }
        };
        const fetchData = async () => {
            if (!isLoading) {
                setIsLoading(true);
                try {
                    const response = await fetchHistoriesByStatuses(page, 4, ["NOTED,REJECTED"]);

                    console.log(response.data);
                    if (response.status === 200) {
                        const newFeedbacks = response.data;
                        console.log(newFeedbacks);
                        setFeedbacks(prevRecords => [...prevRecords, ...newFeedbacks]);
                        setPage(prevPage => prevPage + 1);
                        if (response.data.totalElements <= feedbacks.length + newFeedbacks.length) {
                            setHasMore(false);
                        }
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
        const onRefresh = useCallback(async () => {
            await setRefreshing(true);
            try {
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
            <VStack space={3}>
                <FlatList
                    refreshControl={<RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />}
                    data={feedbacks}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyExtractor={(item, index) => item.id}
                    renderItem={({ item: feedback }) => (
                        <Pressable
                            key={feedback.id}
                            onPress={() => navigation.navigate('FeedbackDetail', { feedbackId: feedback.id })}
                            p={3}>
                            {({ isPressed }) => {
                                const { label, color } = getStatusDetails(feedback.status);
                                return (
                                    <Box bg={!isPressed ? 'white' : 'coolGray.100'} shadow={3} borderRadius={16} w={'100%'} p={1}>
                                        <HStack justifyContent={'space-between'} p={2}>
                                            <Text>
                                                Mã đơn #<Text fontWeight={800}>{feedback.id}</Text>
                                            </Text>
                                            <Text color={color} fontWeight={700}>
                                                {label}
                                            </Text>
                                        </HStack>
                                        <Divider bg="indigo.500" thickness="0.5" orientation="horizontal" />
                                        <VStack p={2}>
                                            <Text color={'dark.200'} fontWeight={700}>{getFeedbackPurpose(feedback.purpose).label}</Text>
                                            <Text>Nội dung:  {feedback.content}</Text>

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

    const initialLayout = { width: Dimensions.get('window').width };
    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
        third: ThirdRoute
    });

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'first', title: 'Tất cả' },
        { key: 'second', title: 'Chưa có phản hồi' },
        { key: 'third', title: 'Đã ghi nhận' }
    ]);

    const renderTabBar = (props: { navigationState: { routes: any[]; }; position: { interpolate: (arg0: { inputRange: any; outputRange: any; }) => any; }; }) => {
        return (
            <Box flexDirection="row">
                {props.navigationState.routes.map((route, i) => {
                    const color = index === i ? useColorModeValue('#000', '#e5e5e5') : useColorModeValue('#1f2937', '#a1a1aa');
                    const borderColor = index === i ? 'cyan.500' : useColorModeValue('coolGray.200', 'gray.400');
                    return (
                        <Box key={route.key} borderBottomWidth="3" borderColor={borderColor} flex={1} alignItems="center">
                            <Pressable key={route.key} py="3" onPress={() => setIndex(i)}>
                                <Animated.Text key={route.key} style={{
                                    color,
                                    fontWeight: '600'
                                }}>{route.title}</Animated.Text>
                            </Pressable>
                        </Box>
                    );
                })}
            </Box>
        );
    };
    return <TabView navigationState={{
        index,
        routes
    }} renderScene={renderScene} renderTabBar={renderTabBar} onIndexChange={setIndex} initialLayout={initialLayout} />

}
const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'DD / MM / YYYY';
    const date = new Date(dateString);
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
};
const getStatusDetails = (status: string) => {
    switch (status) {
        case 'NEW':
            return { label: 'Mới', color: 'yellow.500' };
        case 'NOTED':
            return { label: 'Đã ghi nhận', color: 'green.500' };
        case 'REJECTED':
            return { label: 'Đã từ chối', color: 'red.500' };

        default:
            return { label: status, color: 'black' };
    }
};
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
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};