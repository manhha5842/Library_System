import React, { useState, useEffect, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Box, Text, HStack, VStack, ScrollView, Center, Divider, Spinner, Skeleton, Flex, Button, Heading, Badge, ZStack } from "native-base";
import axios from 'axios';
import apiConfig from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../constants';
import { StackNavigationProp } from '@react-navigation/stack';
import { BorrowRecordDetail, FineRecord, RenewalRecord, Book, BookView } from '../types';
import CustomAlertDialog from '../components/AlertDialog';
import { mockBorrowRecordDetails } from '../types/mockData';
import InfoRow from '../components/detail/InfoRow';
import api from '../config/apiConfig';
import { formatDate } from '../utils/dateUtils'

type BorrowRecordDetailNavigationProp = StackNavigationProp<
    RootStackParamList,
    'BorrowRecordDetailPage'
>;

type BorrowRecordDetailRouteProp = RouteProp<RootStackParamList, 'BorrowRecordDetailPage'>;

const LoadingSpinner = () => (
    <Center flex={1}>
        <Spinner size="lg" />
    </Center>
);

const BorrowRecordHeader: React.FC<{ id: string; status: string }> = ({ id, status }) => {
    const { label, color, type } = getStatusDetails(status);
    return (
        <>
            <Heading pb={3} color={'dark.200'}>Đơn mượn sách #{id}</Heading>
            <Box pb={3}>
                <Badge colorScheme={type} h={12}>
                    <Center>
                        <Text color={color} fontWeight={600}>{label}</Text>
                    </Center>
                </Badge>
            </Box>
        </>
    );
};

const StudentInfoSection: React.FC = () => {
    const { user } = useUser();
    return (
        <Box pb={3}>
            <Text fontWeight={600}>Thông tin sinh viên</Text>
            <Text px={3} color={'gray.500'}>{user?.name} - {user?.email}</Text>
        </Box>
    );
};

const BorrowDatesSection: React.FC<{ borrowDate: string; dueDate: string }> = ({ borrowDate, dueDate }) => (
    <HStack mb={3} justifyContent={'space-between'}>
        <Box>
            <Text fontWeight={600}>Thời gian nhận sách</Text>
            <Text px={3} color={'gray.500'}>{formatDate(borrowDate)}</Text>
        </Box>
        <Divider bg="indigo.500" thickness="1" orientation="vertical" />
        <Box>
            <Text fontWeight={600}>Thời gian trả sách</Text>
            <Text px={3} color={'gray.500'}>{formatDate(dueDate)}</Text>
        </Box>
    </HStack>
);

const BookListTable: React.FC<{ books: BookView[] }> = ({ books }) => (
    <VStack>
        <Text fontWeight={600} py={3}>Sách đã chọn {books?.length || 0}</Text>
        <HStack bg={'lightBlue.200'}>
            <Text fontWeight={500} w={"10%"} textAlign={'center'}>STT</Text>
            <Divider bg="indigo.500" thickness="0.5" mx="2" orientation="vertical" />
            <Text fontWeight={500} w={"85%"}>Tên sách</Text>
        </HStack>
        <Divider bg="indigo.500" thickness="0.5" w={'100%'} orientation="horizontal" />
        {books?.map((book, bookIndex) => (
            <HStack key={book.id} bg={bookIndex % 2 === 0 ? 'lightBlue.100' : 'white'} alignItems={'center'} py={1}>
                <Text fontWeight={300} w={"10%"} textAlign={'center'} fontSize={12}>{bookIndex + 1}</Text>
                <Divider bg="indigo.500" thickness="0.5" mx="2" orientation="vertical" />
                <Text fontWeight={300} w={"85%"} lineBreakMode='middle' fontSize={12}>{book.title}</Text>
            </HStack>
        ))}
        <Divider bg="indigo.500" thickness="0.5" orientation="horizontal" />
    </VStack>
);

const FineRecordsSection: React.FC<{ fineRecords: FineRecord[] }> = ({ fineRecords }) => {
    if (!fineRecords || fineRecords.length === 0) return null;
    return (
        <Box>
            <Text fontWeight={600} pt={3}>Phiếu phạt</Text>
            {fineRecords.map((fineRecord, index) => {
                const { label, color, type } = getFineStatus(fineRecord.status);
                return (
                    <Box key={fineRecord.id} p={3} borderWidth={1} borderColor="gray.300" borderRadius={5} mt={2} bgColor={color}>
                        <HStack justifyContent={'space-between'}>
                            <Text fontWeight={500} fontSize={14}>Phiếu phạt {index + 1}</Text>
                            <Text fontSize={12}>Trạng thái: <Text fontWeight={800} colorScheme={type}>{label}</Text></Text>
                        </HStack>
                        <Text fontSize={12}>Lý do phạt: {fineRecord.reason}</Text>
                        <Text fontSize={12}>Số tiền phạt: {fineRecord.amount}</Text>
                    </Box>
                );
            })}
        </Box>
    );
};

