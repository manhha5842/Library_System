import React, { useEffect, useState } from 'react';
import { Box, Pressable, Image, Center, Text } from 'native-base';
import { NavigationProp } from '@react-navigation/native';

import { RootStackParamList } from '../constants/navigationTypes';
import { CartProvider, useCarts } from '../context/CartContext';

type BackButtonProps = {
    navigation: NavigationProp<RootStackParamList>;
};

export default function BackButton({ navigation }: BackButtonProps) {
    const { carts, unavailableBooks } = useCarts();
    return (
        <Box>
            <Pressable onPress={() => navigation.navigate('Cart', { isDefault: false })} p={3} mt={1}>
                {({ isPressed }) => (
                    <Box>
                        <Image
                            source={require('../assets/icons/basket-icon.png')}
                            alt='Icon Image'
                            size='8'
                            style={{ transform: [{ scale: isPressed ? 0.7 : 1 }] }}
                        />
                        <Center
                            bg={'red.500'}
                            size='4'
                            borderRadius={5}
                            position={'absolute'}
                            right={-6}
                            top={-2}
                            style={{ transform: [{ scale: isPressed ? 0.7 : 1 }] }}
                        >
                            <Text color={'white'} fontSize={12}>
                                {carts != null && unavailableBooks != null ? carts.length + unavailableBooks.length : 0}
                            </Text>
                        </Center>
                    </Box>
                )}
            </Pressable>
        </Box>
    );
}