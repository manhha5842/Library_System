import React from 'react';
import { Box, Pressable, Image } from 'native-base';
import { NavigationProp } from '@react-navigation/native';

import { RootStackParamList } from '../constants/navigationTypes';

type BackButtonProps = {
    navigation: NavigationProp<RootStackParamList>;
};

export default function BackButton({ navigation }: BackButtonProps) {
    return (
        <Box>
            <Pressable onPress={() => navigation.goBack()} p={3} mt={3}>
                {({ isPressed, isHovered }) => (
                    <Image
                        source={require('../assets/icons/back-icon.png')}
                        alt='Icon Image'
                        size='8'
                        style={{ transform: [{ scale: isPressed || isHovered ? 0.7 : 1 }] }}
                    />
                )}
            </Pressable>
        </Box>
    );
}