const RenewalRecordsSection: React.FC<{ renewalRecords: RenewalRecord[] }> = ({ renewalRecords }) => {
    if (!renewalRecords || renewalRecords.length === 0) return null;
    return (
        <Box>
            <Text fontWeight={600} pt={3}>Lịch sử gia hạn</Text>
            {renewalRecords.map((renewalRecord) => {
                const { label, color } = getRenewalRecordStatus(renewalRecord.status);
                return (
                    <Box key={renewalRecord.id} p={3} borderWidth={1} borderColor="gray.300" borderRadius={5} mt={2} bgColor={'light.100'}>
                        <VStack>
                            <Text mb={3} fontWeight={500} fontSize={14}>Yêu cầu gia hạn ngày {formatDate(renewalRecord.createdAt)}</Text>
                            <Text>Ngày mượn yêu cầu: {formatDate(renewalRecord.requestBorrowDate)}</Text>
                            <Text>Ngày đến hạn yêu cầu: {formatDate(renewalRecord.requestDueDate)}</Text>
                            {renewalRecord.note?.length > 0 && <Text>Lý do: {renewalRecord.note}</Text>}
                            <Text fontWeight={700} textAlign={'right'} fontSize={14} color={color}>{label}</Text>
                        </VStack>
                    </Box>
                );
            })}
        </Box>
    );
};

const ActionButtons: React.FC<{ status: string; onRenew: () => void; onCancel: () => void; }> = ({ status, onRenew, onCancel }) => {
    const showButtons = status === "PENDING" || status === "BORROWED" || status === "RETURN_PENDING";
    if (!showButtons) return null;

    return (
        <HStack justifyContent={'center'} position={'absolute'} bottom={0} height={16} w='100%'>
            {(status === "BORROWED" || status === "RETURN_PENDING") &&
                <Button flex={1} borderRadius={0} colorScheme={'info'} onPress={onRenew}>
                    Gia hạn thời gian
                </Button>
            }
            {status === "PENDING" && (
                <Button flex={1} variant={'solid'} borderRadius={0} colorScheme={'danger'} onPress={onCancel}>
                    Huỷ đơn mượn sách
                </Button>
            )}
        </HStack>
    );
};

