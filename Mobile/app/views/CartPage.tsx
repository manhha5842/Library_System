import React, { useState, createContext, useRef, useEffect, useCallback } from 'react';
import { Animated, StyleSheet, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, Keyboard, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Box, Container, Text, HStack, VStack, Heading, Button, Image, Badge, WarningOutlineIcon, Icon, Pressable, ZStack, Center, Input, Radio, Stack, SectionList, Divider, Slide, Alert, Skeleton, Spinner, AlertDialog } from "native-base"
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../constants';
import { useCarts } from '../context/CartContext';
import { useBooks } from '../context/BookContext';
import MyDateTimePicker from '../components/MyDateTimePicker';
import { RefreshControl } from 'react-native-gesture-handler';
type CartPageNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Cart'
>;


type CartPageRouteProp = RouteProp<RootStackParamList, 'Cart'>;

export default function CartPage() {
    const navigation = useNavigation<CartPageNavigationProp>();
    const { carts, unavailableBooks, checkAvailable, addBook, deleteBook } = useCarts();
    const route = useRoute<CartPageRouteProp>();
    const isDefault = route.params?.isDefault ?? true;
    const [selectedBooks, setSelectedBooks] = useState(new Set<string>());
    const [selectDate, setSelectDate] = useState<Date | null>();
    const [dueDate, setDueDate] = useState<Date | null>();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const navigateToBorrowRequest = () => {
        const selectDateString = selectDate ? selectDate.toISOString() : null;
        const dueDateString = dueDate ? dueDate.toISOString() : null;
        const selectedBookIds = Array.from(selectedBooks);
        navigation.navigate('BorrowRequest', { selectedBookIds, selectDate: selectDateString, dueDate: dueDateString });
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await checkAvailable();
        } catch (error) {
        } finally {
            setRefreshing(false);
        }
    }, []);
    const handleSelectBook = (bookId: string, isChecked: boolean) => {
        setSelectedBooks((prevSelectedBooks) => {
            const newSelectedBooks = new Set(prevSelectedBooks); // Tạo bản sao của Set hiện tại
            if (isChecked) {
                newSelectedBooks.add(bookId); // Thêm sách đã chọn
            } else {
                newSelectedBooks.delete(bookId); // Xóa sách đã bỏ chọn
            }
            console.log(newSelectedBooks);
            return newSelectedBooks;
        });
    };
    const handleSelectAll = (isChecked: boolean) => {
        setSelectAll(isChecked); // Đặt trạng thái của checkbox "Tất cả"
        setSelectedBooks((prevSelectedBooks) => {
            if (isChecked) {
                // Nếu checkbox "Tất cả" được chọn, thêm TẤT CẢ sách vào selectedBooks
                const allBookIds = new Set<string>();
                carts?.forEach((book) => allBookIds.add(book.id));
                return allBookIds;
            } else {
                // Nếu checkbox "Tất cả" không được chọn, xóa TẤT CẢ sách khỏi selectedBooks
                return new Set<string>();
            }
        });
    };
    const handleDeleteBook = async (id: string) => {
        await setIsLoading(true);
        await deleteBook(id);
        await setIsLoading(false);
    }
    useEffect(() => {
        const checkData = async () => {
            try {
                if (!isLoaded) {
                    await checkAvailable();
                }
            } finally {
            }
        };
        checkData();
    }, []);

    const RenderBook = () => {

        return <VStack space={3} >
            <Heading pt={5} pb='2' fontSize={16} >
                Giỏ sách của bạn
            </Heading>
            {carts && carts.length > 0 ? (
                carts.map((book) => (
                    <HStack alignItems={"center"} key={book.id}>
                        <Center w={'10%'} justifyContent={"center"}>
                            <BouncyCheckbox
                                size={20} fillColor='#0EA5E9'
                                isChecked={selectAll || selectedBooks.has(book.id)}
                                onPress={(isChecked: boolean) => {
                                    handleSelectBook(book.id, isChecked);
                                    if (!isChecked && selectAll) {
                                        setSelectAll(false); // Nếu bất kỳ sách nào được bỏ chọn, "Tất cả" cũng cần được cập nhật
                                    }
                                }}
                                style={{ width: '100%', padding: 5 }}
                            />
                        </Center>
                        <Pressable w={'80%'} pr={2} onPress={() => navigation.navigate('BookDetail', { bookId: book.id })}>
                            {({ isPressed }) => {
                                return (
                                    <HStack shadow={5} borderRadius={15} height={'20'}
                                        bg={isPressed ? "coolGray.100" : "white"}
                                    >
                                        <Image source={{ uri: book.image }}
                                            w={'20%'} resizeMode="cover" borderRadius={16} alt='Banner Image' />
                                        <VStack p={2} justifyContent={"space-between"} flexShrink={1} >
                                            <Text fontWeight={500} fontSize={"xs"} numberOfLines={2} isTruncated>{book.title}</Text>
                                            <Text color={"gray.400"} fontSize={"2xs"}>Victor Hugo</Text>
                                        </VStack>
                                        <Box position={'absolute'} h={20} w={'100%'} borderRadius={16} bg={'black'} opacity={isPressed ? "0.1" : 0} />
                                    </HStack>
                                );
                            }}
                        </Pressable>
                        <Pressable w={'10%'} onPress={() => handleDeleteBook(book.id)}>
                            {({ isPressed }) => {
                                return (
                                    <Center w={'100%'}>
                                        <Image
                                            source={require('../assets/icons/delete-icon.png')}
                                            resizeMode="cover" size={"10"} alt='Icon image' style={{ transform: [{ scale: isPressed ? 0.8 : 1 }] }}
                                        />
                                    </Center>
                                );
                            }}
                        </Pressable>
                    </HStack>
                ))
            ) : (
                <Center>
                    <Text bgColor={'coolGray.400'}>Hiện chưa có cuốn sách nào</Text>
                </Center>
            )}
            <Box opacity={unavailableBooks && unavailableBooks.length > 0 ? 1 : 0}>
                <Heading pt={5} pb='2' fontSize={16} >
                    Sách không khả dụng
                </Heading>
                <VStack space={5}>
                    {unavailableBooks && unavailableBooks.length > 0 ? (
                        unavailableBooks.map((book) => (
                            <HStack alignItems={"center"} key={book.id} >
                                <Pressable w={'90%'} pr={2} onPress={() => navigation.navigate('BookDetail', { bookId: book.id })}>
                                    {({ isPressed }) => {
                                        return (
                                            <HStack shadow={5} borderRadius={15} height={'20'}
                                                bg={isPressed ? "coolGray.100" : "white"}                                            >
                                                <Image source={{ uri: book.image }}
                                                    w={'20%'} resizeMode="cover" borderRadius={16} alt='Banner Image' />
                                                <VStack p={2} justifyContent={"space-between"} flexShrink={1} >
                                                    <Text fontWeight={500} fontSize={"xs"} numberOfLines={2} isTruncated>{book.title}</Text>
                                                    <Text color={"gray.400"} fontSize={"2xs"}>Victor Hugo</Text>
                                                </VStack>
                                                <Box position={'absolute'} h={20} w={'100%'} borderRadius={16} bg={'black'} opacity={isPressed ? "0.1" : 0} />
                                            </HStack>
                                        );
                                    }}
                                </Pressable>
                                <Pressable w={'10%'} onPress={() => handleDeleteBook(book.id)}>
                                    {({ isPressed }) => {
                                        return (
                                            <Center w={'100%'}>
                                                <Image
                                                    source={require('../assets/icons/delete-icon.png')}
                                                    resizeMode="cover" size={"10"} alt='Icon image' style={{ transform: [{ scale: isPressed ? 0.8 : 1 }] }}
                                                />
                                            </Center>
                                        );
                                    }}
                                </Pressable>
                            </HStack>
                        ))
                    ) : ('')}

                </VStack>
            </Box>
        </ VStack >
    }


    return (
        <VStack safeArea={isDefault ? true : 0} pb={isDefault ? 0 : 16} w={'100%'} minHeight={'100%'}>
            <AlertDialog leastDestructiveRef={React.useRef(null)} isOpen={isLoading} >
                <Spinner size={'lg'} />
            </AlertDialog>
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                < VStack p={3} mb={16} >
                    <Box justifyContent={"center"} h={"32"} mb={5}>
                        <Image
                            source={require('../assets/banner-basket.png')}
                            resizeMode="cover" borderRadius={16} h={"32"} alt='Banner Image' width={'100%'} />
                    </Box>
                    <Text color={'coolGray.600'}>Chọn ngày nhận sách dự kiến</Text>
                    <MyDateTimePicker selectDate={selectDate} setSelectDate={setSelectDate} setDueDate={setDueDate} />
                    <RenderBook />
                </VStack>
            </ScrollView >
            {carts && carts.length > 0 && (
                <HStack justifyContent="space-between" alignItems="center" position="absolute" shadow={15} w="100%" bottom={isDefault ? 0 : 60} height={12} bg="blue.100">
                    <HStack w="60%" justifyContent="flex-start" alignItems="center">
                        <BouncyCheckbox
                            size={20}
                            fillColor="#0EA5E9"
                            isChecked={selectAll}
                            onPress={(isChecked) => handleSelectAll(isChecked)}
                            style={{ paddingLeft: 18 }}
                        />
                        <Text w="20">Tất cả</Text>
                    </HStack>
                    <Button variant="solid" borderRadius={5} h={10} mr={2} shadow={5} isDisabled={selectedBooks.size === 0}
                        onPress={navigateToBorrowRequest}>
                        Đăng kí mượn sách
                    </Button>
                </HStack>
            )}

        </ VStack >
    );
}

