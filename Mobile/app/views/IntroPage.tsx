import { Animated, StyleSheet, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Box, Input, Text, VStack, Heading, Button, Image, FormControl, Icon, Pressable, KeyboardAvoidingView, Stack, HStack, } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import api from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { useRef, useState } from 'react';
import { ExpoPushToken } from '../components/ExpoToken';
import { User } from '../types';
import * as Yup from 'yup';

const screenWidth = Dimensions.get('window').width;
const OFFLINE_EMAIL = 'abc@xyz.com';
const OFFLINE_PASSWORD = '123456';
const OFFLINE_USER: User = {
    id: 'SV001',
    name: 'Nguyễn Văn Mock',
    email: OFFLINE_EMAIL,
    token: 'mock-jwt-token-for-testing',
};

const IntroPage = () => {
    const navigation = useNavigation();
    const { login } = useUser();

    const [formData, setFormData] = useState({ email: '', otp: '', password: '' });
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
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
            useNativeDriver: true,
        }).start();
    };

    const moveToRight = (position: Animated.Value) => {
        Animated.timing(position, {
            toValue: screenWidth,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    const moveToCenter = (position: Animated.Value) => {
        Animated.timing(position, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    const emailSchema = Yup.string()
        .required('Vui lòng nhập email')
        .email('Email không đúng')
        // .test('student', 'Vui lòng sử dụng email sinh viên.', (value) => !!value && value.endsWith('hcmuaf.edu.vn'));

    const passwordSchema = Yup.string().required('Vui lòng nhập mật khẩu');

    const validateEmail = async () => {
        try {
            await emailSchema.validate(formData.email);
            setErrors((prev) => ({ ...prev, email: undefined }));
            return true;
        } catch (err: any) {
            setErrors((prev) => ({ ...prev, email: err.message }));
            return false;
        }
    };

    const validatePassword = async () => {
        try {
            await passwordSchema.validate(formData.password);
            setErrors((prev) => ({ ...prev, password: undefined }));
            return true;
        } catch (err: any) {
            setErrors((prev) => ({ ...prev, password: err.message }));
            return false;
        }
    };

    const handleEmailSubmit = async () => {
        setIsLoading(true);
        if (await validateEmail()) {
            // This demo skips OTP verification and goes straight to password step
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

    const handleSetPasswordSubmit = async () => {
        if (await validatePassword()) {
            // TODO: call API to set a new password
        }
    };

    const handlePasswordSubmit = async () => {
        setIsLoading(true);
        if (await validatePassword()) {
            try {
                const response = await api.post(`/api/public/login`, {
                    email: formData.email,
                    password: formData.password,
                });
                if (response.status === 200 && response.data.user) {
                    setErrors({});
                    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

                    const expoPushToken = await ExpoPushToken();
                    if (expoPushToken) {
                        await api.put(`/api/public/expoPushToken/${response.data.user.id}`, {
                            expoPushToken,
                        });
                    }

                    await login(response.data.user);
                    navigation.navigate('HomeTabs' as never);
                } else {
                    setErrors((prev) => ({ ...prev, password: 'Mật khẩu không đúng!' }));
                }
            } catch (error) {
                if (formData.email === OFFLINE_EMAIL && formData.password === OFFLINE_PASSWORD) {
                    await AsyncStorage.setItem('user', JSON.stringify(OFFLINE_USER));
                    await login(OFFLINE_USER);
                    navigation.navigate('HomeTabs' as never);
                } else {
                    setErrors((prev) => ({ ...prev, password: 'Thông tin tài khoản không đúng!' }));
                    console.log('There was an error!', error);
                }
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
        // Simulate OTP request
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
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} flex={1}>
                <Box flex={1} alignItems="center">
                    <Image
                        alt="Background Image"
                        resizeMode="cover"
                        size="100%"
                        position="absolute"
                        top="0"
                        left="0"
                        source={require('../assets/LibraryIntro.jpg')}
                    />
                    <Box bg="rgba(0, 0, 0, 0.25)" size="100%" position="absolute" top="0" left="0" />
                    <VStack style={styles.textContainer} position="absolute" width="100%" bottom="72">
                        <Heading color="white" fontSize="3xl" textAlign="center">
                            SỐNG CÙNG TRI THỨC
                        </Heading>
                        <Text color="white" fontSize="sm" textAlign="center">
                            Khám phá không gian kiến thức tại Thư viện Đại học
                        </Text>
                    </VStack>
                    <VStack position="absolute" width="100%" bottom="5%" alignItems="center">
                        <Animated.View style={{ width: '100%', position: 'absolute', bottom: 0, transform: [{ translateX: positionEmail }] }}>
                            <Text color="white" fontSize="sm" textAlign="center" marginBottom="3">
                                Bắt đầu ngay với tài khoản sinh viên của bạn!
                            </Text>
                            <FormControl isRequired isInvalid={'email' in errors} alignItems="center">
                                <Input
                                    variant="filled"
                                    isDisabled={isLoading}
                                    bg="white"
                                    isFocused={step === 0}
                                    _focus={{ backgroundColor: 'white', borderColor: 'white' }}
                                    fontSize="sm"
                                    width="80%"
                                    textAlign="left"
                                    placeholder="Nhập email của bạn"
                                    keyboardType="email-address"
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

                        <Animated.View style={{ width: '100%', position: 'absolute', bottom: 0, transform: [{ translateX: positionOTP }] }}>
                            <Text color="white" fontSize="sm" textAlign="center">
                                Nhập mã OTP được gửi về
                            </Text>
                            <Text color="white" fontSize="sm" textAlign="center" mb="3">
                                {formData.email}
                            </Text>
                            <FormControl isRequired isInvalid={'otp' in errors} alignItems="center">
                                <Input
                                    variant="filled"
                                    bg="white"
                                    isDisabled={isLoading}
                                    isFocused={step === 1}
                                    _focus={{ backgroundColor: 'white', borderColor: 'white' }}
                                    fontSize="sm"
                                    width="80%"
                                    textAlign="left"
                                    placeholder="Nhập mã OTP"
                                    keyboardType="number-pad"
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
                                            h="full"
                                        >
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

                        <Animated.View style={{ width: '100%', position: 'absolute', bottom: 0, transform: [{ translateX: positionSetPassword }] }}>
                            <Text color="white" fontSize="sm" textAlign="center" marginBottom="3">
                                Đặt mật khẩu cho {formData.email}
                            </Text>
                            <FormControl isRequired isInvalid={'password' in errors} alignItems="center">
                                <VStack space={2}>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        variant="filled"
                                        isDisabled={isLoading}
                                        bg="white"
                                        isFocused={step === 2}
                                        _focus={{ backgroundColor: 'white', borderColor: 'white' }}
                                        fontSize="sm"
                                        width="80%"
                                        textAlign="left"
                                        placeholder="Nhập mật khẩu "
                                        onChangeText={(value) => setFormData({ ...formData, password: value })}
                                        InputRightElement={
                                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                                <Icon as={<MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} />} size={5} mr="2" color="muted.400" />
                                            </Pressable>
                                        }
                                    />
                                    <Input
                                        type={showRePassword ? 'text' : 'password'}
                                        variant="filled"
                                        isDisabled={isLoading}
                                        bg="white"
                                        _focus={{ backgroundColor: 'white', borderColor: 'white' }}
                                        fontSize="sm"
                                        width="80%"
                                        textAlign="left"
                                        placeholder="Nhập lại mật khẩu"
                                        onChangeText={(value) => setRePassword(value)}
                                        InputRightElement={
                                            <Pressable onPress={() => setShowRePassword(!showRePassword)}>
                                                <Icon as={<MaterialIcons name={showRePassword ? 'visibility' : 'visibility-off'} />} size={5} mr="2" color="muted.400" />
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

                        <Animated.View style={{ width: '100%', position: 'absolute', bottom: 0, transform: [{ translateX: positionPassword }] }}>
                            <Text color="white" fontSize="sm" textAlign="center" marginBottom="3">
                                Nhập mật khẩu của {formData.email}
                            </Text>
                            <FormControl isRequired isInvalid={'password' in errors} alignItems="center">
                                <VStack space={2}>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        variant="filled"
                                        isDisabled={isLoading}
                                        bg="white"
                                        isFocused={step === 3}
                                        _focus={{ backgroundColor: 'white', borderColor: 'white' }}
                                        fontSize="sm"
                                        width="80%"
                                        textAlign="left"
                                        placeholder="Nhập mật khẩu "
                                        onChangeText={(value) => {
                                            setFormData({ ...formData, password: value });
                                        }}
                                        onSubmitEditing={handlePasswordSubmit}
                                        InputRightElement={
                                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                                <Icon as={<MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} />} size={5} mr="2" color="muted.400" />
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
                                    <Button onPress={handlePasswordSubmit} mt="5" isLoading={isLoading} isLoadingText="Đăng nhập">
                                        Đăng nhập
                                    </Button>
                                </HStack>
                            </FormControl>
                        </Animated.View>
                    </VStack>
                </Box>
            </KeyboardAvoidingView>
        </Stack>
    );
};

const styles = StyleSheet.create({
    textContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
});

export default IntroPage;