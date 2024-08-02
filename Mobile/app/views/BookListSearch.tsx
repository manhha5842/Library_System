import React, { useState, createContext, useRef, useEffect, useCallback } from 'react';
import {  ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Box, Container, Text, HStack, VStack, Heading, Input, Image, Badge, WarningOutlineIcon, ScrollView, Icon, Pressable, ZStack, Center, Spinner, Skeleton, Select, CheckIcon, Radio, Stack, Divider, FlatList } from "native-base"
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { CategoryProvider, useCategories } from '../context/CategoryContext';
import { BookProvider, useBooks } from '../context/BookContext';
import BackButton from '../components/BackButton';


import { RootStackParamList } from '../constants';
import { StackNavigationProp } from '@react-navigation/stack';
type BookListNavigationProp = StackNavigationProp<
    RootStackParamList,
    'BookListSearch'
>;
type BookListRouteProp = RouteProp<RootStackParamList, 'BookListSearch'>;

export default function BookListSearch() {
    const { user } = useUser();
    const navigation = useNavigation<BookListNavigationProp>();
    const [refreshing, setRefreshing] = useState(false);
    const [isLoadingBook, setIsLoadingBook] = useState(true);
    const route = useRoute<BookListRouteProp>();
    const [loadCategory, setLoadCategory] = useState(true);
    const [selectedKeyword, setSelectedKeyword] = useState(route.params.keyword);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
    const [selectedCategoryName, setSelectedCategoryName] = useState();
    const [sortOption, setSortOption] = useState('');
    const [sortCategoryOption, setSortCategoryOption] = useState('');
    const [sortOptionTitle, setSortOptionTitle] = useState('Mặc định');
    const [sortedBooks, setSortedBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allLoaded, setAllLoaded] = useState(false)
    const [page, setPage] = useState(0);
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
                w="120" p={1} variant='filled'
                bg={'light.100'}
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
        const { categories, category, fetchCategories } = useCategories();

        useEffect(() => {
            if (loadCategory) {
                console.log('Fetching categories');
                fetchCategories();
                setLoadCategory(false);
            }
        }, []);
        return <VStack space={3}>
            <HStack justifyContent={'space-between'} pb={2}>
                <HStack alignItems={'left'} alignSelf={'center'} space={2} >
                    <Text fontWeight={500} alignSelf={'center'} > Thể loại</Text>
                    <Select
                        placeholder={selectedCategoryName ? selectedCategoryName + '' : 'Tất cả'} w="120" p={1} variant='filled'
                        bg={'light.100'}
                        onValueChange={(value: string) => {
                            setSelectedCategoryId(value);
                            setSortOption('');
                            let selectedCategory;
                            { categories.map((category) => (category.id == value ? selectedCategory = category.name : '')) }
                            setSelectedCategoryName(selectedCategory);
                        }} >
                        <Select.Item key={''} label={'Tất cả'} value={''} />

                        {categories.map((category) => (
                            <Select.Item key={category.id} label={category.name} value={category.id} />
                        ))}
                    </Select>
                </HStack >
                <HStack alignItems={'left'} alignSelf={'center'} space={2}>
                    <Text fontWeight={500} alignSelf={'center'} > Sắp xếp</Text>
                    <SortSelect sortOption={sortOption} setSortOption={setSortOption} sortOptionTitle={sortOptionTitle} setSortOptionTitle={setSortOptionTitle} />
                </HStack >
            </HStack>

        </VStack >;
    }
    const RenderBooks = () => {
        const { books, searchBooks, sortBooks, isFetching } = useBooks();
        const [localPage, setLocalPage] = useState(0); 
        const [hasMore, setHasMore] = useState(true);

        useEffect(() => {

            const fetchDataBook = async () => {
                try {
                    if (sortOption === '') {
                        const response = await searchBooks(selectedKeyword, localPage, 20); // Sử dụng localPage
                        let length = response.data;
                        if (response.data.content.length == 0) setHasMore(false);

                    } else {
                        await sortBooks(sortOption);
                    }
                } catch (error) {
                    console.info('Error fetching books:', error);
                }
            };
            fetchDataBook();
        }, [localPage, selectedKeyword, sortOption]); // Lắng nghe thay đổi của localPage

        const handleLoadMore = () => {
            if (!isFetching && hasMore) {
                setLocalPage(prevPage => prevPage + 1); // Tăng giá trị localPage
            }
        };
        const renderSkeleton = () => (
            <VStack space={3}>
                {Array.from(Array(3).keys()).map((_, idx) => (
                    <Box key={idx} flexDirection={"row"} borderWidth={1} width={"100%"} height={32} borderRadius={15} overflow="hidden" borderColor={'coolGray.200'}>
                        <Skeleton borderRadius={15} width={24} h='100%' />
                        <VStack flex={1} p={3}>
                            <Skeleton.Text fontWeight={500} fontSize={"md"} h={12} rounded="full" />
                        </VStack>
                    </Box>
                ))}
                <Center>
                    <Text> Đang tải dữ liệu ...</Text>
                </Center>
            </VStack>
        );
        if (books.length === 0 && isFetching) {
            return renderSkeleton();
        } else if (books.length === 0 && !isFetching) {
            return (
                <Center>
                    <Text> Không tìm thấy dữ liệu </Text>
                </Center>
            );
        }


        return <FlatList 
            data={books}
            keyExtractor={(item, index) => item.id + index}
            renderItem={({ item: book }) => (
                <Pressable key={book.id} onPress={() => navigation.navigate('BookDetail', { bookId: book.id })}p={3}>
                    {({ isPressed }) => (
                        <Box flexDirection={"row"} shadow={5} width={"100%"} height={32} borderRadius={15} overflow="hidden" bg={isPressed ? "coolGray.100" : "white"}>
                            <Image resizeMode="cover" borderRadius={15} alt='Banner Image' width={24}
                                source={{ uri: book.image }} />
                            <ZStack flex={1}>
                                <VStack p={2} space={1} top={0} flexShrink={1}>
                                    <Text fontWeight={500} fontSize={"md"} numberOfLines={2} isTruncated>{book.title}</Text>
                                    <Text color={"gray.400"} fontSize={"xs"} isTruncated>{book.author.map(author => author.name).join(', ')}</Text>
                                </VStack>
                                <HStack p={2} bottom={0} justifyContent={"space-between"}>
                                    <Text fontWeight={400} fontSize={"2xs"} color={"blue.500"} underline isTruncated>Thể loại: {book.category.map(category => category.name).join(', ')}</Text>
                                </HStack>
                            </ZStack>
                            <Box position={'absolute'} h={32} w={'100%'} borderRadius={15} bg={'black'} opacity={isPressed ? "0.1" : 0} />
                        </Box>
                    )}
                </Pressable>
            )}
            ListFooterComponent={() => isFetching && hasMore && <ActivityIndicator size="large" />}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
        />

    }

    return (

        <VStack space={5} >
            <VStack>
                <Box padding={3} >
                    <Heading size={'xs'} mb={4} color={'gray.500'}>Kết quả tìm kiếm của
                        <Text color={'lightBlue.400'}> {selectedKeyword}</Text></Heading>
                    <Radio.Group name="filter" defaultValue="1" accessibilityLabel="pick a value">
                        <Stack mb={2}
                            direction={{ base: "row", md: "row" }}
                            alignItems={{ base: "flex-start", md: "center" }}
                            justifyContent={"space-between"}
                            overflow={"hidden"}
                            w="100%">
                            <Radio value="1" colorScheme="blue" size="sm" _text={{ fontSize: 'xs' }}>
                                Tất cả
                            </Radio>
                            <Radio value="2" colorScheme="blue" size="sm" _text={{ fontSize: 'xs' }}>
                                Tiêu đề sách
                            </Radio>
                            <Radio value="3" colorScheme="blue" size="sm" _text={{ fontSize: 'xs' }}>
                                Tác giả
                            </Radio>
                            <Radio value="4" colorScheme="blue" size="sm" _text={{ fontSize: 'xs' }}>
                                Mã ISBN
                            </Radio>
                        </Stack>
                    </Radio.Group>
                    <Center w={'100%'}>
                        <Divider bg="indigo.500" thickness="1" w={'50%'} orientation="horizontal" mb={2} />
                    </Center>
                    <CategoryProvider>
                        <RenderCategories />
                    </CategoryProvider >
                </Box>

                <BookProvider>
                    <RenderBooks />
                </BookProvider >
            </VStack>
        </ VStack>
    );
}

