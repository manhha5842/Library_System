import { Badge, Box, Button, Center, Divider, Heading, HStack, Image, ScrollView, Stack, VStack } from 'native-base';
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../constants';
type ProfilePageNavigationProp = StackNavigationProp<
    RootStackParamList,
    'ProfilePage'
>;
export default function ProfilePage() {
    const { user, logout } = useUser();
    const navigation = useNavigation<ProfilePageNavigationProp>();
    const onLogout = () => {
        logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Intro' as never }],
        });
    }

    return (
        <ScrollView>
            <Stack direction={"column"} safeArea>
                <Center >
                    <Image source={require('../assets/avatar.png')}
                        resizeMode="cover" alt='Avatar Image' size='72' w={'100%'} />
                    <Heading>
                        {user?.name}
                    </Heading>
                    <Divider bg="indigo.500" thickness="2" my={2} w={40} orientation="horizontal" />
                    <Badge colorScheme={'lightBlue'}>
                        {user?.id}
                    </Badge>
                </Center>
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
                        onPress={onLogout}>
                        Đăng xuất
                    </Button>
                </VStack>

            </Stack>
        </ScrollView>
    );
}

