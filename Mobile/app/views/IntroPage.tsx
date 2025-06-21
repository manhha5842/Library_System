import { Box, Text, HStack, VStack, Heading, Button, Image, Input, Pressable, Icon, Checkbox, Link, ScrollView } from "native-base";
import React, { useRef, useState } from "react";
import { Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik } from "formik";
import { AntDesign } from '@expo/vector-icons';
import api from "../config/apiConfig";
import axios from "axios";

import { RootStackParamList } from "../constants";
import { useUser } from '../context/UserContext';
import { User } from "../types";

type IntroPageNavigationProp = StackNavigationProp<RootStackParamList, 'Intro'>;

export default function IntroPage() {
    const { login } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async (values: any) => {
        setIsLoading(true);
        if (values.email === 'abc@xyz.com' && values.password === '123456') {
            const mockUserData: User = {
                id: 'SV001',
                name: 'Nguyễn Văn Mock',
                email: 'abc@xyz.com',
                token: 'mock-jwt-token-for-testing'
            };
            await login(mockUserData);
        } else {
            try {
                const response = await api.post(`/public/login`, {
                    email: values.email,
                    password: values.password
                });

                if (response.status === 200) {
                    const { token, ...userData } = response.data;
                    const userWithToken: User = { ...userData, token };
                    await login(userWithToken);
                } else {
                    console.error("Login failed with status: ", response.status);
                }
            } catch (error) {
                console.error('An error occurred during sign-in:', error);
            }
        }
       
        setIsLoading(false);
    };

    const Slides = () => {
        return (
            <VStack space={5} alignItems="center" >
                <Image source={require('../assets/LibraryIntro.jpg')}
                    resizeMode="cover" alt='Intro Image' size='2xl' w={'100%'} />
                <VStack space={2} w="80%">
                    <Heading size="lg">Hệ thống thư viện</Heading>
                    <Text>
                        Hệ thống thư viện cho phép sinh viên mượn và trả sách một cách dễ dàng và thuận tiện.
                    </Text>
                </VStack>
            </VStack>
        )
    };

    const SignInForm = () => {
        const [show, setShow] = useState(false);
    return (
            <VStack space={5} w={'100%'} >
                <Heading >
                    ĐĂNG NHẬP
                </Heading>
                <Formik
                    initialValues={{ email: '', password: '' }}
                    onSubmit={values => handleSignIn(values)}
                >
                    {({ handleChange, handleBlur, handleSubmit, values }) => (
                        <VStack space={3}>
                                <Input
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                value={values.email}
                                placeholder="Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                    />
                                    <Input
                                onChangeText={handleChange('password')}
                                onBlur={handleBlur('password')}
                                value={values.password}
                                placeholder="Mật khẩu"
                                type={show ? "text" : "password"}
                                InputRightElement={<Pressable onPress={() => setShow(!show)}>
                                    <Icon as={<AntDesign name={show ? "eye" : "eyeo"} />} size={5} mr="2" color="muted.400" />
                                </Pressable>}
                            />
                            <HStack justifyContent="space-between">
                                <Checkbox value="remember" accessibilityLabel="Remember me">
                                    Ghi nhớ tôi
                                </Checkbox>
                                <Link isExternal href="#" _text={{ color: "info.500" }}>Quên mật khẩu?</Link>
                                </HStack>
                            <Button isLoading={isLoading} onPress={() => handleSubmit()} colorScheme="indigo">
                                        Đăng nhập
                                    </Button>
                        </VStack>
                    )}
                </Formik>
            </VStack>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} p={5}>
            <VStack space={8} alignItems="center">
                <Slides />
                <SignInForm />
                    </VStack>
        </ScrollView>
    );
}