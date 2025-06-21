import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { Box, Text, HStack, VStack, Heading, Image, ScrollView, Pressable, Center, Input, Skeleton, FlatList, Icon } from "native-base"
import { useUser } from '../context/UserContext';
import { useBooks } from '../context/BookContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../constants';
import { Book } from '../types';
import { mockBooks } from '../types/mockData';
import { AntDesign } from '@expo/vector-icons';

type HomePageNavigationProp = StackNavigationProp<
    RootStackParamList,
    'SearchPage'
>;

type SearchPageNavigationProp = StackNavigationProp<
    RootStackParamList,
    'SearchPage'
>;

export default function SearchPage() {
    const navigation = useNavigation<HomePageNavigationProp>();
    const { user, isLoggedIn, isCheckingToken } = useUser();
    const { recommendedBooks, fetchRecommendBooks } = useBooks();

    const RenderBook = ({ title, books, fetcher }: { title: string, books: Book[] | null, fetcher: () => Promise<void> }) => {
        const [localBooks, setLocalBooks] = useState<Book[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        const navigation = useNavigation<SearchPageNavigationProp>();

        useEffect(() => {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    // Chỉ fetch nếu prop `books` rỗng
                    if (!books || books.length === 0) {
                        await fetcher();
                    }
                } catch (error) {
                    console.log(`Error fetching ${title}, using mock data`, error);
                    setLocalBooks(mockBooks);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }, []); // Chỉ chạy một lần khi component mount

        const displayBooks = (books && books.length > 0) ? books : localBooks;

        if (isLoading && displayBooks.length === 0) {
            return <VStack space={3} >
                <Heading py={2} fontSize={18} padding={3}>
                    {title}
                </Heading>
                <Box flexDirection={"row"} borderWidth={1} width={"100%"} height={'20'} borderRadius={15} overflow="hidden" borderColor={'coolGray.200'}           >
                    <Skeleton borderRadius={15} width={20} h='100%' />
                    <VStack flex={1} p={2} justifyContent={"space-between"} >
                        <Skeleton.Text fontWeight={500} fontSize={"sm"} lines={2} rounded="full" />
                        <Skeleton.Text size={'xs'} fontWeight={100} fontSize={"sm"} lines={1} rounded="full" />
                    </VStack>
                </Box>
            </VStack >
        }

        if (displayBooks.length === 0 && !isLoading) {
            return (
                <VStack>
                    <Heading py={2} fontSize={18} padding={3}>
                        {title}
                    </Heading>
                    <Text px={3}>Không có sách nào để hiển thị.</Text>
                </VStack>
            );
        }

        return <VStack space={3} >
            <Heading py={2} fontSize={18} padding={3}>
                {title}
            </Heading>
            <FlatList
                data={displayBooks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Pressable onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}>
                    {({ isPressed }) => {
                            return <HStack shadow={5} height={'20'} bg={"white"} borderRadius={15} mb={3} >
                                <Image source={{ uri: item.image }}
                                w={'20%'} resizeMode="cover" borderRadius={15} alt='Banner Image' />
                            <VStack p={2} justifyContent={"space-between"} flexShrink={1}>
                                    <Text fontWeight={500} fontSize={"sm"} numberOfLines={2} isTruncated >{item.title}</Text>
                                    <Text color={"gray.400"} fontSize={"2xs"}>{item.author.map(author => author.name).join(', ')}</Text>
                            </VStack>
                            <Box position={'absolute'} h={20} w={'100%'} borderRadius={15} bg={'black'} opacity={isPressed ? "0.1" : 0} />
                        </HStack>
                    }}
                </Pressable>
                )}
            />
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
                                variant="unstyled" isReadOnly={true}
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
                                        alt="Background Image" resizeMode="cover" size="100%" position="absolute" top="0" left="0" borderRadius={16}
                                    />
                                    <Box bg="rgba(0, 0, 0, 0.25)" size={"100%"} position="absolute" top="0" left="0" borderRadius={16} />
                                    <Text fontWeight={600} fontSize={20} color={"white"}>THỂ LOẠI SÁCH</Text>
                                </Center>
                            }}
                        </Pressable>
                    </HStack>
                </VStack>
                <VStack space={3} >
                    <RenderBook title={'Sách được đề xuất'} books={recommendedBooks} fetcher={fetchRecommendBooks} />
                </VStack>
            </ VStack>
        </ScrollView >
    );
}

