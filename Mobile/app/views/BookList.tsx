import React, { useState, createContext, useRef, useEffect, useCallback } from 'react';
import {   RefreshControl } from 'react-native'; 
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Box, Container, Text, HStack, VStack, Heading, Input, Image, Badge, WarningOutlineIcon, ScrollView, Icon, Pressable, ZStack, Center, Spinner, Skeleton, Select, CheckIcon } from "native-base"
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { CategoryProvider, useCategories } from '../context/CategoryContext';
import { BookProvider, useBooks } from '../context/BookContext';
import BackButton from '../components/BackButton';


import { RootStackParamList } from '../constants';
import { StackNavigationProp } from '@react-navigation/stack';
import { Book, Category } from '../types';
type BookListNavigationProp = StackNavigationProp<
    RootStackParamList,
    'BookList'
>;
type BookListRouteProp = RouteProp<RootStackParamList, 'BookList'>;

export default function BookList() {
    const { user } = useUser();
    const navigation = useNavigation<BookListNavigationProp>();
    const [refreshing, setRefreshing] = useState(false);
    const [isLoadingBook, setIsLoadingBook] = useState(true);
    const route = useRoute<BookListRouteProp>();
    const [loadCategory, setLoadCategory] = useState(true);
    const [selectedCategoryId, setSelectedCategoryId] = useState(route.params.categoryId);
    const [selectedCategoryName, setSelectedCategoryName] = useState(route.params.categoryName);
    const [selectedAuthorId, setSelectedAuthorId] = useState(route.params.authorId);
    const [selectedAuthorName, setSelectedAuthorName] = useState(route.params.authorName);
    const [sortOption, setSortOption] = useState('');
    const [sortCategoryOption, setSortCategoryOption] = useState('');
    const [sortOptionTitle, setSortOptionTitle] = useState('Mặc định');
    const [sortedBooks, setSortedBooks] = useState([]);

    type SortSelectProps = {
        sortOption: string;
        setSortOption: (sortOption: string) => void;
        sortOptionTitle: string;
        setSortOptionTitle: (title: string) => void;
    };

    const SortSelect = ({ sortOption, setSortOption, sortOptionTitle, setSortOptionTitle }: SortSelectProps) => {
        return (
            <Select
                placeholder={sortOptionTitle}
                w="150" p={1} variant='underlined'
                onValueChange={(value) => {
                    setSortOption(value);
                    switch (value) {
                        case 'AZ':
                            setSortOptionTitle('Từ A-Z');
                            break;
                        case 'ZA':
                            setSortOptionTitle('Từ Z-A');
                            break;
                        default:
                            setSortOptionTitle('Mặc định');
                            break;
                    }
                }}
            >
                <Select.Item key={'default'} label='Mặc định' value='default' />
                <Select.Item key={'AZ'} label='Từ A-Z' value='AZ' />
                <Select.Item key={'ZA'} label='Từ Z-A' value='ZA' />
            </Select>
        );
    }

    // Sử dụng SortSelect trong BookList của bạn

    const onRefresh = useCallback(async () => {
        await setRefreshing(true);
        try {
            setIsLoadingBook(true);
        } catch (error) {
            console.info('Error refreshing:', error);
        } finally {
            setIsLoadingBook(false);
            setRefreshing(false);
        }
    }, []);
    const RenderCategories = () => {
        const { categories, category, fetchCategories, fetchCategoryById } = useCategories();

        useEffect(() => {
            if (loadCategory) {
                console.log('Fetching categories');
                fetchCategories();
                fetchCategoryById(selectedCategoryId + '');
                setLoadCategory(false);
            }
        }, []);
        return <VStack space={3}>
            <HStack justifyContent={'space-between'} px={5}>
                <VStack alignItems={'left'} >
                    <Text fontWeight={500}> Thể loại</Text>
                    <Select
                        placeholder={selectedCategoryName ? selectedCategoryName + '' : 'Tất cả'} w="150" p={1} variant='underlined'
                        onValueChange={(value) => {
                            if (selectedAuthorId) {
                                setSortCategoryOption(value);
                                let selectedCategory;
                                { categories.map((category) => (category.id == value ? selectedCategory = category.name : '')) }
                                setSelectedCategoryName(selectedCategory);
                            } else {
                                setSelectedCategoryId(value);
                                setSortOption('');
                                let selectedCategory;
                                { categories.map((category) => (category.id == value ? selectedCategory = category.name : '')) }
                                setSelectedCategoryName(selectedCategory);
                            }


                        }}
                    >
                        {
                            selectedAuthorId && (
                                <Select.Item key={''} label={'Tất cả'} value={''} />
                            )
                        }
                        {categories.map((category) => (
                            <Select.Item key={category.id} label={category.name} value={category.id} />
                        ))}
                    </Select>
                </VStack >
                <VStack alignItems={'left'}>
                    <Text fontWeight={500}> Sắp xếp</Text>
                    <SortSelect sortOption={sortOption} setSortOption={setSortOption} sortOptionTitle={sortOptionTitle} setSortOptionTitle={setSortOptionTitle} />
                </VStack >
            </HStack>

        </VStack >;
    }
    const RenderBookCategory = () => {
        const { books, fetchBookByCategory, sortBooks, isFetching } = useBooks();
        useEffect(() => {
            const fetchDataBook = async () => {
                try {
                    if (sortOption == '') {
                        await fetchBookByCategory(selectedCategoryId);
                    } else {
                        console.log(sortOption);
                        await sortBooks(sortOption);
                    }
                } finally {
                }
            };
            fetchDataBook();
        }, [refreshing, selectedCategoryId]);


        if (books.length == 0 && isFetching) {
            return <VStack space={3} >

                <Box flexDirection={"row"} borderWidth={1} width={"100%"} height={32} borderRadius={15} overflow="hidden" borderColor={'coolGray.200'}>
                    <Skeleton borderRadius={15} width={24} h='100%' /><VStack flex={1} p={3}><Skeleton.Text fontWeight={500} fontSize={"md"} h={12} rounded="full" /></VStack>
                </Box>
                <Box flexDirection={"row"} borderWidth={1} width={"100%"} height={32} borderRadius={15} overflow="hidden" borderColor={'coolGray.200'}>
                    <Skeleton borderRadius={15} width={24} h='100%' /><VStack flex={1} p={3}><Skeleton.Text fontWeight={500} fontSize={"md"} h={12} rounded="full" /></VStack>
                </Box>
                <Box flexDirection={"row"} borderWidth={1} width={"100%"} height={32} borderRadius={15} overflow="hidden" borderColor={'coolGray.200'}>
                    <Skeleton borderRadius={15} width={24} h='100%' /><VStack flex={1} p={3}><Skeleton.Text fontWeight={500} fontSize={"md"} h={12} rounded="full" /></VStack>
                </Box>
                <Center>
                    <Text> Đang tải dữ liệu ...</Text>
                </Center>
            </VStack >
        } else if (books.length == 0 && !isFetching) {
            return <Center>
                <Text> Chưa có sách được cập nhật</Text>
            </Center>
        }
        return <VStack space={3} >
            {books.map((book) => (
                <Pressable key={book.id} onPress={() => navigation.navigate('BookDetail', { bookId: book.id })}>
                    {({ isPressed }) => {
                        return <Box
                            flexDirection={"row"} shadow={5} width={"100%"} height={32} borderRadius={15} overflow="hidden"
                            bg={isPressed ? "coolGray.100" : "white"}
                        >
                            <Image
                                resizeMode="cover" borderRadius={15} alt='Banner Image' width={24}
                                source={{ uri: book.image }}
                            />

                            <ZStack flex={1}>
                                <VStack p={2} space={1} top={0} flexShrink={1}>
                                    <Text fontWeight={500} fontSize={"md"} numberOfLines={2} isTruncated >{book.title}</Text>
                                    <Text color={"gray.400"} fontSize={"xs"} isTruncated>{book.author.map(author => author.name).join(', ')}</Text>
                                </VStack>
                                <HStack p={2} bottom={0} justifyContent={"space-between"}>
                                    <Text fontWeight={400} fontSize={"2xs"} color={"blue.500"} underline isTruncated>Thể loại: {book.category.map(Category => Category.name).join(', ')}</Text>
                                </HStack>
                            </ZStack>

                            <Box position={'absolute'} h={32} w={'100%'} borderRadius={15} bg={'black'} opacity={isPressed ? "0.1" : 0} />
                        </Box>
                    }}
                </Pressable>
            ))}
        </VStack >
    }
    const RenderBookAuthor = () => {
        const { books, fetchBookByAuthor, sortBooks, isFetching } = useBooks();
        useEffect(() => {
            const fetchDataBook = async () => {
                try {
                    if (sortOption == '' && sortCategoryOption == '') {
                        await fetchBookByAuthor(selectedAuthorId);
                    } else {
                        console.log(sortOption);
                        await sortBooks(sortOption);
                    }
                } finally {
                }
            };
            fetchDataBook();
        }, [refreshing, selectedAuthorId]);


        if (books.length == 0 || isFetching) {
            return <VStack space={3} >

                <Box flexDirection={"row"} borderWidth={1} width={"100%"} height={32} borderRadius={15} overflow="hidden" borderColor={'coolGray.200'}>
                    <Skeleton borderRadius={15} width={24} h='100%' /><VStack flex={1} p={3}><Skeleton.Text fontWeight={500} fontSize={"md"} h={12} rounded="full" /></VStack>
                </Box>
                <Box flexDirection={"row"} borderWidth={1} width={"100%"} height={32} borderRadius={15} overflow="hidden" borderColor={'coolGray.200'}>
                    <Skeleton borderRadius={15} width={24} h='100%' /><VStack flex={1} p={3}><Skeleton.Text fontWeight={500} fontSize={"md"} h={12} rounded="full" /></VStack>
                </Box>
                <Box flexDirection={"row"} borderWidth={1} width={"100%"} height={32} borderRadius={15} overflow="hidden" borderColor={'coolGray.200'}>
                    <Skeleton borderRadius={15} width={24} h='100%' /><VStack flex={1} p={3}><Skeleton.Text fontWeight={500} fontSize={"md"} h={12} rounded="full" /></VStack>
                </Box>
            </VStack >
        }
        return <VStack space={3} >
            {books.filter(book =>
                !sortCategoryOption || book.category.some(category => category.id === sortCategoryOption)
            ).map((book) => (
                <Pressable key={book.id} onPress={() => navigation.navigate('BookDetail', { bookId: book.id })}>
                    {({ isPressed }) => {
                        return <Box
                            flexDirection={"row"} shadow={5} width={"100%"} height={32} borderRadius={15} overflow="hidden"
                            bg={isPressed ? "coolGray.100" : "white"}
                        >
                            <Image
                                resizeMode="cover" borderRadius={15} alt='Banner Image' width={24}
                                source={{ uri: book.image }}
                            />

                            <ZStack flex={1}>
                                <VStack p={2} space={1} top={0} flexShrink={1}>
                                    <Text fontWeight={500} fontSize={"md"} numberOfLines={2} isTruncated >{book.title}</Text>
                                    <Text color={"gray.400"} fontSize={"xs"} isTruncated>{book.author.map(author => author.name).join(', ')}</Text>
                                </VStack>
                                <HStack p={2} bottom={0} justifyContent={"space-between"}>
                                    <Text fontWeight={400} fontSize={"2xs"} color={"blue.500"} underline isTruncated>Thể loại: {book.category.map(Category => Category.name).join(', ')}</Text>
                                </HStack>
                            </ZStack>

                            <Box position={'absolute'} h={32} w={'100%'} borderRadius={15} bg={'black'} opacity={isPressed ? "0.1" : 0} />
                        </Box>
                    }}
                </Pressable>
            ))}
        </VStack >
    }

    return (
        <ScrollView refreshControl={<RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
        />}>
            <VStack space={5} padding={3} >
                <VStack>
                    <CategoryProvider>
                        <RenderCategories />
                    </CategoryProvider >
                    <VStack space={3} >
                        <HStack justifyContent={"space-between"} alignItems={"center"}>
                            <Heading bottom={0} py={2} fontSize={18} >Các đầu sách {selectedAuthorName ? 'của ' + selectedAuthorName : selectedCategoryName} </Heading>
                        </HStack>
                        <BookProvider>
                            {selectedAuthorId ? <RenderBookAuthor /> : <RenderBookCategory />}
                        </BookProvider >
                    </VStack>
                </VStack>
            </ VStack>
        </ScrollView >
    );
}

