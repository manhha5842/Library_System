import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FlatList, Dimensions, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Box, VStack, Text, HStack, Image, Pressable, Divider, Spinner, Center, useColorModeValue } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../constants';
import { SceneMap, TabView } from 'react-native-tab-view';
import { BorrowRecord, FineRecordView } from '../types';
import { apiConfig } from '../config/apiConfig';
import axios, { AxiosResponse } from 'axios';
import { RefreshControl } from 'react-native-gesture-handler';

type HistoryFineRecordNavigationProp = StackNavigationProp<
    RootStackParamList,
    'HistoryFineRecord'
>;

export default function HistoryFineRecord() {


    const [refreshing, setRefreshing] = useState(false);

    const FirstRoute = () => {
        const navigation = useNavigation<HistoryFineRecordNavigationProp>();
        const [borrowRecords, setBorrowRecords] = useState<FineRecordView[]>([]);
        const [hasMore, setHasMore] = useState(true);
        const [page, setPage] = useState(0);
        const fetchData = async () => {
            if (!isLoading) {
                setIsLoading(true);
                try {
                    const response = await axios.get(`${apiConfig.baseURL}/api/request/getFineRecordHistories`, {
                        params: { page, size: 4 },
                    });

                    if (response.status === 200) {
                        const newBorrowRecords = response.data.content;
                        setBorrowRecords(prevRecords => [...prevRecords, ...newBorrowRecords]);
                        setPage(prevPage => prevPage + 1);
                        if (response.data.totalElements <= borrowRecords.length + newBorrowRecords.length) {
                            setHasMore(false);
                        }
                    }
                } catch (error) {
                    console.log('Error fetching borrow records', error);
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
                    data={borrowRecords}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyExtractor={(item, index) => item.id}
                    renderItem={({ item: borrowRecord }) => (
                        <Pressable
                            key={borrowRecord.id}
                            onPress={() => navigation.navigate('FineRecordDetail', { borrowRecordId: borrowRecord.id })}
                            p={3}>
                            {({ isPressed }) => {
                                const { label, color } = getStatusDetails(borrowRecord.status);
                                return (
                                    <Box bg={!isPressed ? 'white' : 'coolGray.100'} shadow={3} borderRadius={16} w={'100%'} p={1}>
                                        <HStack justifyContent={'space-between'} p={2}>
                                            <Text>
                                                Mã đơn #<Text fontWeight={800}>{borrowRecord.id}</Text>
                                            </Text>
                                            <Text color={color} fontWeight={700}>
                                                {label}
                                            </Text>
                                        </HStack>
                                        <Divider bg="indigo.500" thickness="0.5" orientation="horizontal" />
                                        <VStack p={2}>
                                            <Text>Số lượng phiếu phạt {borrowRecord.fineRecords.length}</Text>
                                            <Text>Số tiền chưa thanh toán: {"\t"}
                                                <Text color={'danger.500'}>
                                                    {formatCurrency(borrowRecord.unpaidAmount)}
                                                </Text>
                                            </Text>
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
        const navigation = useNavigation<HistoryFineRecordNavigationProp>();
        const [borrowRecords, setBorrowRecords] = useState<FineRecordView[]>([]);
        const [hasMore, setHasMore] = useState(true);
        const [page, setPage] = useState(0);
        const fetchHistoriesByStatuses = async (page: number, size: number, statuses: string[]): Promise<AxiosResponse<any, any>> => {
            try {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('size', size.toString());
                statuses.forEach(status => params.append('status', status));

                const response = await axios.get(`${apiConfig.baseURL}/api/request/getFineRecordHistoriesByStatuses?${params.toString()}`);
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
                    const response = await fetchHistoriesByStatuses(page, 4, ["PENDING", "RETURN_PENDING", "BORROWED", "OVERDUE", "ARCHIVED"]);
                    setPage(prevPage => prevPage + 1);

                    if (response.status === 200) {
                        const newBorrowRecords = response.data.content;
                        setBorrowRecords(prevRecords => [...prevRecords, ...newBorrowRecords]);
                        setPage(prevPage => prevPage + 1);
                        if (response.data.totalElements <= borrowRecords.length + newBorrowRecords.length) {
                            setHasMore(false);
                        }
                    }
                } catch (error) {
                    console.log('Error fetching borrow records waiting', error);
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
                    data={borrowRecords}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyExtractor={(item, index) => item.id}
                    renderItem={({ item: borrowRecord }) => (
                        <Pressable
                            key={borrowRecord.id}
                            onPress={() => navigation.navigate('FineRecordDetail', { borrowRecordId: borrowRecord.id })}
                            p={3}>
                            {({ isPressed }) => {
                                const { label, color } = getStatusDetails(borrowRecord.status);
                                return (
                                    <Box bg={!isPressed ? 'white' : 'coolGray.100'} shadow={3} borderRadius={16} w={'100%'} p={1}>
                                        <HStack justifyContent={'space-between'} p={2}>
                                            <Text>
                                                Mã đơn #<Text fontWeight={800}>{borrowRecord.id}</Text>
                                            </Text>
                                            <Text color={color} fontWeight={700}>
                                                {label}
                                            </Text>
                                        </HStack>
                                        <Divider bg="indigo.500" thickness="0.5" orientation="horizontal" />
                                        <VStack p={2}>
                                            <Text>Số lượng phiếu phạt {borrowRecord.fineRecords.length}</Text>
                                            <Text>Số tiền chưa thanh toán: {"\t"}
                                                <Text color={'danger.500'}>
                                                    {formatCurrency(borrowRecord.unpaidAmount)}
                                                </Text>
                                            </Text>
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
    };
    const ThirdRoute = () => {
        const navigation = useNavigation<HistoryFineRecordNavigationProp>();
        const [borrowRecords, setBorrowRecords] = useState<FineRecordView[]>([]);
        const [hasMore, setHasMore] = useState(true);
        const [page, setPage] = useState(0);
        const fetchHistoriesByStatuses = async (page: number, size: number, statuses: string[]): Promise<AxiosResponse<any, any>> => {
            try {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('size', size.toString());
                statuses.forEach(status => params.append('status', status));

                const response = await axios.get(`${apiConfig.baseURL}/api/request/getFineRecordHistoriesByStatuses?${params.toString()}`);
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
                    const response = await fetchHistoriesByStatuses(page, 4, ["COMPLETED"]);

                    if (response.status === 200) {
                        const newBorrowRecords = response.data.content;
                        setBorrowRecords(prevRecords => [...prevRecords, ...newBorrowRecords]);
                        setPage(prevPage => prevPage + 1);
                        if (response.data.totalElements <= borrowRecords.length + newBorrowRecords.length) {
                            setHasMore(false);
                        }
                    }
                } catch (error) {
                    console.log('Error fetching borrow records waiting', error);
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
                    data={borrowRecords}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyExtractor={(item, index) => item.id}
                    renderItem={({ item: borrowRecord }) => (
                        <Pressable
                            key={borrowRecord.id}
                            onPress={() => navigation.navigate('FineRecordDetail', { borrowRecordId: borrowRecord.id })}
                            p={3}>
                            {({ isPressed }) => {
                                const { label, color } = getStatusDetails(borrowRecord.status);
                                return (
                                    <Box bg={!isPressed ? 'white' : 'coolGray.100'} shadow={3} borderRadius={16} w={'100%'} p={1}>
                                        <HStack justifyContent={'space-between'} p={2}>
                                            <Text>
                                                Mã đơn #<Text fontWeight={800}>{borrowRecord.id}</Text>
                                            </Text>
                                            <Text color={color} fontWeight={700}>
                                                {label}
                                            </Text>
                                        </HStack>
                                        <Divider bg="indigo.500" thickness="0.5" orientation="horizontal" />
                                        <VStack p={2}>
                                            <Text>Số lượng phiếu phạt {borrowRecord.fineRecords.length}</Text>
                                            <Text>Số tiền chưa thanh toán: {"\t"}
                                                <Text color={'danger.500'}>
                                                    {formatCurrency(borrowRecord.unpaidAmount)}
                                                </Text>
                                            </Text>
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
    };

    const initialLayout = { width: Dimensions.get('window').width };
    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
        third: ThirdRoute
    });

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'first', title: 'Tất cả' },
        { key: 'second', title: 'Chưa hoàn thành' },
        { key: 'third', title: 'Đã hoàn thành' }
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
        case 'PENDING':
            return { label: 'Đang chờ nhận sách', color: 'yellow.500' };
        case 'CANCELLED':
            return { label: 'Đã hủy', color: 'red.500' };
        case 'BORROWED':
            return { label: 'Đã mượn', color: 'yellow.500' };
        case 'RETURN_PENDING':
            return { label: 'Đang chờ trả', color: 'yellow.500' };
        case 'COMPLETED':
            return { label: 'Hoàn thành', color: 'green.500' };
        case 'OVERDUE':
            return { label: 'Quá hạn', color: 'red.500' };
        case 'ARCHIVED':
            return { label: 'Lưu trữ', color: 'gray.500' };
        default:
            return { label: status, color: 'black' };
    }
};
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};