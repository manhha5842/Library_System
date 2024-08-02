import React, { useState, createContext, useRef, useEffect } from 'react';
import { Animated, StyleSheet, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { Box, Container, Text, HStack, VStack, Heading, Button, Image, Badge, WarningOutlineIcon, ScrollView, Icon, Pressable, ZStack, Center, Input, Spinner, Skeleton } from "native-base"
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { BookProvider, useBooks } from '../context/BookContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../constants';
type HomePageNavigationProp = StackNavigationProp<
    RootStackParamList,
    'SearchPage'
>;
export default function SearchPage() {
    const navigation = useNavigation<HomePageNavigationProp>();
    const [isLoadingBook, setIsLoadingBook] = useState(true);
    const { user, isLoggedIn, isCheckingToken } = useUser();

    const RenderBook = () => {
        const { books, recommendBooks } = useBooks();

        useEffect(() => {
            const fetchCategories = async () => {
                try {
                    recommendBooks();
                } finally {
                    setIsLoadingBook(false);
                }
            };
            fetchCategories();
        }, []);

        if (isLoadingBook || books.length == 0) {
            return <VStack space={3} >
                <Box flexDirection={"row"} borderWidth={1} width={"100%"} height={'20'} borderRadius={15} overflow="hidden" borderColor={'coolGray.200'}           >
                    <Skeleton borderRadius={15} width={20} h='100%'
                    />
                    <VStack flex={1} p={2} justifyContent={"space-between"} >
                        <Skeleton.Text fontWeight={500} fontSize={"sm"} lines={2} rounded="full" />
                        <Skeleton.Text size={'xs'} fontWeight={100} fontSize={"sm"} lines={1} rounded="full" />
                    </VStack>
                </Box>
            </VStack >
        }
        return <VStack space={3} >
            {books.map((book) => (
                <Pressable key={book.id} onPress={() => navigation.navigate('BookDetail', { bookId: book.id })}>
                    {({ isPressed }) => {
                        return <HStack shadow={5} height={'20'} bg={"white"} borderRadius={15}                            >
                            <Image source={{ uri: book.image }}
                                w={'20%'} resizeMode="cover" borderRadius={15} alt='Banner Image' />
                            <VStack p={2} justifyContent={"space-between"} flexShrink={1}>
                                <Text fontWeight={500} fontSize={"sm"} numberOfLines={2} isTruncated >{book.title}</Text>
                                <Text color={"gray.400"} fontSize={"2xs"}>{book.author.map(author => author.name).join(', ')}</Text>
                            </VStack>
                            <Box position={'absolute'} h={20} w={'100%'} borderRadius={15} bg={'black'} opacity={isPressed ? "0.1" : 0} />
                        </HStack>
                    }}
                </Pressable>
            ))}
        </VStack >
    }
    return (
        <ScrollView  >
            <VStack space={5} safeArea padding={3}   >
                <Pressable onPress={() => navigation.navigate('SearchBook' as never)}>
                    {({ isPressed }) => (
                        <Box shadow={6} bg={"white"} borderWidth={"0"} borderRadius={20}                        >
                            <Input
                                placeholder='Nhập nội dung bạn muốn tìm'
                                variant="unstyled" isReadOnly={true} onFocus={(event) => event.target.blur()} // Thêm đoạn này nếu cần
                                InputRightElement={<Image source={require('../assets/icons/search-icon.png')} resizeMode="cover" alt='Icon image' size={"xs"} mx={3} />}
                            />
                        </Box>
                    )}
                </Pressable>
                <VStack>
                    <HStack justifyContent="space-between" py={2}>
                        <Pressable w={"100%"} onPress={() => navigation.navigate('Category' as never)} >
                            {({ isPressed }) => {
                                return <Center
                                    borderRadius={16} h='32' w={"100%"} shadow={5}
                                    style={{
                                        transform: [{ scale: isPressed ? 0.96 : 1 }]
                                    }}
                                >
                                    <Image
                                        source={require('../assets/bg-category.png')}
                                        alt="Background Image" resizeMode="cover" size="100%" position="absolute" top="0" left="0" borderRadius={16} bg={"white"}
                                    />
                                    <Box bg="rgba(0, 0, 0, 0.25)" size={"100%"} position="absolute" top="0" left="0" borderRadius={16} />
                                    <Text fontWeight={600} fontSize={20} color={"white"}>THỂ LOẠI SÁCH</Text>
                                </Center>
                            }}
                        </Pressable>
                        {/* <Pressable w={"45%"} onPress={() => navigation.navigate('Category' as never)} >
                            {({ isPressed }) => {
                                return <Center
                                    borderRadius={16} size={40} shadow={5}
                                    style={{
                                        transform: [{ scale: isPressed ? 0.96 : 1 }]
                                    }}
                                >
                                    <Image
                                        source={require('../assets/bg-category.png')}
                                        alt="Background Image" resizeMode="cover" size="100%" position="absolute" top="0" left="0" borderRadius={16} bg={"white"}
                                    />
                                    <Box bg="rgba(0, 0, 0, 0.25)" size={"100%"} position="absolute" top="0" left="0" borderRadius={16} />
                                    <Text fontWeight={600} fontSize={20} color={"white"}>THỂ LOẠI</Text>
                                </Center>
                            }}
                        </Pressable>
                        <Pressable w={"45%"} onPress={() => console.log("I'm Pressed")} >
                            {({ isPressed }) => {
                                return <Center borderRadius={16} size={40} shadow={5} style={{ transform: [{ scale: isPressed ? 0.96 : 1 }] }} >
                                    <Image
                                        source={require('../assets/bg-major.png')}
                                        alt="Background Image" resizeMode="cover" size="100%" position="absolute" top="0" left="0" borderRadius={16} bg={"white"}
                                    />
                                    <Box bg="rgba(0, 0, 0, 0.25)" size={"100%"} position="absolute" top="0" left="0" borderRadius={16} />
                                    <Text fontWeight={600} fontSize={18} color={"white"}>CHUYÊN NGÀNH</Text>
                                </Center>
                            }}
                        </Pressable> */}
                    </HStack>
                </VStack>
                <VStack space={3} >
                    <Heading bottom={0} py={2} fontSize={18} >
                        Sách đề xuất cho bạn
                    </Heading>
                    <VStack space={3} >
                        <BookProvider>
                            <RenderBook />
                        </BookProvider>

                    </VStack >
                </VStack>
            </ VStack>
        </ScrollView >
    );
}

