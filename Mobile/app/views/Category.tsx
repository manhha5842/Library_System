import React, { useState, createContext, useRef, useEffect } from 'react';
import { Animated, StyleSheet, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, Keyboard, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation } from "@react-navigation/native";

import { CategoryProvider, useCategories } from '../context/CategoryContext';
import { Box, Container, Text, HStack, VStack, Heading, Button, Image, Badge, WarningOutlineIcon, Icon, Pressable, ZStack, Center, Input, Radio, Stack, SectionList, Divider } from "native-base"
import axios from 'axios';
import api from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../constants';
import { mockCategoryGroups } from '../types/mockData';

type CategoryNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Category'
>;

export default function Category() {
    const navigation = useNavigation<CategoryNavigationProp>();
    const CategoryGroup = () => {
        const { categoryGroup, fetchCategories } = useCategories();
        const [localCategoryGroup, setLocalCategoryGroup] = useState(categoryGroup);
        useEffect(() => {
            const fetchData = async () => {
                try {
                    await fetchCategories();
                } catch (e) {
                    setLocalCategoryGroup(mockCategoryGroups);
                }
            };
            fetchData();
        }, []);

        const displayCategoryGroup = categoryGroup && categoryGroup.length > 0 ? categoryGroup : localCategoryGroup;

        return <SectionList
            w="100%" mb="10"
            sections={displayCategoryGroup}
            keyExtractor={(item, index) => item.id.toString() || index.toString()}
            renderSectionHeader={({ section: { title }, section }) => (
                <Box bg={'white'} shadow={15} p={3}>
                    <Heading fontSize="xl" pt={4}>
                        {title}
                    </Heading>
                    <Divider bg="indigo.500" thickness="2" orientation="horizontal" />
                </Box>
            )}
            renderItem={({ item, index, section }) => {
                const isLastSection = section.title == displayCategoryGroup[displayCategoryGroup.length - 1].title;
                const isLastItemInSection = index === section.data.length - 1;
                const isLastItemOverall = isLastSection && isLastItemInSection;

                return (
                    <Pressable onPress={() => navigation.navigate('BookList', { title: item.name, type: 'category', id: item.id })}>
                        {({ isPressed }) => (
                            <Box 
                                py="2" px={4} bg={isPressed ? "coolGray.100" : "white"} pb={isLastItemOverall ? 32 : 0}
                            >
                                {item.name}
                            </Box>
                        )}
                    </Pressable>
                );
            }}
        />
    }
    return (
        <VStack space={5} >
            <Center>
                <Heading fontSize={'3xl'}>Thể loại</Heading>
                <Text> Tìm kiếm sách theo thể loại</Text>
            </Center>
            <CategoryProvider>
                <CategoryGroup />
            </CategoryProvider>
        </ VStack>
    );
}

