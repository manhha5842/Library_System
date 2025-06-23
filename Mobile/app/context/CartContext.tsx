import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Book, BookDetail } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from '../config/apiConfig';

interface CartContextType {
    carts: Book[] | null;
    unavailableBooks: Book[] | null;
    addBook: (book: BookDetail) => void;
    deleteBook: (id: string) => void;
    fetchData: () => void;
    checkAvailable: () => void;
}

const defaultContextValue: CartContextType = {  
    carts: null,
    unavailableBooks: null,
    addBook: async () => { },
    deleteBook: async () => { },
    fetchData: async () => { },
    checkAvailable: async () => { },
};
interface CartProviderProps {
    children: ReactNode;
}

const CartContext = createContext<CartContextType>(defaultContextValue);

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [carts, setCarts] = useState<Book[]>([]);
    const [unavailableBooks, setUnavailableBooks] = useState<Book[]>([]);
    const convertBookDetailToBook = (bookDetail: BookDetail): Book => {
        return {
            id: bookDetail.id,
            title: bookDetail.title,
            author: bookDetail.author,
            category: bookDetail.category,
            image: bookDetail.image,
            status: bookDetail.status,
        };
    };
    const addBook = (newBook: BookDetail) => {
        console.info('Adding new book');
        const bookToAdd = convertBookDetailToBook(newBook);

        setCarts(prevCarts => {
            const bookInCarts = prevCarts.some(book => book.id == newBook.id);
            const bookInUnavailable = unavailableBooks.some(book => book.id == newBook.id);
            if (bookInCarts || bookInUnavailable) {
                console.info('Book already exists in carts');
            } else if (newBook.status === 'ACTIVE' || newBook.status === 'OFFLINE_ONLY') {
                console.log('Adding new book to active carts');
                return [...prevCarts, bookToAdd];
            }
            return prevCarts;
        });


        setUnavailableBooks(prevUnavailableBooks => {
            const bookInCarts = carts.some(book => book.id === newBook.id);
            const bookInUnavailable = prevUnavailableBooks.some(book => book.id === newBook.id);
            if (bookInCarts || bookInUnavailable) {
                console.info('Book already exists in unavailableBooks');
            } else if (newBook.status === 'INACTIVE') {
                console.log('Adding new book to inactive books');
                return [...prevUnavailableBooks, bookToAdd];
            }
            return prevUnavailableBooks;
        });
    };
    const deleteBook = (bookId: string) => {
        console.info("Delete book", bookId);
        setCarts(currentCarts => currentCarts.filter(book => book.id !== bookId));
        setUnavailableBooks(currentUnavailableBooks => currentUnavailableBooks.filter(book => book.id !== bookId));
    };
    const fetchData = async () => {
        console.info("Fetching cart data");
        try {
            // Lấy dữ liệu từ AsyncStorage
            const bookcart = await AsyncStorage.getItem('bookcart');
            const bookcartUnavailable = await AsyncStorage.getItem('bookcartUnavailable');

            // Chuyển đổi dữ liệu JSON thành mảng
            const cartsData = bookcart !== null ? JSON.parse(bookcart) : [];
            const unavailableBooksData = bookcartUnavailable !== null ? JSON.parse(bookcartUnavailable) : [];

            // Sử dụng Map để lọc trùng lặp
            const uniqueCarts = new Map<string, Book>();
            cartsData.forEach((book: Book) => {
                uniqueCarts.set(book.id, book);
            });

            const uniqueUnavailableBooks = new Map<string, Book>();
            unavailableBooksData.forEach((book: Book) => {
                uniqueUnavailableBooks.set(book.id, book);
            });

            // Cập nhật state với dữ liệu đã lọc trùng
            setCarts(Array.from(uniqueCarts.values()));
            setUnavailableBooks(Array.from(uniqueUnavailableBooks.values()));

        } catch (error) {
            console.info("An error occurred while fetching the cart data.", error);
        }
    };
    const checkAvailable = async () => {
        console.info("Checking available cart data");

        try {
            const allBooks = [...carts, ...unavailableBooks];

            // Fetch all book details
            const fetchPromises = allBooks.map(item =>
                api.get<Book>(`/books/${item.id}`).then(response => response.data)
            );
            const resultBooks = await Promise.all(fetchPromises);

            // Create a Map to store unique books by ID
            const bookMap = new Map<string, Book>();
            resultBooks.forEach(book => {
                bookMap.set(book.id, book);
            });

            // Convert the Map back to an array
            const uniqueBooks = Array.from(bookMap.values());

            // Separate active and inactive books
            const activeBooks = uniqueBooks.filter(book => book.status === 'ACTIVE' || book.status === 'OFFLINE_ONLY');
            const inactiveBooks = uniqueBooks.filter(book => book.status !== 'ACTIVE');

            setCarts(activeBooks);
            setUnavailableBooks(inactiveBooks);

            await saveCartToStorage();
        } catch (error) {
            console.info("An error occurred while checking available cart data.", error);
        }
    };
    const saveCartToStorage = async () => {
        console.info("Saving cart to storage");
        try {
            const jsonValue = JSON.stringify(carts);
            await AsyncStorage.setItem('bookcart', jsonValue);
            const jsonValueUnavailable = JSON.stringify(unavailableBooks);
            await AsyncStorage.setItem('bookcartUnavailable', jsonValueUnavailable);
        } catch (error) {
            console.info("An error occurred while saving the cart data.", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        saveCartToStorage();

    }, [carts, unavailableBooks]);

    // Cung cấp categories và setCategories đến context value
    const contextValue = {
        carts,
        unavailableBooks,
        addBook,
        deleteBook,
        fetchData,
        checkAvailable,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }

    return context;
};
