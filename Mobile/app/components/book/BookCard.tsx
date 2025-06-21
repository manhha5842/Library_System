import React from 'react';
import { Pressable, Box, Text, VStack, Image, AspectRatio } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../constants';
import { Book } from '../../types';

type BookNavProp = StackNavigationProp<RootStackParamList>;

interface BookCardProps {
    book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
    const navigation = useNavigation<BookNavProp>();

    return (
        <Pressable
            flex={1}
            m={2}
            onPress={() => navigation.navigate('BookDetail', { bookId: book.id })}
        >
            {({ isPressed }) => (
                <VStack
                    space={2}
                    borderRadius="md"
                    bg={isPressed ? 'coolGray.200' : 'coolGray.100'}
                    p={2}
                    style={{ transform: [{ scale: isPressed ? 0.97 : 1 }] }}
                    overflow="hidden"
                    flex={1}
                >
                    <Box>
                        <AspectRatio ratio={3 / 4}>
                            <Image
                                source={{ uri: book.image }}
                                alt={book.title}
                                resizeMode="cover"
                                borderRadius="md"
                            />
                        </AspectRatio>
                    </Box>
                    <VStack flex={1} justifyContent="space-between">
                        <Text fontSize="sm" fontWeight="bold" isTruncated noOfLines={2}>
                            {book.title}
                        </Text>
                        <Text fontSize="xs" color="gray.500" isTruncated>
                            {book.author.map(a => a.name).join(', ')}
                        </Text>
                    </VStack>
                </VStack>
            )}
        </Pressable>
    );
};

export default BookCard; 