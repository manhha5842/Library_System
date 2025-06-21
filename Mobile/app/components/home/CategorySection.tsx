import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { HStack, Pressable, Badge, Text } from "native-base";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../constants';
import { useCategories, CategoryProvider } from '../../context/CategoryContext';
import { Category } from '../../types';
import { mockCategories } from '../../types/mockData';

type HomePageNavigationProp = StackNavigationProp<RootStackParamList, 'HomePage'>;

const RenderCategories = () => {
    const navigation = useNavigation<HomePageNavigationProp>();
    const { categories, fetchCategories } = useCategories();
    const [localCategories, setLocalCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategoriesList = async () => {
            try {
                await fetchCategories();
            } catch (e) {
                console.log("Failed to fetch categories, using mock data.", e);
                setLocalCategories(mockCategories);
            }
        };
        fetchCategoriesList();
    }, []);

    const displayCategories = (categories && categories.length > 0) ? categories : localCategories;

    const randomColor = () => {
        const colors = ["red.400", "green.400", "blue.400", "purple.400", "gray.400", "purple.400"];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <HStack flexDirection="row" flexWrap="wrap" space={3}>
            {displayCategories.map((category, categoryIndex) => (
                categoryIndex <= 5 ? (
                    <Pressable key={category.id} onPress={() => navigation.navigate('BookList', { title: category.name, type: 'category', id: category.id })}>
                        {({ isPressed }) => (
                            <Badge
                                px={2} my={1} borderRadius={5} shadow={1}
                                bg={isPressed ? "coolGray.200" : "coolGray.100"}
                                style={{ transform: [{ scale: isPressed ? 0.96 : 1 }] }}
                            >
                                <Text color={randomColor()}>{category.name}</Text>
                            </Badge>
                        )}
                    </Pressable>
                ) : categoryIndex === 6 ? (
                    <Pressable key={'more'} onPress={() => navigation.navigate('Category' as never)}>
                        {({ isPressed }) => (
                            <Badge
                                px={2} my={1} borderRadius={5} shadow={1}
                                bg={isPressed ? "coolGray.200" : "coolGray.100"}
                                style={{ transform: [{ scale: isPressed ? 0.96 : 1 }] }}
                            >
                                <Text color={randomColor()}>Xem thêm...</Text>
                            </Badge>
                        )}
                    </Pressable>
                ) : null
            ))}
        </HStack>
    );
};

// Wrap with provider to be self-contained
const CategorySection = () => (
    <CategoryProvider>
        <RenderCategories />
    </CategoryProvider>
);

export default CategorySection; 