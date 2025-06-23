import React, { useState, createContext, useRef, useEffect, useCallback } from 'react';
import { Animated, StyleSheet, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, RefreshControl, Dimensions } from 'react-native';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Box, Container, Text, HStack, VStack, Heading, Input, Image, Badge, WarningOutlineIcon, ScrollView, Icon, Pressable, ZStack, Center, Spinner, Skeleton, Select, CheckIcon, Button, Flex, Divider, Stack, Slider, AddIcon, MinusIcon, TextArea, AlertDialog } from "native-base"
import axios from 'axios';
import api from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { BookProvider, useBooks } from '../context/BookContext';

import { RootStackParamList } from '../constants';
import { StackNavigationProp } from '@react-navigation/stack';
import { Book, Category } from '../types';
import MyDateTimePicker from '../components/MyDateTimePicker';
import { useCart } from '../context/CartContext';
import { mockBooks } from '../types/mockData';
import { useToast } from 'native-base';
type BorrowRequestNavigationProp = StackNavigationProp<
    RootStackParamList,
    'BorrowRequest'
>;
type BorrowRequestRouteProp = RouteProp<RootStackParamList, 'BorrowRequest'>;

export default function BorrowRequest() {
    const { user } = useUser();
    const navigation = useNavigation<BorrowRequestNavigationProp>();
    const toast = useToast();
    const { deleteBook } = useCart();
    const [refreshing, setRefreshing] = useState(false);
    const [isLoadedBook, setIsLoadedBook] = useState(false);
    const route = useRoute<BorrowRequestRouteProp>();
    const { selectedBookIds } = route.params;

    const screenWidth = Dimensions.get('window').width;
    const positionForm = useRef(new Animated.Value(0)).current;
    const positionConfirm = useRef(new Animated.Value(screenWidth)).current;
    const [step, setStep] = useState<number | null>(0);
    const [isExpand, setIsExpand] = useState<boolean>(false);
    const [selectBooks, setSelectBooks] = useState<Book[]>([]);
    const [selectDate, setSelectDate] = useState<Date | null>(route.params.selectDate ? new Date(route.params.selectDate) : null);
    const [dueDate, setDueDate] = useState<Date | null>(route.params.dueDate ? new Date(route.params.dueDate) : null);
    const [note, setNote] = useState<String>('');
    const borrowRecordDTO = {
        id: '',
        borrowDate: selectDate?.toISOString().split('T')[0],
        dueDate: dueDate?.toISOString().split('T')[0],
        note: note,
        status: '',
        books: selectBooks.map(book => ({ id: book.id, title: book.title }))
    };

    const [isOpen, setIsOpen] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [isPending, setIsPending] = React.useState(false);
    const onClose = () => setIsOpen(false);
    const cancelRef = React.useRef(null);

    const moveToLeft = (position: Animated.Value) => {
        Animated.timing(position, {
            toValue: -screenWidth,
            duration: 500,
            useNativeDriver: true
        }).start();
    };
    const moveToRight = (position: Animated.Value) => {
        Animated.timing(position, {
            toValue: screenWidth,
            duration: 500,
            useNativeDriver: true
        }).start();
    };
    const moveToCenter = (position: Animated.Value) => {
        Animated.timing(position, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
        }).start();
    };

    const onRefresh = useCallback(async () => {
        await setRefreshing(true);
        try {
        } catch (error) {
            console.info('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const submitBorrowRecord = async () => {
        try {
            await setIsPending(true);
            console.log("đang gửi yêu cầu");
            const response = await api.post(`/request/createBorrowRecord`, borrowRecordDTO, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setIsOpen(true);
            if (response.status === 200) {
                console.log('Thành công:', response.data);
                setIsSuccess(true);
                selectBooks.forEach(book => deleteBook(book.id));
            } else {
                setIsPending(false);
                console.log('Có lỗi xảy ra:', response.status, response.data);
                console.log('Có lỗi xảy ra:', response.status, response);
            }


        } catch (error) {
            console.log('Lỗi:', error)
            setIsOpen(true);
            setIsPending(false);
        }
    };
    const RenderBook = () => {
        const { books, fetchBookByIds, isFetching } = useBooks();
        const [localBooks, setLocalBooks] = useState(books);
        useEffect(() => {
            const fetchDataBook = async () => {
                console.log('Fetching data book');
                try {
                    await fetchBookByIds(selectedBookIds);
                } catch (e) {
                    setLocalBooks(mockBooks);
                } finally {
                    setIsLoadedBook(true);
                }
            };
            if (!isLoadedBook || books.length == 0) fetchDataBook();
            if (selectBooks.length <= 0) setSelectBooks(books.length > 0 ? books : mockBooks);
        }, []);


        interface RenderSkeletonBoxesProps {
            count: number;
        }
        const RenderSkeletonBoxes: React.FC<RenderSkeletonBoxesProps> = ({ count }) => {
            return (
                <VStack space={3} >
                    {Array.from({ length: count }, (_, index) => (
                        <Box key={index} flexDirection={"row"} borderWidth={1} shadow={5} width={"100%"} height={16} borderRadius={15} bg={'white'} overflow="hidden" borderColor={'coolGray.200'}>
                            <Skeleton borderRadius={15} h={'100%'} width={16} />
                            <Skeleton.Text fontWeight={500} fontSize={"xs"} h={12} rounded="full" lines={2} p={1} />
                        </Box>
                    ))}
                </VStack>
            );
        };
        if ((books.length == 0 && !localBooks.length) || isFetching) {
            return (
                <VStack space={3}>
                    <RenderSkeletonBoxes count={selectedBookIds.length} />
                </VStack>)
        }
        return (
            <VStack space={3}>
                {(isExpand ? (books.length > 0 ? books : localBooks) : (books.length > 0 ? books : localBooks).slice(0, 3)).map((book) => (
                    <Box key={book.id}
                        flexDirection={"row"} shadow={5} width={"100%"} height={16} borderRadius={15} overflow="hidden" bg={'white'}
                    >
                        <Image
                            resizeMode="cover" borderRadius={15} alt='Banner Image' width={16}
                            source={{ uri: book.image }}
                        />
                        <VStack p={1} space={1} top={0} flexShrink={1}>
                            <Text fontWeight={500} fontSize={"xs"} numberOfLines={2} isTruncated >{book.title}</Text>
                            <Text color={"gray.400"} fontSize={"xs"} isTruncated>{book.author.map(author => author.name).join(', ')}</Text>
                        </VStack>
                    </Box>
                ))}
            </VStack>
        );
    }
    const onSubmit = () => {
        if (step == 0) {
            if (selectDate == null) {
                setIsOpen(true);
            } else {
                moveToLeft(positionForm);
                moveToCenter(positionConfirm);
                setStep(1);

            }
        } else if (step == 1) {
            submitBorrowRecord();
        }
    };
    const onBack = () => {
        if (step == 1) {
            moveToCenter(positionForm);
            moveToRight(positionConfirm);
            setStep(0);
        }
    };
    const onExpand = () => {
        if (isExpand) {
            setIsExpand(false);
        } else {
            setIsExpand(true);
        }
    }
    const handleConfirm = () => {
        if (isSuccess) {
            navigation.navigate('HomeTabs');
        } if (selectDate == null) {
            setIsOpen(false);
        } else {
            navigation.goBack();
        }
    };

    return (
        <ZStack flex={1}>

            <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
                <AlertDialog.Content>
                    <AlertDialog.Body>
                        <Text textAlign={'center'}>
                            {isSuccess ? 'Yêu cầu mượn sách thành công. Vui lòng nhận sách đúng hẹn.' : selectDate == null ? "Vui lòng chọn ngày nhận sách" : 'Dữ liệu có sự thay đổi. Vui lòng cập nhật lại giỏ sách của bạn.'}
                        </Text>
                    </AlertDialog.Body>
                    <AlertDialog.Footer justifyContent={'center'} >
                        <Button variant="subtle" colorScheme={isSuccess ? 'info' : 'red'} onPress={handleConfirm} ref={cancelRef}   >
                            {isSuccess ? 'Quay lại trang chủ' : selectDate == null ? "Quay lại" : 'Quay lại giỏ sách'}
                        </Button>
                    </AlertDialog.Footer>
                </AlertDialog.Content>
            </AlertDialog>
            <Animated.View style={{ height: "100%", transform: [{ translateX: positionForm }] }}>
                <Heading textAlign={'center'} pb={3}>Đặt lịch mượn sách</Heading>
                <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} >
                    <VStack px={3} flex={1}
                        pb={24}>
                        <Text fontWeight={600} pb={3}>Sách bạn chọn</Text>
                        <BookProvider>
                            <RenderBook />
                        </BookProvider>
                        <HStack justifyContent='space-between' w="100%">
                            <Text py={3} color={'coolGray.400'} fontSize={"xs"}>Số lượng: {selectedBookIds.length}</Text>
                            <Button variant="link" h={12} onPress={onExpand} opacity={selectedBookIds.length <= 3 ? 0 : 1}>
                                {isExpand ? 'Rút gọn' : 'Xem thêm'}
                            </Button>
                        </HStack>
                        <VStack>
                            <Box pb={3}>
                                <Text fontWeight={600}>Chọn ngày nhận sách</Text>
                                <Text color={'coolGray.400'} fontSize={'10'}>Chỉ được đặt hẹn không quá 30 ngày</Text>
                            </Box>

                            <MyDateTimePicker selectDate={selectDate} setSelectDate={setSelectDate} />
                            <Box pb={3}>
                                <Text fontWeight={600}>Thời hạn mượn</Text>
                                <Text color={'coolGray.400'} fontSize={'10'} pl={1}>Thời gian mượn tối đa 14 ngày</Text>
                            </Box>
                            <HStack space={4} justifyContent={'space-between'} alignItems={'center'}>
                                <VStack px={3}>
                                    <Text>{dueDate ? 'Trả trước ngày ' + dueDate.getDate() + '/' + dueDate.getMonth() + '/' + dueDate.getFullYear() : 'Vui lòng chọn ngày nhận sách'}</Text>
                                </VStack>
                            </HStack>
                        </VStack>
                    </VStack>
                </ScrollView>
            </Animated.View>

            <Animated.View style={{ height: "100%", transform: [{ translateX: positionConfirm }], flex: 1 }}>
                <Heading textAlign={'center'} pb={3}>Kiểm tra thông tin</Heading>

                <ScrollView minH={'100%'} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}  >
                    <VStack p={3} pb={32}>
                        <Box pb={3}>
                            <Text fontWeight={600}>Họ và tên sinh viên</Text>
                            <Text px={3} color={'gray.500'}>{user?.name}</Text>
                        </Box>

                        <Box pb={3}>
                            <Text fontWeight={600}>Email sinh viên</Text>
                            <Text px={3} color={'gray.500'}>{user?.email}</Text>
                        </Box>

                        <HStack mb={3} justifyContent={'space-between'}>
                            <Box>
                                <Text fontWeight={600}>Thời gian nhận sách</Text>
                                <Flex direction="row">
                                    <Text px={3} color={'gray.500'}>Ngày {selectDate ? ("0" + selectDate?.getDate()).slice(-2) : 'DD'} / {selectDate ? ("0" + (selectDate.getMonth() + 1)).slice(-2) : 'MM'} / {selectDate ? selectDate.getFullYear() : 'YYYY'}</Text>
                                </Flex>
                            </Box>
                            <Divider bg="indigo.500" thickness="1" orientation="vertical" />
                            <Box>
                                <Text fontWeight={600}>Thời hạn trả sách</Text>
                                <Flex direction="row">
                                    <Text px={3} color={'gray.500'}>Ngày {dueDate ? ("0" + dueDate?.getDate()).slice(-2) : 'DD'} / {dueDate ? ("0" + (dueDate.getMonth() + 1)).slice(-2) : 'MM'} / {dueDate ? dueDate.getFullYear() : 'YYYY'}</Text>
                                </Flex>
                            </Box>
                        </HStack>

                        <Text fontWeight={300} fontSize={12} color={'gray.900'}>
                            Quý sinh viên vui lòng đến nhận và trả sách đúng lịch đã đăng ký. Nếu sinh viên không thể đến nhận sách vào ngày đã hẹn, đơn mượn sách sẽ tự động hủy. Trong trường hợp trả sách muộn, mỗi ngày trễ hạn sẽ bị phạt 5,000 VND. Đặc biệt, nếu thời gian trả sách quá hạn trên 30 ngày, sinh viên sẽ bị trừ điểm rèn luyện.
                        </Text>

                        <Text fontWeight={600} py={3}>Sách đã chọn</Text>
                        <HStack bg={'lightBlue.200'}>
                            <Text fontWeight={500} w={"10%"} textAlign={'center'}>STT</Text>
                            <Divider bg="indigo.500" thickness="0.5" mx="2" orientation="vertical" />
                            <Text fontWeight={500} w={"85%"}>Tên sách</Text>
                        </HStack>

                        <Divider bg="indigo.500" thickness="0.5" w={'100%'} orientation="horizontal" />
                        {selectBooks?.map((book, bookIndex) => (
                            <HStack key={book.id} bg={bookIndex % 2 == 0 ? 'lightBlue.100' : 'white'} alignItems={'center'} py={1}>
                                <Text fontWeight={300} w={"10%"} textAlign={'center'} fontSize={12}>{bookIndex + 1}</Text>
                                <Divider bg="indigo.500" thickness="0.5" mx="2" orientation="vertical" />
                                <Text fontWeight={300} w={"85%"} lineBreakMode='middle' fontSize={12}>{book.title}</Text>
                            </HStack>

                        ))}
                        <Divider bg="indigo.500" thickness="0.5" orientation="horizontal" />

                        <Text fontWeight={600} py={3}>Ghi chú</Text>
                        <TextArea h={20} placeholder="Nhập ghi chú" maxW="100%" autoCompleteType={undefined} mb={40} p={2} onChangeText={e => setNote(e)} />

                    </VStack>
                </ScrollView>
            </Animated.View>

            <Button variant={'outline'} opacity={step == 0 ? 0 : 1} bg={'white'} _pressed={{ backgroundColor: 'light.100', borderColor: 'light.100', }} colorScheme={'warning'}
                position={'absolute'} bottom={10} left={0} borderRadius={5} w={'32'} h={16} ml={2} shadow={5} disabled={isPending}
                _text={{ fontSize: '16' }} onPress={onBack}>
                Quay lại
            </Button>

            <Button variant={'solid'} colorScheme={'info'} position={'absolute'} bottom={10} right={0} borderRadius={5} w={'32'} h={16} mr={2} shadow={5}
                _text={{ fontSize: '16' }} onPress={onSubmit} isDisabled={selectDate == null || !isLoadedBook} disabled={isPending}>
                {step == 0 ? "Tiếp theo" : "Xác nhận"}
            </Button>
            {isPending && <ZStack size={"100%"} opacity={0.5}>
                <Center bg={'white'} position={'absolute'} zIndex={99}>
                </Center>
                <Center size={"100%"} position={'absolute'} zIndex={99}>
                    <Spinner size="xl" w={'100%'} />
                </Center>
            </ZStack>}

        </ZStack>
    );
}

