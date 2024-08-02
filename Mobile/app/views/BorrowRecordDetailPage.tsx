import React, { useState, useEffect, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Box, Text, HStack, VStack, ScrollView, Center, Divider, Spinner, Skeleton, Flex, Button, Heading, Badge, ZStack } from "native-base";
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../constants';
import { StackNavigationProp } from '@react-navigation/stack';
import { BorrowRecordDetail, FineRecord, RenewalRecord } from '../types';
import CustomAlertDialog from '../components/AlertDialog';

type BorrowRecordDetailNavigationProp = StackNavigationProp<
    RootStackParamList,
    'BorrowRecordDetailPage'
>;

type BorrowRecordDetailRouteProp = RouteProp<RootStackParamList, 'BorrowRecordDetailPage'>;

export default function BorrowRecordDetailPage() {
    const navigation = useNavigation<BorrowRecordDetailNavigationProp>();
    const { user } = useUser();
    const route = useRoute<BorrowRecordDetailRouteProp>();
    const { borrowRecordId } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [borrowRecordDetail, setBorrowRecordDetail] = useState<BorrowRecordDetail | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBorrowRecordDetail = async (id: string | undefined) => {
        if (isLoading || borrowRecordDetail != null) {
            return;
        } else {
            try {
                setIsLoading(true);
                const response = await axios.get<BorrowRecordDetail>(`${apiConfig.baseURL}/api/request/getBorrowRecord/${id}`);
                if (response?.status === 200) {
                    setBorrowRecordDetail(response.data);
                    console.log(borrowRecordDetail);
                }
            } catch (error) {
                console.info('Error fetch borrow record info', error);
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


    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
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
    const handleCancel = async () => {
        console.log('Cancelled');
        setIsPending(true);
        try {
            const response = await axios.put<BorrowRecordDetail>(`${apiConfig.baseURL}/api/request/cancel/${borrowRecordDetail?.id}`);
            if (response?.status === 200) {
                setBorrowRecordDetail(response.data);
                setIsSuccess(true);
            }
        } catch (error) {
            setIsError(true);
            console.log('Error cancelling borrow record:', error);
        }
        setIsPending(false);
        handleClose();
    };

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
            <CustomAlertDialog isOpen={isOpen} onClose={handleClose}
                title="Xác nhận huỷ đơn"
                message="Bạn muốn huỷ đơn mượn sách?"
                buttons={[{
                    label: 'Đồng ý',
                    onPress: handleCancel,
                    colorScheme: 'danger'
                },
                {
                    label: 'Huỷ bỏ',
                    onPress: handleClose,
                    colorScheme: 'info',
                    isCancel: true
                }]}
            />
            <CustomAlertDialog isOpen={isError} onClose={handleClose}
                title="Có lỗi xảy ra"
                message="Có lỗi xảy ra vui lòng thử lại sau hoặc liên hệ với nhân viên thư viện"
                buttons={[{
                    label: 'Đồng ý',
                    onPress: () => setIsError(false),
                    colorScheme: 'danger'
                },]}
            />
            <CustomAlertDialog isOpen={isSuccess} onClose={handleClose}
                title="Huỷ đơn thành công"
                message={"Đơn mượn sách " + borrowRecordDetail.id + " đã được huỷ."}
                buttons={[{
                    label: 'Đồng ý',
                    onPress: () => setIsSuccess(false),
                    colorScheme: 'success'
                },]}
            />
            <ScrollView minH={"100%"} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <VStack p={3} pb={32}>
                    <Heading pb={3} color={'dark.200'}>Đơn mượn sách #{borrowRecordDetail.id}</Heading>

                    <Box pb={3}>
                        <Badge color={color} colorScheme={type} h={12}>
                            <Center>
                                <Text fontWeight={600} >{label}</Text>
                            </Center>
                        </Badge>
                    </Box>
                    <Box pb={3}>
                        <Text fontWeight={600}>Thông tin sinh viên</Text>
                        <Text px={3} color={'gray.500'}>{user?.name} - {user?.email}</Text>
                    </Box>

                    <HStack mb={3} justifyContent={'space-between'}>
                        <Box>
                            <Text fontWeight={600}>Thời gian nhận sách</Text>
                            <Flex direction="row">
                                <Text px={3} color={'gray.500'}>{formatDate(borrowRecordDetail.borrowDate)}</Text>
                            </Flex>
                        </Box>
                        <Divider bg="indigo.500" thickness="1" orientation="vertical" />
                        <Box>
                            <Text fontWeight={600}>Thời gian trả sách</Text>
                            <Flex direction="row">
                                <Text px={3} color={'gray.500'}>{formatDate(borrowRecordDetail.dueDate)}</Text>
                            </Flex>
                        </Box>
                    </HStack>

                    <Text fontWeight={600} py={3}>Sách đã chọn {borrowRecordDetail.fineRecords.length}</Text>
                    <HStack bg={'lightBlue.200'}>
                        <Text fontWeight={500} w={"10%"} textAlign={'center'}>STT</Text>
                        <Divider bg="indigo.500" thickness="0.5" mx="2" orientation="vertical" />
                        <Text fontWeight={500} w={"85%"}>Tên sách</Text>
                    </HStack>

                    <Divider bg="indigo.500" thickness="0.5" w={'100%'} orientation="horizontal" />
                    {borrowRecordDetail.books?.map((book, bookIndex) => (
                        <HStack key={book.id} bg={bookIndex % 2 == 0 ? 'lightBlue.100' : 'white'} alignItems={'center'} py={1}>
                            <Text fontWeight={300} w={"10%"} textAlign={'center'} fontSize={12}>{bookIndex + 1}</Text>
                            <Divider bg="indigo.500" thickness="0.5" mx="2" orientation="vertical" />
                            <Text fontWeight={300} w={"85%"} lineBreakMode='middle' fontSize={12}>{book.title}</Text>
                        </HStack>
                    ))}
                    <Divider bg="indigo.500" thickness="0.5" orientation="horizontal" />

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

                                return <Box key={fineRecord.id} p={3} borderWidth={1} borderColor="gray.300" borderRadius={5} mt={2} bgColor={color}>
                                    <HStack justifyContent={'space-between'}>
                                        <Text fontWeight={500} fontSize={14}>Phiếu phạt {index + 1}</Text>
                                        <Text fontSize={12}>Trạng thái:  <Text fontWeight={800} colorScheme={type}>{label}</Text></Text>
                                    </HStack>
                                    <HStack justifyContent={'space-between'}>
                                    </HStack>
                                    <Text fontSize={12}>Lý do phạt: {fineRecord.fineReason}</Text>
                                    <Text fontSize={12}>Số tiền phạt: {fineRecord.fineAmount}</Text>
                                </Box>
                            }
                            )}
                        </Box>
                    )}
                    {borrowRecordDetail.renewalRecords.length > 0 && (
                        <Box>
                            <Text fontWeight={600} pt={3}>Lịch sử gia hạn</Text>
                            {borrowRecordDetail.renewalRecords.map((renewalRecord: RenewalRecord, index: number) => {
                                const { label, color, type } = getRenewalRecordStatus(renewalRecord.status);
                                return <Box key={renewalRecord.id} p={3} borderWidth={1} borderColor="gray.300" borderRadius={5} mt={2} bgColor={'light.100'}>
                                    <VStack >
                                        <Text mb={3} fontWeight={500} fontSize={14}>Yêu cầu gia hạn ngày {renewalRecord.createdAt.split(" ")[0]}</Text>

                                        <Text>Ngày mượn yêu cầu: {renewalRecord.requestBorrowDate}</Text>
                                        <Text>Ngày đến hạn yêu cầu: {renewalRecord.requestDueDate}</Text>
                                        {renewalRecord.note.length > 0 && <Text>Lý do: {renewalRecord.note}</Text>}
                                        <Text fontWeight={700} textAlign={'right'} fontSize={14} color={color}>{label}</Text>
                                    </VStack>

                                </Box>
                            })}
                        </Box>
                    )}


                </VStack>
            </ScrollView>
            <HStack justifyContent={'center'} position={'absolute'} bottom={0} height={16} w='100%'
                opacity={borrowRecordDetail.status === "PENDING" || borrowRecordDetail.status === "BORROWED" || borrowRecordDetail.status === "RETURN_PENDING" ? 1 : 0}
            >
                <Button flex={1} borderRadius={0} colorScheme={'info'} onPress={() => navigation.navigate('RenewalRequestPage', { borrowRecordId: borrowRecordId })}>
                    Gia hạn thời gian
                </Button>
                {borrowRecordDetail.status === "PENDING" && (
                    <Button flex={1} variant={'subtle'} borderRadius={0} colorScheme={'danger'} onPress={handleOpen}>
                        Huỷ đơn mượn sách
                    </Button>
                )}
            </HStack>
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
    return `${day} / ${month} / ${year}`;
};