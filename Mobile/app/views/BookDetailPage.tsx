import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Box, VStack, Text, Heading, Spinner, Center, Image, Button, HStack, Badge, useToast } from 'native-base';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../constants';
import { useBookDetail } from '../hooks/useBookDetail';
import BackButton from '../components/BackButton';
import InfoRow from '../components/detail/InfoRow';
import { useCart } from '../context/CartContext';

type BookDetailRouteProp = RouteProp<RootStackParamList, 'BookDetail'>;

export default function BookDetailPage() {
    const route = useRoute<BookDetailRouteProp>();
    const { bookId } = route.params;
    const { book, isLoading, fetchBookDetail } = useBookDetail(bookId);
    const { addBook, carts } = useCart();
    const toast = useToast();

    const handleAddToCart = () => {
        if (book) {
            if (book.status === 'ACTIVE' || book.status === 'OFFLINE_ONLY') {
                const isAlreadyInCart = carts?.some(item => item.id === book.id);
                if (isAlreadyInCart) {
                     toast.show({ description: "Sách này đã có trong giỏ mượn.", placement: 'top' });
                } else {
                    addBook(book);
                    toast.show({ description: "Đã thêm vào giỏ mượn.", placement: 'top' });
                }
            } else {
                toast.show({ description: "Sách này hiện không có sẵn.", placement: 'top' });
            }
        }
    };

    if (isLoading && !book) {
        return (
            <Box flex={1} bg="white">
                <Center flex={1}><Spinner size="lg" /></Center>
            </Box>
        );
    }

    if (!book) {
        return (
            <Box flex={1} bg="white">
                <Center flex={1}><Text>Không tìm thấy thông tin sách.</Text></Center>
            </Box>
        );
    }
    
    const isBookAvailable = book.status === 'ACTIVE' || book.status === 'OFFLINE_ONLY';
    const isBookInCart = carts?.some(item => item.id === book.id);

    return (
        <Box flex={1} bg="white">
            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchBookDetail} />}
            >
                <VStack>
                    <Center bg="coolGray.100" p={4}>
                        <Image source={{ uri: book.image }} alt={book.title} size="2xl" resizeMode="contain" />
                    </Center>
                    <VStack p={4} space={2}>
                        <Heading size="lg">{book.title}</Heading>
                        <Text fontSize="md" color="coolGray.600">{book.author.map(a => a.name).join(', ')}</Text>
                        <HStack space={2} flexWrap="wrap">
                            {book.category.map(c => <Badge key={c.id} colorScheme="info" variant="outline">{c.name}</Badge>)}
                        </HStack>
                    </VStack>

                    <VStack px={4} space={1}>
                        <InfoRow label="Nhà xuất bản" value={book.publisher} />
                        <InfoRow label="Năm xuất bản" value={book.publicationYear.toString()} />
                        <InfoRow label="Mã ISBN" value={book.isbn} />
                        <InfoRow label="Trạng thái" value={book.status} />
                    </VStack>
                    
                    <VStack p={4} space={2}>
                        <Heading size="md">Tóm tắt</Heading>
                        <Text textAlign="justify">{book.description}</Text>
                    </VStack>
                </VStack>
            </ScrollView>
            <Box position="absolute" bottom={0} left={0} right={0} p={4} bg="white" borderTopWidth={1} borderColor="coolGray.200">
                <Button 
                    onPress={handleAddToCart} 
                    isDisabled={!isBookAvailable || isBookInCart}
                    colorScheme={!isBookAvailable ? 'coolGray' : 'primary'}
                >
                    {isBookInCart ? 'Đã có trong giỏ' : (isBookAvailable ? 'Thêm vào giỏ mượn' : 'Không có sẵn')}
                </Button>
            </Box>
        </Box>
    );
}