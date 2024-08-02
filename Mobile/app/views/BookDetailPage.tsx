import React, { useState, createContext, useRef, useEffect, useCallback } from 'react';
import { Animated, StyleSheet, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, Keyboard, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { CategoryProvider, useCategories } from '../context/CategoryContext';
import { Box, Container, Text, HStack, VStack, Heading, Button, Image, Badge, WarningOutlineIcon, Icon, Pressable, ZStack, Center, Input, Radio, Stack, SectionList, Divider, Spinner, Skeleton } from "native-base"
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { BookProvider, useBooks } from '../context/BookContext';

import { RootStackParamList } from '../constants';
import { StackNavigationProp } from '@react-navigation/stack';
import { CartProvider, useCarts } from '../context/CartContext';
import { BookDetail } from '../types';
type BookDetailNavigationProp = StackNavigationProp<
    RootStackParamList,
    'BookDetail'
>;


type BookDetailRouteProp = RouteProp<RootStackParamList, 'BookDetail'>;

export default function BookDetailPage() {
    const navigation = useNavigation<BookDetailNavigationProp>();
    const route = useRoute<BookDetailRouteProp>();
    const { bookId } = route.params;
    const [refreshing, setRefreshing] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const { addBook } = useCarts();
    const [bookDetail, setBookDetail] = useState<BookDetail | null>(null);
    const fetchBookDetail = async (id: string | undefined) => {
        console.info('Fetch book detail');
        try {
            setIsFetching(true);
            const response = await axios.get<BookDetail>(`${apiConfig.baseURL}/api/books/getBookInfo/${id}`);
            if (response?.status === 200) {
                setBookDetail(response.data);
            }
        } catch (error) {
            console.log('Error fetch book info', error);
        }
        setIsFetching(false);

    };

    useEffect(() => {
        async function fetchDetails() {
            if (bookId) { await fetchBookDetail(bookId); }
        }
        if (isFetching) { fetchDetails(); }
    }, [bookId]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchBookDetail(bookId);
        } catch (error) {
            console.info('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    if (isFetching && !bookDetail) {
        return (<ScrollView>
            <VStack space={5} padding={3} minH={'100%'}>
                <Center>
                    <Skeleton size='64' />
                </Center>
                <Skeleton.Text fontSize={'lg'} textAlign={'center'} />
            </VStack>
        </ScrollView>
        );
    }


    function InformationRow({ label, content }: InformationRowProps) {
        return (
            <HStack minHeight={14}>
                <Box justifyContent={'start'} borderColor={'coolGray.300'} borderWidth={'0.5'} w={'30%'} p={3}>
                    <Text fontWeight={300} fontSize={'xs'}>{label}</Text>
                </Box>
                <Box justifyContent={'start'} borderColor={'coolGray.300'} borderWidth={'0.5'} flex={1} p={3}>
                    {Array.isArray(content) ? (
                        content.map((item, index) => (
                            <Button size="md" justifyContent={'start'} p={0}
                                key={index} variant="link"
                                _text={
                                    { color: 'info', fontSize: 'xs', fontWeight: '400' }
                                }
                                onPress={() => {
                                    if (label == 'Thể loại' && item.id) {
                                        navigation.navigate('BookList', { categoryId: item.id, categoryName: item.name });
                                    } if (label == 'Tác giả' && item.id) {
                                        navigation.navigate('BookList', { authorId: item.id, authorName: item.name });
                                    } else {

                                    }
                                }}
                            >
                                {content.length > 1 && index != content.length - 1 ? item.name + ',' : item.name}
                            </Button>
                        ))
                    ) : (
                        <Text fontWeight={300} fontSize={'xs'}>{content}</Text>
                    )}
                </Box>
            </HStack >
        );
    }




    return (
        <BookProvider>
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <VStack space={5} padding={3} >
                    <Center>
                        <Image
                            source={{ uri: bookDetail?.image }}
                            resizeMode="contain"
                            alt='Book Image'
                            size='64'
                        />
                    </Center>

                    <Heading fontSize={'lg'} textAlign={'center'}>{bookDetail?.title}</Heading>
                    <Box>
                        <InformationRow label="Tác giả" content={bookDetail?.author || []} />
                        <InformationRow label="Thể loại" content={bookDetail?.category || []} />
                        <InformationRow label="Mô tả" content={bookDetail?.description || ''} />
                        <InformationRow label="Nhà xuất bản" content={bookDetail?.publisher || ''} />
                        <InformationRow label="Năm xuất bản" content={bookDetail?.publicationYear || ''} />
                        <InformationRow label="Kích thước" content={bookDetail?.format || ''} />
                        <InformationRow label="ISBN" content={bookDetail?.isbn || ''} />
                        <InformationRow label="Tình trạng" content={bookDetail?.status || ''} />
                    </Box>
                </VStack>
            </ScrollView >
            <HStack justifyContent={'center'} position={'fixed'} bottom={0} height={16} >

                {bookDetail?.status == "ACTIVE"
                    &&
                    <Button flex={1} borderRadius={0} onPress={() => navigation.navigate('BorrowRequest', { selectedBookIds: [bookId], selectDate: null, dueDate: null })} >
                        Đăng kí mượn
                    </Button>
                }
                <Button flex={1} variant={'subtle'} borderRadius={0} onPress={() => bookDetail ? addBook(bookDetail) : ''}>
                    Thêm vào giỏ sách
                </Button>
            </HStack>
        </BookProvider >

    );
}

type ContentInput = {
    id: string | null;
    name: string;
};
type InformationRowProps = {
    label: string;
    content: string | ContentInput[];
};
