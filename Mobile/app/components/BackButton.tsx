import React from 'react';
import { Box, Pressable, Image } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../constants/navigationTypes';


type NavigationHookProp = StackNavigationProp<RootStackParamList>;

export default function BackButton() {
    const navigation = useNavigation<NavigationHookProp>();

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