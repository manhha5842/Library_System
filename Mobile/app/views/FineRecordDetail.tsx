import React, { useState, useEffect, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Box, Text, HStack, VStack, ScrollView, Center, Divider, Spinner, Skeleton, Flex, Button, Heading, Badge, ZStack } from "native-base";
import axios from 'axios';
import api from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../constants';
import { StackNavigationProp } from '@react-navigation/stack';
import { BorrowRecordDetail, FineRecord, RenewalRecord } from '../types';
import CustomAlertDialog from '../components/AlertDialog';
import { mockBorrowRecordDetails } from '../types/mockData';

type FineRecordDetailNavigationProp = StackNavigationProp<
    RootStackParamList,
    'FineRecordDetail'
>;

type FineRecordDetailRouteProp = RouteProp<RootStackParamList, 'FineRecordDetail'>;

export default function FineRecordDetailPage() {
    const navigation = useNavigation<FineRecordDetailNavigationProp>();
    const { user } = useUser();
    const route = useRoute<FineRecordDetailRouteProp>();
    const { borrowRecordId } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [borrowRecordDetail, setBorrowRecordDetail] = useState<BorrowRecordDetail | null>(null);

    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const totalUnpaidAmount = borrowRecordDetail?.fineRecords.reduce((total, fineRecord) => {
            return total + fineRecord.amount;
    }, 0);
    const fetchBorrowRecordDetail = async (id: string | undefined) => {
        if (isLoading || borrowRecordDetail != null) {
            return;
        } else {
            try {
                setIsLoading(true);
                const response = await api.get<BorrowRecordDetail>(`/request/getBorrowRecord/${id}`);
                if (response?.status === 200) {
                    setBorrowRecordDetail(response.data);
                }
            } catch (error) {
                console.info('Error fetch borrow record info', error);
                const mock = mockBorrowRecordDetails.find(b => b.id === id);
                if (mock) setBorrowRecordDetail(mock);
            }
            setIsLoading(false);
        }
    };

    useEffect(() => {
        async function fetchDetails() {
            if (borrowRecordId) {
                await fetchBorrowRecordDetail(borrowRecordId);
            }
        }
        fetchDetails();
    }, []);


    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchBorrowRecordDetail(borrowRecordId);
        } catch (error) {
            console.info('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    if (isLoading || !borrowRecordDetail) {
        return (
            <ScrollView>
                <VStack space={5} safeArea padding={3} minH={'100%'}>
                    <Skeleton.Text fontSize={'lg'} textAlign={'center'} lines={4} />
                </VStack>
            </ScrollView>
        );
    }


    const { label, color, type } = getStatusDetails(borrowRecordDetail.status);
    return (
        <Box>


            <ScrollView minH={"100%"} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <VStack p={3} pb={32}>
                    <Heading pb={3} color={'dark.200'} textAlign={'center'}>Danh sách phiếu phạt</Heading>

                    <Box pb={3}>
                        <Badge color={color} colorScheme={type} h={12}>
                            <Center>
                                <Text fontWeight={600} >{label}</Text>
                            </Center>
                        </Badge>
                    </Box>

                    <Box pb={3}>
                        <Text fontWeight={600}>Đơn mượn sách {borrowRecordId}</Text>
                        <HStack justifyContent={'space-between'} alignItems={'center'}>
                            <Text >Số lượng sách {borrowRecordDetail.books.length}</Text>
                            <Button variant={'link'} onPress={() => navigation.navigate('BorrowRecordDetailPage', { borrowRecordId: borrowRecordId })}>Xem chi tiết</Button>
                        </HStack>
                        <Divider bg="indigo.500" thickness="0.5" orientation="horizontal" />
                    </Box>



                    {borrowRecordDetail.note.length > 0 &&
                        <Box>
                            <Text fontWeight={600} pt={3}>Ghi chú</Text>
                            <Text color={'gray.500'}> {borrowRecordDetail.note}</Text>
                        </Box>}
                    {borrowRecordDetail.fineRecords.length > 0 && (
                        <Box>
                            <Text fontWeight={600} pt={3}>Phiếu phạt</Text>
                            {borrowRecordDetail.fineRecords.map((fineRecord: FineRecord, index: number) => {

                                const { label, color, type } = getFineStatus(fineRecord.status);

                                return (
                                    <Box key={fineRecord.id} p={3} borderWidth={1} borderColor="gray.300" borderRadius={5} mt={2} bgColor={color}>
                                        <HStack justifyContent={'space-between'} mb={3}>
                                            <Text fontWeight={500} fontSize={16}>Phiếu phạt {index + 1}</Text>
                                            <Text fontWeight={600} colorScheme={type}>{label}</Text>
                                        </HStack>
                                        <Text>Lý do phạt: {fineRecord.reason}</Text>

                                        <Text>Ngày phạt: <Text fontWeight={800} colorScheme={type}>{formatDate(fineRecord.fineDate)}</Text></Text>
                                        {fineRecord.paymentDate && <Text>Ngày thanh toán: {fineRecord.paymentDate ? formatDate(fineRecord.paymentDate) : 'Chưa thanh toán'}</Text>}
                                        <Text>Tạo vào lúc: {formatDate(fineRecord.createdAt)}</Text>
                                        <Text fontSize={14}>Số tiền phạt: {formatCurrency(fineRecord.amount)}</Text>
                                    </Box>
                                );
                            })}
                            <Divider my={3} bg="indigo.500" thickness="0.5" orientation="horizontal" />
                            <HStack>
                                <Text fontSize={14} fontWeight={700}>Tổng số tiền cần phải thanh toán: </Text>
                                <Text fontSize={14} fontWeight={700} color={'danger.500'}>{formatCurrency(totalUnpaidAmount ? totalUnpaidAmount : 0)}</Text>
                            </HStack>
                        </Box>

                    )}


                </VStack>
            </ScrollView>
            {isPending && <ZStack size={"100%"} opacity={1} position={'absolute'}>
                <Center bg={'white'} position={'absolute'} zIndex={99}>
                </Center>
                <Center size={"100%"} position={'absolute'} zIndex={99}>
                    <Spinner size="xl" w={'100%'} />
                </Center>
            </ZStack>}
        </Box>
    );
}
const getStatusDetails = (status: string) => {
    switch (status) {
        case 'PENDING':
            return { label: 'Đang chờ nhận sách', color: 'yellow.500', type: "warning" };
        case 'CANCELLED': {
            return { label: 'Đã hủy', color: 'red.500', type: "light" };
        }
        case 'BORROWED': {
            return { label: 'Đã mượn', color: 'yellow.500', type: "warning" };
        }
        case 'RETURN_PENDING': {
            return { label: 'Đang chờ trả', color: 'lime', type: "lime" };
        }
        case 'COMPLETED': {
            return { label: 'Hoàn thành', color: 'green.500', type: "success" };
        }
        case 'OVERDUE': {
            return { label: 'Quá hạn', color: 'red.500', type: "danger" };
        }
        case 'ARCHIVED': {
            return { label: 'Lưu trữ', color: 'gray.500', type: "danger" };
        }
        default:
            return { label: status, color: 'black', type: "light" };
    }
};
const getFineStatus = (status: string) => {
    switch (status) {
        case 'PENDING':
            return { label: 'Đang chờ thanh toán', color: 'yellow.100', type: "warning" };
        case 'PAID': {
            return { label: 'Đã thanh toán', color: 'green.100', type: "light" };
        }
        case 'UNPAID': {
            return { label: 'Chưa thanh toán', color: 'light.100', type: "light" };
        }
        default:
            return { label: status, color: 'black', type: "light" };
    }
};
const getRenewalRecordStatus = (status: string) => {
    switch (status) {
        case 'PENDING':
            return { label: 'Đang chờ xác nhận', color: 'yellow.500', type: "warning" };
        case 'ACCEPTED': {
            return { label: 'Đã chấp thuận', color: 'green.500', type: "light" };
        }
        case 'CANCELLED': {
            return { label: 'Bị từ chối', color: 'light.500', type: "light" };
        }
        case 'OVERDUE': {
            return { label: 'Hết hạn', color: 'light.500', type: "light" };
        }
        default:
            return { label: status, color: 'black', type: "light" };
    }
};
const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'DD / MM / YYYY';
    const date = new Date(dateString);
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};