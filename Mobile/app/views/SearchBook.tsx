import React, { useState, createContext, useRef, useEffect } from 'react';
import { Animated, StyleSheet, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, Keyboard, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { Box, Container, Text, HStack, VStack, Heading, Button, Image, Badge, WarningOutlineIcon, Icon, Pressable, ZStack, Center, Input, Radio, Stack, SectionList, FlatList, Divider, Skeleton } from "native-base"
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { text } from 'cheerio/lib/api/manipulation';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../constants';

type SearchNavigationProp = StackNavigationProp<
    RootStackParamList,
    'SearchPage'
>;
export default function SearchPage() {
    const { user, isLoggedIn, isCheckingToken } = useUser();
    const navigation = useNavigation<SearchNavigationProp>();
    const [filteredItems, setFilteredItems] = useState<string[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [keyword, setKeyword] = useState<string>('');

    const fetchSuggestions = async (text: string) => {
        await setKeyword(text);
        setIsFetching(true);
        try {
            const response = await axios.get<string[]>(`${apiConfig.baseURL}/api/books/search/suggestions?keyword=${text}`);
            if (response?.status === 200) {
                setFilteredItems(response.data);
            }
        } catch (error) {
            console.log('Fetching books failed', error);

        } finally {
            setIsFetching(false);
        }

    }
    useEffect(() => {
        fetchSuggestions('');
    }, []);

    return (
        <VStack safeArea >
            <HStack padding={3}  >
                <Input
                    placeholder='Nhập nội dung bạn muốn tìm'
                    autoFocus shadow={6} px={5} borderWidth="0" borderRadius={20} isFocused={true}
                    _focus={{ bg: "white", }} _hover={{ bg: "white", }} _important={{ bg: "white", }} w={"100%"}
                    InputLeftElement={
                        <Pressable onPress={() => navigation.goBack()} ml={3} >
                            {({ isPressed, isHovered }) => (
                                <Image
                                    source={require('../assets/icons/back-icon.png')}
                                    alt='Icon Image'
                                    size='8'
                                    style={{ transform: [{ scale: isPressed || isHovered ? 0.7 : 1 }] }}
                                />
                            )}
                        </Pressable>
                    }
                    InputRightElement={
                        <Pressable onPress={() => navigation.navigate('BookListSearch', { keyword: keyword })}>
                            <Image source={require('../assets/icons/search-icon.png')}
                                resizeMode="cover" alt='Icon image' size={"xs"} mr={3} />
                        </Pressable>
                    }
                    onChangeText={text => fetchSuggestions(text)}
                    onSubmitEditing={() => navigation.navigate('BookListSearch', { keyword: keyword })}
                >
                </Input>

            </ HStack>
            <VStack >
                <Heading bottom={0} py={2} fontSize={18} padding={3}>
                    Gợi ý
                </Heading>
                {
                    isFetching ?
                        (
                            <Box px={4} opacity={isFetching ? 1 : 0}>
                                <Skeleton.Text py={4} lines={1} />
                                <Divider bg="light.300" thickness="1" orientation="horizontal" />
                                <Skeleton.Text py={4} lines={1} />
                                <Divider bg="light.300" thickness="1" orientation="horizontal" />
                                <Skeleton.Text py={4} lines={1} />
                            </Box>
                        )
                        :
                        (
                            <FlatList
                                data={filteredItems}
                                renderItem={({ item }) => (
                                    <Pressable onPress={() => navigation.navigate('BookListSearch', { keyword: item })}>
                                        {({ isPressed, isHovered, isFocused }) => (
                                            <Box px={4} bg={isPressed || isHovered || isFocused ? "coolGray.100" : "white"}>
                                                <Text py={4}>
                                                    {item}
                                                </Text>
                                                <Divider
                                                    bg="light.300"
                                                    thickness="1"
                                                    orientation="horizontal"
                                                    opacity={item === filteredItems[filteredItems.length - 1] ? 0 : 1}
                                                />
                                            </Box>
                                        )}
                                    </Pressable>
                                )}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        )
                }


            </VStack>
        </VStack>
    );
}

