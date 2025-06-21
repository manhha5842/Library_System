import React from 'react';
import { Box, Pressable, Image, Center, Text } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../constants/navigationTypes';
import { useCart } from '../context/CartContext';

// Props không còn cần thiết
type CartButtonProps = {};

type NavigationHookProp = StackNavigationProp<RootStackParamList>;

// Đổi tên component thành CartButton
export default function CartButton({}: CartButtonProps) {
    // Sử dụng hook useNavigation
    const navigation = useNavigation<NavigationHookProp>();
    const { carts } = useCart();
    
    // Tính toán tổng số sách trong giỏ
    const totalItems = carts?.length || 0;

    return (
        <Box>
            {/* Sửa lại điều hướng cho đơn giản và chính xác */}
            <Pressable onPress={() => navigation.navigate('Cart')} p={3} mt={1}>
                {({ isPressed }) => (
                    <Box>
                        <Image
                            source={require('../assets/icons/basket-icon.png')}
                            alt='Icon Image'
                            size='8'
                            style={{ transform: [{ scale: isPressed ? 0.7 : 1 }] }}
                        />
                        {/* Chỉ hiển thị số lượng khi có sách trong giỏ */}
                        {totalItems > 0 && (
                            <Center
                            bg={'red.500'}
                            size='4'
                            borderRadius={5}
                            position={'absolute'}
                            right={-6}
                            top={-2}
                            style={{ transform: [{ scale: isPressed ? 0.7 : 1 }] }}
                            >
                                <Text color={'white'} fontSize={12} >
                                    {totalItems}
                                </Text>
                            </Center>
                        )}
                    </Box>
                )}
            </Pressable>
        </Box>
    );
}