import React, { useState, createContext, useRef, useEffect, useCallback } from 'react';
import { Animated, StyleSheet, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { Box, Container, Text, HStack, VStack, Heading, Input, Image, Badge, WarningOutlineIcon, ScrollView, Icon, Pressable, ZStack, Center, Spinner, Skeleton } from "native-base"
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { CategoryProvider, useCategories } from '../context/CategoryContext';
import { BookProvider, useBooks } from '../context/BookContext';
import { RootStackParamList } from '../constants/navigationTypes';
import { StackNavigationProp } from '@react-navigation/stack';

type HomePageNavigationProp = StackNavigationProp<
    RootStackParamList,
    'HomePage'
>;
export default function HomePage() {
    const { user } = useUser();
    const navigation = useNavigation<HomePageNavigationProp>();
    const [isLoadingBook, setIsLoadingBook] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        await setRefreshing(true);
        try {
            // Gọi các hàm fetch data mới tại đây 
        } catch (error) {
            console.info('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);
    const RenderCategories = () => {
        const { categories, fetchCategories } = useCategories();
        useEffect(() => {
            const fetchCategoriesList = async () => {
                try {
                    fetchCategories();
                } finally {
                    setIsLoadingBook(false);
                }
            };
            fetchCategoriesList();
        }, []);
        return <HStack flexDirection="row" flexWrap="wrap" space={3}>
            {categories.map((category, categoryIndex) => (
                categoryIndex <= 5 ? (
                    <Pressable key={category.id} onPress={() => navigation.navigate('BookList', { categoryId: category.id, categoryName: category.name })}>
                        {({ isPressed }) => (
                            <Badge
                                px={2} my={1} borderRadius={5} shadow={1}
                                bg={isPressed ? "coolGray.200" : "coolGray.100"}
                                style={{ transform: [{ scale: isPressed ? 0.96 : 1 }] }}
                            >
                                <Text color={randomColor()}>{category.name}</Text>
                            </Badge>
                        )}
                    </Pressable>
                ) : categoryIndex == 6 ? (
                    <Pressable key={'more'} onPress={() => navigation.navigate('Category' as never)}>
                        {({ isPressed }) => (
                            <Badge
                                px={2} my={1} borderRadius={5} shadow={1}
                                bg={isPressed ? "coolGray.200" : "coolGray.100"}
                                style={{ transform: [{ scale: isPressed ? 0.96 : 1 }] }}
                            >
                                <Text color={randomColor()}>Xem thêm...</Text>
                            </Badge>
                        )}
                    </Pressable>
                ) : null
            ))}
        </HStack>;
    }
    const RenderBook = () => {
        const { books, recommendBooks } = useBooks();
        useEffect(() => {
            const fetchBook = async () => {
                try {
                    recommendBooks();
                } finally {
                    setIsLoadingBook(false);
                }
            };
            fetchBook();
        }, [refreshing]);
        useEffect(() => {
            const fetchBook = async () => {
                try {
                    recommendBooks();
                } finally {
                    setIsLoadingBook(false);
                }
            };
            fetchBook();
        }, []);

        if (isLoadingBook || !books || books.length <= 0 || !books) {
            return <VStack space={3} >
                <Box flexDirection={"row"} borderWidth={1} width={"100%"} height={32} borderRadius={15} overflow="hidden" borderColor={'coolGray.200'}           >
                    <Skeleton borderRadius={15} width={24} h='100%'
                    />
                    <VStack flex={1} p={3}>
                        <Skeleton.Text fontWeight={500} fontSize={"md"} h={12} rounded="full" />
                    </VStack>
                </Box>
            </VStack >
        }
        return <VStack space={3} >
            {books.length > 0 && books.map((book) => (
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
    const randomColor = () => {
        const colors = ["red.400", "green.400", "blue.400", "purple.400", "gray.400", "purple.400"];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <ScrollView refreshControl={<RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
        />}>
            <VStack space={5} safeArea padding={3} >
                <Box justifyContent={"center"} h={"40"}>
                    <ZStack flex={1} width={"100%"} h={"40"}>
                        <Image resizeMode="cover" borderRadius={15} h={"40"} alt='Banner Image' width={'100%'}
                            source={require('../assets/banner-home.png')} />
                        <Heading bottom={0} padding={2} color={"white"} fontSize={20}>
                            Xin chào {user?.name}
                        </Heading>
                    </ZStack>
                </Box>
                <HStack justifyContent="space-between" px={5}>
                    <Pressable w={"45%"} h={"32"} onPress={() => navigation.navigate('SearchBook' as never)} >
                        {({ isPressed }) => {
                            return <Center p={2}
                                borderRadius={10} size={"100%"} shadow={5}
                                bg={isPressed ? "coolGray.200" : "coolGray.100"}
                                style={{
                                    transform: [{ scale: isPressed ? 0.96 : 1 }]
                                }}
                            >
                                <Image
                                    source={require('../assets/icons/borrow-icon.png')}
                                    resizeMode="cover" alt='Banner Image' size={"16"}
                                />
                                <Text fontWeight={600} pt={3} textAlign={'center'}>
                                    Khám phá {"\n"} tri thức
                                </Text>

                            </Center>
                        }}
                    </Pressable>
                    <Pressable w={"45%"} h={"32"} onPress={() => navigation.navigate('FeedbackPage')} >
                        {({ isPressed }) => {
                            return <Center
                                borderRadius={10} size={"100%"} shadow={5}
                                bg={isPressed ? "coolGray.200" : "coolGray.100"}
                                style={{ transform: [{ scale: isPressed ? 0.96 : 1 }] }}                            >
                                <Image
                                    source={require('../assets/icons/report-icon.png')}
                                    resizeMode="cover" alt='Banner Image' size={"16"}
                                />
                                <Text fontWeight={600} pt={3} textAlign={'center'}>
                                    Đóng góp {"\n"} ý kiến
                                </Text>
                            </Center>
                        }}
                    </Pressable>
                </HStack>
                <VStack>
                    <Heading bottom={0} py={2} fontSize={18} >Thể loại</Heading>
                    <CategoryProvider>
                        <RenderCategories />
                    </CategoryProvider >
                </VStack>
                <VStack space={3} >
                    <HStack justifyContent={"space-between"} alignItems={"center"}>
                        <Heading bottom={0} py={2} fontSize={18} >Sách đề xuất cho bạn</Heading>
                        {/* <Pressable >
                            {({ isPressed }) => {
                                return <Text underline
                                    color={isPressed ? "coolGray.600" : "gray.400"}  >
                                    Xem thêm
                                </Text>
                            }}
                        </Pressable> */}
                    </HStack>
                    <BookProvider>
                        <RenderBook />
                    </BookProvider >
                </VStack>
            </ VStack>
        </ScrollView >
    );
}

