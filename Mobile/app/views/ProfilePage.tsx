import { Badge, Box, Button, Center, Divider, Heading, HStack, Image, ScrollView, Stack, VStack, Text } from 'native-base';
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../constants';
import { mockUser } from '../types/mockData';

type ProfilePageNavigationProp = StackNavigationProp<
    RootStackParamList,
    'ProfilePage'
>;

const ProfilePage: React.FC = () => {
    const { user, logout } = useUser();
    const navigation = useNavigation<ProfilePageNavigationProp>();

    const displayUser = user || mockUser;

    const handleLogout = () => {
        logout();
    };

    return (
        <ScrollView>
            <VStack space={4} alignItems="center" py={8}>
                <Image 
                    source={require('../assets/avatar.png')} 
                    alt="Avatar" 
                    size="xl" 
                    borderRadius="full" 
                />
                <VStack space={1} alignItems="center">
                    <Text fontSize="2xl" fontWeight="bold">
                        {displayUser.name}
                    </Text>
                    <Text fontSize="md" color="gray.500">
                        {displayUser.email}
                    </Text>
                </VStack>
            </VStack>
            <Stack direction={"column"} safeArea>
                <VStack p={3} space={3}>
                    <Button
                        w={'100%'} size={'sm'} variant={'ghost'} bg={'white'} py={3}
                        _pressed={{ backgroundColor: 'coolGray.100' }}
                        _text={{ fontWeight: "500", fontSize: '14' }}
                        colorScheme={'white'} justifyContent={'left'} fontWeight={700} shadow={5} borderRadius={15}
                        leftIcon={<Image source={require('../assets/icons/book-icon.png')} alt='Icon Image' size="xs" />}
                        onPress={() => navigation.navigate('HistoryBorrowRecord')}>
                        Lịch sử đơn mượn sách
                    </Button>
                    <Button
                        w={'100%'} size={'sm'} variant={'ghost'} bg={'white'} py={3}
                        _pressed={{ backgroundColor: 'coolGray.100' }}
                        _text={{ fontWeight: "500", fontSize: '14' }}
                        colorScheme={'white'} justifyContent={'left'} fontWeight={700} shadow={5} borderRadius={15}
                        leftIcon={<Image source={require('../assets/icons/report-icon.png')} alt='Icon Image' size="xs" />}
                        onPress={() => navigation.navigate('HistoryFeedback')}>
                        Lịch sử đơn góp ý
                    </Button>
                    <Button
                        w={'100%'} size={'sm'} variant={'ghost'} bg={'white'} py={3}
                        _pressed={{ backgroundColor: 'coolGray.100' }}
                        _text={{ fontWeight: "500", fontSize: '14' }}
                        colorScheme={'white'} justifyContent={'left'} fontWeight={700} shadow={5} borderRadius={15}
                        leftIcon={<Image source={require('../assets/icons/notification-icon.png')} alt='Icon Image' size="xs" />}
                        onPress={() => navigation.navigate('HistoryFineRecord')}                    >
                        Phiếu phạt
                    </Button>
                    <Button
                        w={'100%'} size={'sm'} variant={'subtle'} bg={'white'} py={3}
                        _text={{ fontWeight: "500", fontSize: '14' }}
                        colorScheme={'danger'} justifyContent={'left'} fontWeight={700} shadow={5} borderRadius={15}
                        leftIcon={<Image source={require('../assets/icons/logout-icon.png')} alt='Icon Image' size="xs" />}
                        onPress={handleLogout}>
                        Đăng xuất
                    </Button>
                </VStack>

            </Stack>
        </ScrollView>
    );
}

export default ProfilePage;

