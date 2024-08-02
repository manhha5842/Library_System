// import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Animated, StyleSheet, ImageBackground, SafeAreaView, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { Box, Input, Text, VStack, Heading, Button, Image, FormControl, Icon, Pressable, KeyboardAvoidingView, Stack, HStack } from "native-base";
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { useRef, useState } from 'react';
import { ExpoPushToken } from '../components/ExpoToken';

const screenWidth = Dimensions.get('window').width;

const IntroPage = () => {
    const navigation = useNavigation();
    const { loadUserAndCheckToken } = useUser();

    const [formData, setFormData] = useState({ email: '', otp: '', password: '' });
    const [errors, setErrors] = useState({});
    const [rePassword, setRePassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [countDown, setCountDown] = useState(30);
    const [canSendOtp, setCanSendOtp] = useState(true);

    const positionEmail = useRef(new Animated.Value(0)).current;
    const positionOTP = useRef(new Animated.Value(screenWidth)).current;
    const positionSetPassword = useRef(new Animated.Value(screenWidth * 2)).current;
    const positionPassword = useRef(new Animated.Value(screenWidth)).current;

    const moveToLeft = (position: Animated.Value) => {
        Animated.timing(position, {
            toValue: -screenWidth,
            duration: 500,
            useNativeDriver: true
        }).start();
    };

    const moveToRight = (position: Animated.Value) => {
        Animated.timing(position, {
            toValue: screenWidth,
            duration: 500,
            useNativeDriver: true
        }).start();
    };

    const moveToCenter = (position: Animated.Value) => {
        Animated.timing(position, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
        }).start();
    };

    const validateEmail = () => {
        if (!formData.email) {
            setErrors({ ...errors, email: 'Vui lòng nhập email' });
            return false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setErrors({ ...errors, email: 'Email không đúng' });
            return false;
        } else if (!formData.email.endsWith('hcmuaf.edu.vn')) {
            setErrors({ ...errors, email: 'Vui lòng sử dụng email sinh viên.' });
            return false;
        }
        setErrors({});
        return true;
    };

    const validatePassword = () => {
        console.log(!formData.password);
        console.log(formData)
        if (!formData.password) {
            setErrors({ ...errors, password: 'Vui lòng nhập mật khẩu' });
            return false;
        }
        //  else if (!/^.{6,30}$/.test(formData.password)) {
        //     setErrors({ ...errors, password: 'Mật khẩu phải có ít nhất 6 ký tự và không được vượt quá 30 ký tự.' });
        //     return false;
        // } else if (formData.password !== rePassword) {
        //     setErrors({ ...errors, password: 'Mật khẩu không khớp' });
        //     return false;
        // }
        setErrors({});
        return true;
    };

    const handleEmailSubmit = async () => {
        setIsLoading(true);
        if (validateEmail()) {
            // try {
            //     const response = await axios.get(`${apiConfig.baseURL}/api/public/checkEmail`, {
            //         params: { email: formData.email },
            //     });
            //     if (response.data === "User not found") {
            //         setStep(1);
            //         moveToLeft(positionEmail);
            //         moveToCenter(positionOTP);
            //     } else {
            //         setStep(3);
            //         moveToLeft(positionEmail);
            //         moveToCenter(positionPassword);
            //     }
            // } catch (error) {
            //     setErrors({ ...errors, email: 'Lỗi kết nối' });
            //     console.log('There was an error!', error);
            // }
            setStep(3);
            moveToLeft(positionEmail);
            moveToCenter(positionPassword);
        }

        setIsLoading(false);
    };

    const handleOTPSubmit = () => {
        setStep(2);
        moveToLeft(positionOTP);
        moveToCenter(positionSetPassword);
    };

    const handleSetPasswordSubmit = () => {
        if (validatePassword()) {
            // Gọi API để đặt mật khẩu mới
        }
    };

    const handlePasswordSubmit = async () => {
        setIsLoading(true);
        if (validatePassword()) {
            try {
                const response = await axios.post(`${apiConfig.baseURL}/api/public/login`, {
                    email: formData.email,
                    password: formData.password,
                });
                if (response.status === 200) {
                    setErrors({});
                    if (response.data.user) {
                        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

                        // Lấy expoPushToken
                        const expoPushToken = await ExpoPushToken();
                        if (expoPushToken) {
                            // Gửi expoPushToken lên server 
                            await axios.put(`${apiConfig.baseURL}/api/public/expoPushToken/${response.data.user.id}`, {
                                expoPushToken: expoPushToken,
                            });
                        }

                        await loadUserAndCheckToken();

                        navigation.navigate('HomeTabs' as never);
                    } else {
                        throw new Error('User data is null or undefined');
                    }
                } else {
                    setErrors({ ...errors, password: 'Mật khẩu không đúng!' });
                }
            } catch (error) {
                setErrors({ ...errors, password: 'Thông tin tài khoản không đúng!' });
                console.log('There was an error!', error);
            }
        }
        setIsLoading(false);
    };

    const handleBackToEmail = (fromStep: number) => {
        setStep(0);
        setErrors({});
        setIsLoading(false);
        switch (fromStep) {
            case 1:
                moveToRight(positionOTP);
                break;
            case 2:
                moveToRight(positionSetPassword);
                positionOTP.setValue(screenWidth);
                break;
            case 3:
                moveToRight(positionPassword);
                break;
        }
        moveToCenter(positionEmail);
    };

    const sendOtp = () => {
        setIsSendingOtp(true);
        setCanSendOtp(false);
        // Gọi API gửi mã OTP tại đây
        const intervalId = setInterval(() => {
            setCountDown((prevCountDown) => {
                if (prevCountDown <= 1) {
                    clearInterval(intervalId);
                    setIsSendingOtp(false);
                    setCanSendOtp(true);
                    return 30;
                }
                return prevCountDown - 1;
            });
        }, 1000);
    };

    return (
        <Stack flex={1}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} flex={1}>
                <Box flex={1} alignItems="center">
                    <Image alt="Background Image" resizeMode="cover" size={"100%"} position="absolute" top="0" left="0"
                        source={require('../assets/LibraryIntro.jpg')}
                    />
                    <Box bg="rgba(0, 0, 0, 0.25)" size={"100%"} position="absolute" top="0" left="0" />
                    <VStack style={styles.textContainer} position={"absolute"} width={"100%"} bottom={"72"}>
                        <Heading color={"white"} fontSize="3xl" textAlign={"center"}>SỐNG CÙNG TRI THỨC</Heading>
                        <Text color={"white"} fontSize="sm" textAlign={"center"}>
                            Khám phá không gian kiến thức tại Thư viện Đại học
                        </Text>
                    </VStack>
                    <VStack position={"absolute"} width={"100%"} bottom={"5%"} alignItems={"center"}>
                        <Animated.View
                            style={{ width: "100%", position: "absolute", bottom: 0, transform: [{ translateX: positionEmail }] }}>
                            <Text color={"white"} fontSize="sm" textAlign={"center"} marginBottom={"3"}>Bắt đầu ngay với tài khoản sinh viên của bạn!</Text>
                            <FormControl isRequired isInvalid={'email' in errors} alignItems={"center"}>
                                <Input
                                    variant="filled"
                                    isDisabled={isLoading}
                                    bg="white"
                                    isFocused={step === 0}
                                    _focus={{ backgroundColor: 'white', borderColor: 'white' }}
                                    fontSize="sm"
                                    width={'80%'}
                                    textAlign={"left"}
                                    placeholder="Nhập email của bạn"
                                    keyboardType='email-address'
                                    onChangeText={(value) => setFormData({ ...formData, email: value })}
                                    onSubmitEditing={handleEmailSubmit}
                                />
                                {'email' in errors ? (
                                    <FormControl.ErrorMessage color={'red.600'} leftIcon={<MaterialIcons name="warning" color="red" size={16} />}>
                                        {errors.email}

                                    </FormControl.ErrorMessage>
                                ) : null}
                                <Button onPress={handleEmailSubmit} mt="5" colorScheme="cyan" isLoading={isLoading}>
                                    Tiếp tục
                                </Button>
                            </FormControl>
                        </Animated.View>

                        <Animated.View
                            style={{ width: "100%", position: "absolute", bottom: 0, transform: [{ translateX: positionOTP }] }}>
                            <Text color={"white"} fontSize="sm" textAlign={"center"}>Nhập mã OTP được gửi về</Text>
                            <Text color={"white"} fontSize="sm" textAlign={"center"} mb={"3"}>{formData.email}</Text>
                            <FormControl isRequired isInvalid={'otp' in errors} alignItems={"center"}>
                                <Input
                                    variant="filled"
                                    bg="white"
                                    isDisabled={isLoading}
                                    isFocused={step === 1}
                                    _focus={{ backgroundColor: 'white', borderColor: 'white' }}
                                    fontSize="sm"
                                    width={'80%'}
                                    textAlign={"left"}
                                    placeholder="Nhập mã OTP"
                                    keyboardType='number-pad'
                                    onChangeText={(value) => setFormData({ ...formData, otp: value })}
                                    onSubmitEditing={handleOTPSubmit}
                                    InputRightElement={
                                        <Button
                                            onPress={canSendOtp ? sendOtp : null}
                                            isLoading={isSendingOtp}
                                            isLoadingText={canSendOtp ? '' : `${countDown}s`}
                                            disabled={!canSendOtp}
                                            size="sm"
                                            rounded="none"
                                            w="1/4"
                                            h="full">
                                            Gửi mã
                                        </Button>
                                    }
                                />
                                {'otp' in errors ? (
                                    <FormControl.ErrorMessage color={'red.600'} leftIcon={<MaterialIcons name="warning" color="red" size={16} />}>
                                        {errors.otp}
                                    </FormControl.ErrorMessage>
                                ) : null}
                                <HStack space={4}>
                                    <Button onPress={() => handleBackToEmail(1)} variant="outline" mt="5" colorScheme="dark">
                                        Quay lại
                                    </Button>
                                    <Button onPress={handleOTPSubmit} mt="5" isLoading={isLoading}>
                                        Xác thực
                                    </Button>
                                </HStack>
                            </FormControl>
                        </Animated.View>

                        <Animated.View
                            style={{ width: "100%", position: "absolute", bottom: 0, transform: [{ translateX: positionSetPassword }] }}>
                            <Text color={"white"} fontSize="sm" textAlign={"center"} marginBottom={"3"}>Đặt mật khẩu cho {formData.email}</Text>
                            <FormControl isRequired isInvalid={'password' in errors} alignItems={"center"}>
                                <VStack space={2}>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        variant="filled"
                                        isDisabled={isLoading}
                                        bg="white"
                                        isFocused={step === 2}
                                        _focus={{ backgroundColor: 'white', borderColor: 'white' }}
                                        fontSize="sm"
                                        width={'80%'}
                                        textAlign={"left"}
                                        placeholder="Nhập mật khẩu "
                                        onChangeText={(value) => setFormData({ ...formData, password: value })}
                                        InputRightElement={
                                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                                <Icon as={<MaterialIcons name={showPassword ? "visibility" : "visibility-off"} />} size={5} mr="2" color="muted.400" />
                                            </Pressable>
                                        }
                                    />
                                    <Input
                                        type={showRePassword ? "text" : "password"}
                                        variant="filled"
                                        isDisabled={isLoading}
                                        bg="white"
                                        _focus={{ backgroundColor: 'white', borderColor: 'white' }}
                                        fontSize="sm"
                                        width={'80%'}
                                        textAlign={"left"}
                                        placeholder="Nhập lại mật khẩu"
                                        onChangeText={(value) => setRePassword(value)}
                                        InputRightElement={
                                            <Pressable onPress={() => setShowRePassword(!showRePassword)}>
                                                <Icon as={<MaterialIcons name={showRePassword ? "visibility" : "visibility-off"} />} size={5} mr="2" color="muted.400" />
                                            </Pressable>
                                        }
                                    />
                                    {'password' in errors ? (
                                        <FormControl.ErrorMessage color={'red.600'} leftIcon={<MaterialIcons name="warning" color="red" size={16} />}>
                                            {errors.password}
                                        </FormControl.ErrorMessage>
                                    ) : null}
                                </VStack>
                                <HStack space={4}>
                                    <Button onPress={() => handleBackToEmail(2)} variant="outline" mt="5" colorScheme="dark">
                                        Quay lại
                                    </Button>
                                    <Button onPress={handleSetPasswordSubmit} mt="5" isLoading={isLoading}>
                                        Tiếp tục
                                    </Button>
                                </HStack>
                            </FormControl>
                        </Animated.View>

                        <Animated.View
                            style={{ width: "100%", position: "absolute", bottom: 0, transform: [{ translateX: positionPassword }] }}>
                            <Text color={"white"} fontSize="sm" textAlign={"center"} marginBottom={"3"}>Nhập mật khẩu của {formData.email}</Text>
                            <FormControl isRequired isInvalid={'password' in errors} alignItems={"center"}>
                                <VStack space={2}>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        variant="filled"
                                        isDisabled={isLoading}
                                        bg="white"
                                        isFocused={step === 3}
                                        _focus={{ backgroundColor: 'white', borderColor: 'white' }}
                                        fontSize="sm"
                                        width={'80%'}
                                        textAlign={"left"}
                                        placeholder="Nhập mật khẩu "
                                        onChangeText={(value) => {
                                            setFormData({ ...formData, password: value })
                                        }}
                                        onSubmitEditing={handlePasswordSubmit}
                                        InputRightElement={
                                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                                <Icon as={<MaterialIcons name={showPassword ? "visibility" : "visibility-off"} />} size={5} mr="2" color="muted.400" />
                                            </Pressable>
                                        }
                                    />
                                    {'password' in errors ? (
                                        <FormControl.ErrorMessage color={'red.600'} leftIcon={<MaterialIcons name="warning" color="red" size={16} />}>
                                            {errors.password}
                                        </FormControl.ErrorMessage>
                                    ) : null}
                                </VStack>
                                <HStack space={4}>
                                    <Button onPress={() => handleBackToEmail(3)} variant="outline" mt="5" colorScheme="dark">
                                        Quay lại
                                    </Button>
                                    <Button onPress={handlePasswordSubmit} mt="5" isLoading={isLoading} isLoadingText='Đăng nhập'>
                                        Đăng nhập
                                    </Button>
                                </HStack>
                            </FormControl>
                        </Animated.View>
                    </VStack>
                </Box>
            </KeyboardAvoidingView>
        </Stack >
    );
};

const styles = StyleSheet.create({
    textContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
});

export default IntroPage;