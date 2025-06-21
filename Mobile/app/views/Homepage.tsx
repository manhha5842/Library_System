import React, { useState, useCallback } from 'react';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../constants';
import {
    ScrollView,
    Box,
    Text,
    Image,
    VStack,
    HStack,
    Pressable,
} from 'native-base';
import { RefreshControl } from 'react-native';
import { useUser } from '../context/UserContext';
import icons from '../constants/icons';
import CategorySection from '../components/home/CategorySection';
import BookSection from '../components/home/BookSection';

type HomePageNavigationProp = StackNavigationProp<RootStackParamList, 'HomePage'>;

const HomePage = () => {
    const navigation = useNavigation<HomePageNavigationProp>();
    const { user } = useUser();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate a network request
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);
    
    const userFirstName = user?.name.split(' ')[0] || 'User';

    return (
        <ScrollView
            flex={1}
            bg={'white'}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <VStack>
                {/* Header */}
                <Image
                    alt='banner'
                    source={require('../assets/banner-home.png')}
                    w={'100%'} h={200}
                />
                <Box position={'absolute'} p={5} w={'100%'} h={200} justifyContent={'space-between'}>
                    <HStack justifyContent={'space-between'} alignItems='center'>
                        <Box>
                            <Text fontSize={'md'}>Xin chào,</Text>
                            <Text fontSize={'2xl'} fontWeight={700}>{userFirstName}!</Text>
                        </Box>
                        <HStack space={4}>
                            <Pressable onPress={() => navigation.navigate('CartPage' as never)}>
                                <Image source={icons.basket_icon} alt='basket' w={6} h={6} />
                            </Pressable>
                            <Pressable onPress={() => navigation.navigate('NotificationPage' as never)}>
                                <Image source={icons.notification_icon} alt='notification' w={6} h={6} />
                            </Pressable>
                        </HStack>
                    </HStack>
                    <Pressable onPress={() => navigation.navigate('SearchPage' as never)}>
                        <Box
                            bg={'white'} borderRadius={10} shadow={5}
                            h={12} justifyContent={'center'} px={4}
                        >
                            <Text color={'gray.400'}>Bạn đang tìm sách gì...</Text>
                        </Box>
                    </Pressable>
                </Box>
            </VStack>

            {/* Body */}
            <VStack space={5} p={5}>
                {/* Categories */}
                <VStack space={2}>
                    <Text fontWeight={600} fontSize={'lg'}>Thể loại</Text>
                    <CategorySection />
                </VStack>

                {/* Recommended Books */}
                <VStack space={2}>
                    <Text fontWeight={600} fontSize={'lg'}>Sách đề xuất</Text>
                    <BookSection refreshing={refreshing} />
                </VStack>
            </VStack>
        </ScrollView>
    );
};

export default HomePage;

