import React, { useState, createContext, useRef, useEffect } from 'react';
import { Animated, StyleSheet, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, Keyboard, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { Box, Container, Text, HStack, VStack, Heading, Button, Image, Badge, WarningOutlineIcon, Icon, Pressable, ZStack, Center, Input, Radio, Stack, SectionList, FlatList, Divider, Skeleton, IconButton } from "native-base"
import axios from 'axios';
import api from '../config/apiConfig';    
import { useUser } from '../context/UserContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../constants';
import { Book } from '../types';
import { mockBooks } from '../types/mockData';
import { AntDesign } from '@expo/vector-icons';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SearchBook'>;

export default function SearchBook() {
    const { user, isLoggedIn, isCheckingToken } = useUser();
    const navigation = useNavigation<SearchScreenNavigationProp>();
    const [query, setQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState<Book[]>([]);
    const searchInputRef = useRef<any>(null);

    const fetchSuggestions = async (keyword: string) => {
        if (!keyword.trim()) {
            setFilteredItems([]);
            return;
        }

        try {
            const response = await api.get<Book[]>(`/books/search/suggestions`, {
                params: { keyword: keyword },
            });
                setFilteredItems(response.data);
        } catch (error) {
            console.error('Error fetching search suggestions:', error);
            const mockSuggestions = mockBooks.filter(book =>
                book.title.toLowerCase().includes(keyword.toLowerCase())
            );
            setFilteredItems(mockSuggestions);
        }
    };

    const handleSearch = (item: Book) => {
        navigation.navigate('BookListSearch', {
            title: item.title,
            type: 'search',
            keyword: item.title
        });
    };

    const handleQueryChange = (text: string) => {
        setQuery(text);
        if (text.length > 2) {
            fetchSuggestions(text);
        } else {
            setFilteredItems([]);
    }
    };

    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    return (
        <VStack space={3} safeArea p={4}>
            <HStack space={2} alignItems="center">
                <IconButton
                    icon={<Icon as={AntDesign} name="arrowleft" />}
                    onPress={() => navigation.goBack()}
                />
                <Input
                    ref={searchInputRef}
                    placeholder="Tìm kiếm sách..."
                    value={query}
                    onChangeText={handleQueryChange}
                    flex={1}
                    onSubmitEditing={() => navigation.navigate('BookListSearch', {
                        title: `Kết quả cho '${query}'`,
                        type: 'search',
                        keyword: query
                    })}
                />
            </HStack>
                            <FlatList
                                data={filteredItems}
                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                    <Text
                        p={2}
                        onPress={() => handleSearch(item)}
                        borderBottomWidth={1}
                        borderBottomColor="coolGray.200"
                    >
                        {item.title}
                                                </Text>
                )}
                ListEmptyComponent={<Text>Không có gợi ý nào</Text>}
                            />
        </VStack>
    );
}