export default function BorrowRecordDetailPage() {
    const navigation = useNavigation<BorrowRecordDetailNavigationProp>();
    const route = useRoute<BorrowRecordDetailRouteProp>();
    const { borrowRecordId } = route.params;

    const [borrowRecordDetail, setBorrowRecordDetail] = useState<BorrowRecordDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const [isCancelAlertOpen, setCancelAlertOpen] = useState(false);
    const [isErrorAlertOpen, setErrorAlertOpen] = useState(false);
    const [isSuccessAlertOpen, setSuccessAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ title: '', message: '' });

    const fetchDetails = useCallback(async () => {
        try {
            const response = await api.get<BorrowRecordDetail>(`/borrows/${borrowRecordId}`);
            if (response?.status === 200) {
                setBorrowRecordDetail(response.data);
            }
        } catch (error) {
            console.info('Error fetching borrow record, using mock data.', error);
            const mock = mockBorrowRecordDetails.find(b => b.id === borrowRecordId);
            if (mock) setBorrowRecordDetail(mock);
            else {
                setAlertMessage({ title: 'Lỗi', message: 'Không tìm thấy chi tiết phiếu mượn.' });
                setErrorAlertOpen(true);
            }
        }
    }, [borrowRecordId]);

    useEffect(() => {
        setIsLoading(true);
        fetchDetails().finally(() => setIsLoading(false));
    }, [fetchDetails]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchDetails();
        setRefreshing(false);
    }, [fetchDetails]);

    const handleCancel = async () => {
        if (!borrowRecordDetail) return;
        setCancelAlertOpen(false);
        setIsPending(true);
        try {
            const response = await api.put<BorrowRecordDetail>(`/request/cancel/${borrowRecordDetail.id}`);
            if (response?.status === 200) {
                setBorrowRecordDetail(response.data);
                setAlertMessage({ title: 'Thành công', message: `Đơn mượn sách ${borrowRecordDetail.id} đã được huỷ.` });
                setSuccessAlertOpen(true);
            }
        } catch (error) {
            console.log('Error cancelling borrow record, using mock update.', error);
            // Simulate cancellation on error
            const updatedMockRecord = { ...borrowRecordDetail, status: 'CANCELLED' as const };
            setBorrowRecordDetail(updatedMockRecord);
            setAlertMessage({ title: 'Thành công', message: `Đơn mượn sách ${borrowRecordDetail.id} đã được huỷ (mô phỏng).` });
            setSuccessAlertOpen(true);
        } finally {
            setIsPending(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!borrowRecordDetail) {
        return <Center flex={1}><Text>Không có dữ liệu để hiển thị.</Text></Center>;
    }

    return (
        <Box flex={1}>
            <CustomAlertDialog
                isOpen={isCancelAlertOpen}
                onClose={() => setCancelAlertOpen(false)}
                title="Xác nhận huỷ đơn"
                message="Bạn muốn huỷ đơn mượn sách?"
                buttons={[{ label: 'Đồng ý', onPress: handleCancel, colorScheme: 'danger' }, { label: 'Huỷ bỏ', onPress: () => setCancelAlertOpen(false), colorScheme: 'info', isCancel: true }]}
            />
            <CustomAlertDialog
                isOpen={isErrorAlertOpen}
                onClose={() => setErrorAlertOpen(false)}
                title={alertMessage.title}
                message={alertMessage.message}
                buttons={[{ label: 'Đồng ý', onPress: () => setErrorAlertOpen(false), colorScheme: 'danger' }]}
            />
            <CustomAlertDialog
                isOpen={isSuccessAlertOpen}
                onClose={() => setSuccessAlertOpen(false)}
                title={alertMessage.title}
                message={alertMessage.message}
                buttons={[{ label: 'Đồng ý', onPress: () => setSuccessAlertOpen(false), colorScheme: 'success' }]}
            />

            <ScrollView minH="100%" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <VStack p={3} pb={32} space={3}>
                    <BorrowRecordHeader id={borrowRecordDetail.id} status={borrowRecordDetail.status} />
                    <StudentInfoSection />
                    <BorrowDatesSection borrowDate={borrowRecordDetail.borrowDate} dueDate={borrowRecordDetail.dueDate} />
                    <BookListTable books={borrowRecordDetail.books || []} />
                    {borrowRecordDetail.note?.length > 0 && <InfoRow label="Ghi chú" value={borrowRecordDetail.note} />}
                    <FineRecordsSection fineRecords={borrowRecordDetail.fineRecords || []} />
                    <RenewalRecordsSection renewalRecords={borrowRecordDetail.renewalRecords || []} />
                </VStack>
            </ScrollView>

            <ActionButtons
                status={borrowRecordDetail.status}
                onRenew={() => navigation.navigate('RenewalRequestPage', { borrowRecordId: borrowRecordId })}
                onCancel={() => setCancelAlertOpen(true)}
            />

            {isPending && (
                <ZStack size="100%" position="absolute" alignItems="center" justifyContent="center" bg="rgba(0,0,0,0.4)">
                    <Spinner size="lg" color="white" />
                </ZStack>
            )}
        </Box>
    );
}

const getStatusDetails = (status: string) => {
    switch (status) {
        case 'PENDING': return { label: 'Chờ xác nhận', color: 'orange.500', type: 'warning' };
        case 'APPROVED': return { label: 'Đã xác nhận', color: 'cyan.500', type: 'info' };
        case 'BORROWED': return { label: 'Đang mượn', color: 'green.500', type: 'success' };
        case 'RETURN_PENDING': return { label: 'Chờ trả sách', color: 'yellow.500', type: 'warning' };
        case 'COMPLETED': return { label: 'Đã hoàn thành', color: 'gray.500', type: 'muted' };
        case 'CANCELLED': return { label: 'Đã huỷ', color: 'red.500', type: 'error' };
        case 'REJECTED': return { label: 'Bị từ chối', color: 'red.500', type: 'error' };
        default: return { label: 'Không xác định', color: 'gray.500', type: 'muted' };
    }
};

const getFineStatus = (status: string) => {
    switch (status) {
        case 'PENDING': return { label: 'Chờ thanh toán', color: 'orange.300', type: 'warning' };
        case 'PAID': return { label: 'Đã thanh toán', color: 'green.300', type: 'success' };
        default: return { label: 'Không xác định', color: 'gray.300', type: 'muted' };
    }
};

const getRenewalRecordStatus = (status: string) => {
    switch (status) {
        case 'PENDING': return { label: 'Chờ xác nhận', color: 'orange.500' };
        case 'APPROVED': return { label: 'Đã xác nhận', color: 'green.500' };
        case 'REJECTED': return { label: 'Bị từ chối', color: 'red.500' };
        default: return { label: 'Không xác định', color: 'gray.500' };
    }
};
