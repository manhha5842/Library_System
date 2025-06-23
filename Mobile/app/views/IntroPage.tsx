import { Box, Text, HStack, VStack, Heading, Button, Image, Input, Pressable, Icon, Checkbox, Link, ScrollView } from "native-base";
import React, { useRef, useState } from "react";
import { Animated, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik } from "formik";
import { AntDesign } from '@expo/vector-icons';
import api from "../config/apiConfig";
import axios from "axios";
import * as Yup from 'yup';

import { RootStackParamList } from "../constants";
import { useUser } from '../context/UserContext';
import { User } from "../types";


export default function IntroPage() {
    const { login } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const handleSignIn = async (values: any, { setSubmitting }: any) => {
        setIsLoading(true);
        setLoginError('');
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
                    setLoginError('Sai tài khoản hoặc mật khẩu.');
                }
            } catch (error) {
                setLoginError('Sai tài khoản hoặc mật khẩu.');
            }
        }
        setIsLoading(false);
        setSubmitting(false);
    };

    const SignInForm = () => {
        const [show, setShow] = useState(false);
        return (
            <VStack space={5} w={'100%'} >
                <Heading color={'#fff'}>
                    ĐĂNG NHẬP
                </Heading>
                <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={Yup.object({
                        email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
                        password: Yup.string().required('Vui lòng nhập mật khẩu'),
                    })}
                    onSubmit={handleSignIn}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                        <VStack space={3}>
                            <Input
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                value={values.email}
                                placeholder="Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                isInvalid={!!(touched.email && errors.email)}
                            />
                            {touched.email && errors.email && (
                                <Text color="red.400" fontSize="xs">{String(errors.email)}</Text>
                            )}
                            <Input
                                onChangeText={handleChange('password')}
                                onBlur={handleBlur('password')}
                                value={values.password}
                                placeholder="Mật khẩu"
                                type={show ? "text" : "password"}
                                InputRightElement={<Pressable onPress={() => setShow(!show)}>
                                    <Icon as={<AntDesign name={show ? "eye" : "eyeo"} />} size={5} mr="2" color="muted.400" />
                                </Pressable>}
                                isInvalid={!!(touched.password && errors.password)}
                            />
                            {touched.password && errors.password && (
                                <Text color="red.400" fontSize="xs">{String(errors.password)}</Text>
                            )}
                            {loginError && (
                                <Text color="red.400" fontSize="xs">{loginError}</Text>
                            )}
                            <HStack justifyContent="space-between">
                                <Link isExternal href="#" _text={{ color: "info.800" }}>Quên mật khẩu?</Link>
                            </HStack>
                            <Button isLoading={isLoading || isSubmitting} onPress={() => handleSubmit()} colorScheme="indigo">
                                Đăng nhập
                            </Button>
                        </VStack>
                    )}
                </Formik>
            </VStack>
        );
    }

    return (
        <Box flex={1} >
            <ImageBackground
                source={require('../assets/LibraryIntro.jpg')}
                style={{ flex: 1, position: 'absolute', width: '100%', height: '100%' }}
                resizeMode="cover"
            />
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} p={30}>
                <VStack space={8} alignItems="center" style={{ position: 'relative', zIndex: 1 }}>
                    <SignInForm />
                </VStack>
            </ScrollView>
        </Box>
    );
}