import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { useUser } from './UserContext';
import { Book, BookDetail, Category } from '../types';
type BookContextType = {
    bookDetail: BookDetail | null;
    books: Book[];
    isFetching: boolean;
    hasMore: boolean;
    setBooks: (books: Book[]) => void;
    searchBooks: (query: string | undefined, page: number, size: number) => Promise<void | any>;
    recommendBooks: () => Promise<void>;
    fetchBookDetail: (id: string | undefined) => Promise<void>;
    fetchBookByCategory: (id: string | undefined) => Promise<void>;
    fetchBookByAuthor: (id: string | undefined) => Promise<void>;
    fetchBookByIds: (ids: string[] | undefined) => Promise<void>;
    sortBooks: (sortOption: string | undefined) => Promise<void>;
};

const defaultContextValue: BookContextType = {
    bookDetail: null,
    books: [],
    isFetching: false,
    hasMore: false,
    setBooks: async () => { },
    searchBooks: async () => { },
    recommendBooks: async () => { },
    fetchBookDetail: async () => { },
    fetchBookByCategory: async () => { },
    fetchBookByAuthor: async () => { },
    fetchBookByIds: async () => { },
    sortBooks: async () => { },
};
interface BookProviderProps {
    children: ReactNode;
}
const BookContext = createContext<BookContextType>(defaultContextValue);

export const BookProvider: React.FC<BookProviderProps> = ({ children }) => {
    const [bookDetail, setBookDetail] = useState<BookDetail | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const { user } = useUser();

    const searchBooks = async (query: string | undefined, page = 0, size = 20) => {
        try {
            setIsFetching(true);
            let response = await axios.get(`${apiConfig.baseURL}/api/books/search`, {
                params: { keyword: query, page, size },
            });

            if (response.status === 200) {
                const newBooks = response.data.content;
                const totalPages = response.data.totalPages;
                const currentPage = response.data.pageable.pageNumber;

                setHasMore(currentPage < totalPages - 1); // Kiểm tra có thêm trang tiếp theo không

                if (page === 0) {
                    setBooks(newBooks);
                } else {
                    setBooks(prevBooks => [...prevBooks, ...newBooks]);
                }
                return response;
            }
        } catch (error) {
            console.log('Error searching books', error);
        } finally {
            setIsFetching(false);
        }
    };
    const recommendBooks = async () => {
        console.info('Get recommend books');
        if (isFetching) {
            console.info('Fetching data from other requests');
            return;
        } else {
            try {
                setIsFetching(true);
                const response = await axios.get<Book[]>(`${apiConfig.baseURL}/api/books/getRecommendBooks`);
                if (response?.status === 200) {
                    setBooks(response.data);
                }
            } catch (error) {
                console.log('Error getting recommend books', error);
            }
            setIsFetching(false);
        }
    };

    const fetchBookDetail = async (id: string | undefined) => {
        console.info('Fetch book detail');
        if (isFetching) {
            console.info('Fetching data from other requests');
            return;
        } else {
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
        }
    };
    const fetchBookByCategory = async (id: string | undefined) => {
        console.info('Fetch book by category with ', id);

        if (isFetching) {
            console.info('Fetching data from other requests');
            return;
        } else {
            if (id) {
                console.info('Fetching data ');
                setIsFetching(true); // Bắt đầu fetching, đặt trạng thái là true
                try {
                    const response = await axios.get<Book[]>(`${apiConfig.baseURL}/api/books/getBooksByCategory/${id}`);
                    if (response?.status === 200) {
                        setBooks(response.data);
                    }
                } catch (error) {
                    console.log('Fetching books failed', error);
                    // Xử lý lỗi nếu cần
                } finally {
                    setIsFetching(false); // Kết thúc fetching, đặt trạng thái về false
                }
            }
        }
    };
    const fetchBookByAuthor = async (id: string | undefined) => {
        console.info('Fetch book by author with ', id);

        if (isFetching) {
            console.info('Fetching data from other requests');
            return;
        } else {
            if (id) {
                setIsFetching(true); // Bắt đầu fetching, đặt trạng thái là true
                try {
                    const response = await axios.get<Book[]>(`${apiConfig.baseURL}/api/books/getBooksByAuthor/${id}`);
                    if (response?.status === 200) {
                        setBooks(response.data);
                    }
                } catch (error) {
                    console.log('Fetching books failed', error);
                    // Xử lý lỗi nếu cần
                } finally {
                    setIsFetching(false); // Kết thúc fetching, đặt trạng thái về false
                }
            }
        }
    };
    const fetchBookByIds = async (ids: string[] | undefined) => {
        console.info('Fetch books with IDs: ', ids ? ids.join(', ') : 'undefined');

        if (isFetching) {
            console.info('Fetching data from other requests');
            return;
        } else {
            if (ids) {
                setIsFetching(true); // Bắt đầu fetching, đặt trạng thái là true
                try {
                    const fetchPromises = ids.map(id =>
                        axios.get<Book>(`${apiConfig.baseURL}/api/books/${id}`).then(response => response.data)
                    );

                    const resultBooks = await Promise.all(fetchPromises);

                    addBooksToState(resultBooks);
                } catch (error) {
                    console.log('Fetching books failed', error);
                    // Xử lý lỗi nếu cần
                } finally {
                    setIsFetching(false); // Kết thúc fetching, đặt trạng thái về false
                }
            }
        }
    };
    const addBooksToState = (newBooks: Book[]) => {
        setBooks((currentBooks) => {
            const bookMap = new Map((currentBooks || []).map(book => [book.id, book]));

            // Thêm hoặc cập nhật sách mới vào Map
            newBooks.forEach(book => {
                bookMap.set(book.id, book);
            });

            // Chuyển đổi lại thành mảng và cập nhật trạng thái
            return Array.from(bookMap.values());
        });
    };
    const sortBooks = async (sortOption: string | undefined) => {
        console.info('Sorting books');
        if (isFetching) {
            console.info('Fetching data from other requests');
            return;
        } else {
            if (sortOption) {
                setIsFetching(true);
                let sortedBooks = [...books]; // Tạo bản sao của mảng books
                switch (sortOption) {
                    case 'AZ':
                        sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
                        break;
                    case 'ZA':
                        sortedBooks.sort((a, b) => b.title.localeCompare(a.title));
                        break;
                    default:
                    // Xử lý mặc định (nếu cần)
                }
                await setBooks(sortedBooks);
                setIsFetching(false); // Kết thúc fetching, đặt trạng thái về false
            }
        }
    };
    return (
        <BookContext.Provider value={{
            bookDetail, books, isFetching, hasMore,
            setBooks, searchBooks, recommendBooks,
            fetchBookDetail, fetchBookByCategory, fetchBookByAuthor, fetchBookByIds,
            sortBooks
        }}>
            {children}
        </BookContext.Provider>
    );
};


// Custom hook
export const useBooks = () => {
    const context = useContext(BookContext);

    if (!context) {
        throw new Error('useBooks must be used within a BookProvider');
    }

    return context;
};