import React, { useState, useEffect, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { Box, Text, HStack, VStack, ScrollView, Center, Input, Radio, Stack, SectionList, Divider, Spinner, Skeleton, Flex, TextArea, Button, Heading, ZStack } from "native-base"
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { BookProvider, useBooks } from '../context/BookContext';

import { RootStackParamList } from '../constants';
import { StackNavigationProp } from '@react-navigation/stack';
import { BorrowRecordDetail } from '../types';
import MyDateTimePicker from '../components/MyDateTimePicker';
import CustomAlertDialog from '../components/AlertDialog';
type RenewalRequestNavigationProp = StackNavigationProp<
    RootStackParamList,
    'RenewalRequestPage'
>;


type RenewalRequestRouteProp = RouteProp<RootStackParamList, 'RenewalRequestPage'>;

export default function RenewalRequestPage() {

    const navigation = useNavigation<RenewalRequestNavigationProp>();
    const { user } = useUser();
    const route = useRoute<RenewalRequestRouteProp>();
    const { borrowRecordId } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [borrowRecordDetail, setBorrowRecordDetail] = useState<BorrowRecordDetail | null>(null);
    const [note, setNote] = useState<string>('');
    const [newBorrowDate, setNewBorrowDate] = useState<Date | null>(null);
    const [newDueDate, setNewDueDate] = useState<Date | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string>('');

    const fetchBorrowRecordDetail = async (id: string | undefined) => {
        console.info('Fetch borrow record detail');
        if (isLoading) {
            console.info('Fetching data from other requests');
            return;
        } else {
            try {
                setIsLoading(true);
                const response = await axios.get<BorrowRecordDetail>(`${apiConfig.baseURL}/api/request/getBorrowRecord/${id}`);
                if (response?.status === 200) {
                    await setBorrowRecordDetail(response.data);
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

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
        } catch (error) {
            console.info('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    if (isLoading && !borrowRecordDetail) {
        return (<ScrollView>
            <VStack space={5} safeArea padding={3} minH={'100%'}>
                <Center>
                    <Skeleton size='64' />
                </Center>
                <Skeleton.Text fontSize={'lg'} textAlign={'center'} />
            </VStack>
        </ScrollView>
        );
    }



    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleAccept = async () => {
        setIsPending(true);
        try {
            const renewalRequestDTO = {
                borrowRecordId: borrowRecordId,
                requestBorrowDate: newBorrowDate?.toISOString().split('T')[0],
                requestDueDate: newDueDate?.toISOString().split('T')[0],
                note: note,
            };
            const response = await axios.post(`${apiConfig.baseURL}/api/request/createRenewalRecord`, renewalRequestDTO);
            if (response?.status === 200) {
                setIsSuccess(true);
            }
        } catch (error) {
            setIsError(true);
            console.log('Error cancelling borrow record:', error);
        }
        setIsPending(false);
        handleClose();
    };

    return <Box>
        <CustomAlertDialog isOpen={isOpen} onClose={handleClose}
            title="Xác nhận xin gia hạn"
            message={"Thời gian nhận sách vào ngày" + "\n" + formatDate(newBorrowDate)
                + "\n" + "Thời hạn trả sách vào ngày" + "\n" + formatDate(newDueDate)}
            buttons={[
                {
                    label: 'Huỷ bỏ',
                    onPress: handleClose,
                    colorScheme: 'info',
                    isCancel: true
                },
                {
                    label: 'Đồng ý',
                    onPress: handleAccept,
                    colorScheme: 'success'
                },
            ]}
        />
        <CustomAlertDialog isOpen={isError} onClose={handleClose}
            title="Có lỗi xảy ra"
            message="Có lỗi xảy ra vui lòng thử lại sau hoặc liên hệ với nhân viên thư viện"
            buttons={[{
                label: 'Đồng ý',
                onPress: () => setIsError(false),
                colorScheme: 'danger',
            },]}
        />
        <CustomAlertDialog isOpen={isSuccess} onClose={handleClose}
            title="Yêu cầu thành công"
            message={"Yêu cầu gia hạn đã được gửi, vui lòng chờ thông báo phản hồi trong thời gian 3 ngày(không tính thứ 7 và chủ nhật)."}
            buttons={[{
                label: 'Đồng ý',
                onPress: () => navigation.goBack(),
                colorScheme: 'success'
            },]}
        />
        <ScrollView minH={'100%'} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}  >
            <VStack p={3} pb={32} space={3}>
                <Center><Heading>Gia hạn thời gian</Heading></Center>

                <Box >
                    <Text fontWeight={600}>Đơn mượn sách #{borrowRecordId}</Text>
                    <Text px={3} color={'gray.500'}>{user?.email}</Text>
                </Box>
                <Box>
                    <Text fontWeight={600} pb={2}>Sách đã chọn</Text>
                    <HStack bg={'lightBlue.200'}>
                        <Text fontWeight={500} w={"10%"} textAlign={'center'}>STT</Text>
                        <Divider bg="indigo.500" thickness="0.5" mx="2" orientation="vertical" />
                        <Text fontWeight={500} w={"85%"}>Tên sách</Text>
                    </HStack>
                    <Divider bg="indigo.500" thickness="0.5" w={'100%'} orientation="horizontal" />
                    {borrowRecordDetail?.books?.map((book, bookIndex) => (
                        <HStack key={book.id} bg={bookIndex % 2 == 0 ? 'lightBlue.100' : 'white'} alignItems={'center'} py={1}>
                            <Text fontWeight={300} w={"10%"} textAlign={'center'} fontSize={12}>{bookIndex + 1}</Text>
                            <Divider bg="indigo.500" thickness="0.5" mx="2" orientation="vertical" />
                            <Text fontWeight={300} w={"85%"} lineBreakMode='middle' fontSize={12}>{book.title}</Text>
                        </HStack>
                    ))}
                    <Divider bg="indigo.500" thickness="0.5" orientation="horizontal" />
                </Box>

                <HStack mb={3} justifyContent={'space-between'}>
                    <Box>
                        <Text fontWeight={600}>Thời gian nhận sách</Text>
                        <Flex direction="row">
                            <Text px={3} color={'gray.500'}>{formatDate(borrowRecordDetail ? borrowRecordDetail.borrowDate : null)}</Text>
                        </Flex>
                    </Box>
                    <Divider bg="indigo.500" thickness="1" orientation="vertical" />
                    <Box>
                        <Text fontWeight={600}>Thời gian trả sách</Text>
                        <Flex direction="row">
                            <Text px={3} color={'gray.500'}>{formatDate(borrowRecordDetail ? borrowRecordDetail.dueDate : null)}</Text>
                        </Flex>
                    </Box>
                </HStack>


                {borrowRecordDetail?.status == "PENDING" && <Box>
                    <Text fontWeight={600}>Chọn thời gian nhận sách mới</Text>
                    <MyDateTimePicker selectDate={newBorrowDate} setSelectDate={setNewBorrowDate} setDueDate={setNewDueDate} />
                </Box>}

                {borrowRecordDetail?.status == "RETURN_PENDING" || borrowRecordDetail?.status == "BORROWED" && <Box>
                    <Text fontWeight={600}>Gia hạn thời gian trả sách</Text>
                    <Text fontWeight={600} py={3}>Lý do</Text>
                    <TextArea h={20} placeholder="Nhập lý do xin gia hạn" maxW="100%" autoCompleteType={undefined} p={2} onChangeText={e => setNote(e)} />

                    {/*       <MyDateTimePicker selectDate={selectDate} setSelectDate={setSelectDate} setDueDate={setDueDate} /> */}
                </Box>}

                <Button mt={6} onPress={handleOpen} disabled={newBorrowDate == null && newDueDate == null} colorScheme={newBorrowDate == null && newDueDate == null ? 'light' : 'primary'}  >
                    Gửi yêu cầu
                </Button>



                <Text fontWeight={600} py={3}>{borrowRecordDetail?.note ? "borrowRecord.note" : ""}</Text>
                <Text> {borrowRecordDetail?.note}</Text>
            </VStack>
        </ScrollView>
        <HStack justifyContent={'center'} bottom={0} height={16} >
            <Button h={10}>Xác nhận</Button>
        </HStack>
        {isPending && <ZStack size={"100%"} opacity={1} position={'absolute'}>
            <Center bg={'white'} position={'absolute'} zIndex={99}>
            </Center>
            <Center size={"100%"} position={'absolute'} zIndex={99}>
                <Spinner size="xl" w={'100%'} />
            </Center>
        </ZStack>}
    </Box>;

}

const formatDate = (dateString: Date | null | string): string => {
    if (!dateString) return 'DD / MM / YYYY';
    const date = new Date(dateString);
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};
