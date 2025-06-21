import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { Box, Text, VStack, Image, Pressable, ZStack, HStack, Skeleton } from "native-base";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../constants';
import { BookProvider, useBooks } from '../../context/BookContext';
import { Book } from '../../types';
import { mockBooks } from '../../types/mockData';

type HomePageNavigationProp = StackNavigationProp<RootStackParamList, 'HomePage'>;

const RenderBook = ({ refreshing }: { refreshing: boolean }) => {
    const navigation = useNavigation<HomePageNavigationProp>();
    const { recommendedBooks, fetchRecommendBooks } = useBooks();
    const [localBooks, setLocalBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBook = async () => {
            setIsLoading(true);
            try {
                await fetchRecommendBooks();
            } catch (e) {
                console.log("Failed to fetch recommended books, using mock data.", e);
                setLocalBooks(mockBooks);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBook();
    }, [refreshing]);

    const displayBooks = (recommendedBooks && recommendedBooks.length > 0) ? recommendedBooks : localBooks;

    if (isLoading) {
        return (
            <VStack space={3} >
                {[...Array(2)].map((_, i) => (
                    <Box key={i} flexDirection={"row"} borderWidth={1} width={"100%"} height={32} borderRadius={15} overflow="hidden" borderColor={'coolGray.200'}>
                        <Skeleton borderRadius={15} width={24} h='100%' />
                        <VStack flex={1} p={3} space={2}>
                            <Skeleton.Text lines={2} />
                            <Skeleton h={4} w={"50%"} rounded="full" />
                        </VStack>
                    </Box>
                ))}
            </VStack>
        );
    }

    return (
        <VStack space={3} >
            {displayBooks.map((book) => (
                <Pressable key={book.id} onPress={() => navigation.navigate('BookDetail', { bookId: book.id })}>
                    {({ isPressed }) => (
                        <Box flexDirection={"row"} shadow={5} width={"100%"} height={32} borderRadius={15} overflow="hidden" bg={isPressed ? "coolGray.100" : "white"}>
                            <Image
                                resizeMode="cover" borderRadius={15} alt='Book Image' width={24}
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
                    )}
                </Pressable>
            ))}
        </VStack>
    );
};

// Wrap with provider to be self-contained
const BookSection = ({ refreshing }: { refreshing: boolean }) => (
    <BookProvider>
        <RenderBook refreshing={refreshing} />
    </BookProvider>
);

export default BookSection; 