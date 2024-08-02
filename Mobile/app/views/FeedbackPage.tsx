import React, { useState, createContext, useRef, useEffect, useCallback } from 'react';
import { Animated, StyleSheet, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, Keyboard, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation } from "@react-navigation/native";

import { CategoryProvider, useCategories } from '../context/CategoryContext';
import { Box, Container, Text, HStack, VStack, Heading, Button, Image, Badge, WarningOutlineIcon, Icon, Pressable, ZStack, Center, Input, Radio, Stack, SectionList, Divider, Select, FormControl, Alert, TextArea } from "native-base"
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../constants';
import * as ImagePicker from 'expo-image-picker';
import CustomAlertDialog from '../components/AlertDialog';
type FeedbackNavigationProp = StackNavigationProp<
    RootStackParamList,
    'FeedbackPage'
>;

export default function FeedbackPage() {
    const navigation = useNavigation<FeedbackNavigationProp>();
    const [purpose, setPurpose] = useState<string>('');
    const [proposedSolution, setProposedSolution] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [reason, setReason] = useState<string>('');

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [bookTitle, setBookTitle] = useState<string>('');
    const [author, setAuthor] = useState<string>('');
    const [publisher, setPublisher] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    const [deviceName, setDeviceName] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [issueDescription, setIssueDescription] = useState<string>('');

    const [serviceName, setServiceName] = useState<string>('');
    const [serviceDescription, setServiceDescription] = useState<string>('');
    const [serviceReason, setServiceReason] = useState<string>('');

    const [studySpaceFeedback, setStudySpaceFeedback] = useState<string>('');
    const [staffFeedback, setStaffFeedback] = useState<string>('');
    const [managementSystemFeedback, setManagementSystemFeedback] = useState<string>('');

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (purpose === 'REQUEST_NEW_BOOKS') {
            if (!bookTitle) newErrors.bookTitle = "Tên sách là bắt buộc";
            if (!author) newErrors.author = "Tác giả là bắt buộc";
            if (!reason) newErrors.reason = "Lý do là bắt buộc";
        } else if (purpose === 'REPORT_FACILITY_ISSUES') {
            if (!deviceName) newErrors.deviceName = "Tên thiết bị là bắt buộc";
            if (!location) newErrors.location = "Vị trí là bắt buộc";
            if (!issueDescription) newErrors.issueDescription = "Mô tả sự cố là bắt buộc";
        } else if (purpose === 'SUGGEST_SERVICE_IMPROVEMENTS') {
            if (!serviceName) newErrors.serviceName = "Tên dịch vụ là bắt buộc";
            if (!serviceDescription) newErrors.serviceDescription = "Mô tả chi tiết là bắt buộc";
            if (!serviceReason) newErrors.serviceReason = "Lý do đề xuất là bắt buộc";
        } else if (purpose === 'FEEDBACK_STUDY_SPACE') {
            if (!studySpaceFeedback) newErrors.studySpaceFeedback = "Phản hồi về không gian học tập là bắt buộc";
        } else if (purpose === 'FEEDBACK_STAFF') {
            if (!staffFeedback) newErrors.staffFeedback = "Phản hồi về nhân viên thư viện là bắt buộc";
        } else if (purpose === 'FEEDBACK_MANAGEMENT_SYSTEM') {
            if (!managementSystemFeedback) newErrors.managementSystemFeedback = "Phản hồi về hệ thống thư viện là bắt buộc";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validate()) {
            let message: string;
            if (purpose === 'REQUEST_NEW_BOOKS') {
                message = `Yêu cầu nhập sách ${bookTitle} của ${author}`;
                if (publisher) message += `, xuất bản bởi ${publisher}`;
                if (description) message += `\nMô tả khai quát: ${description}`;
                setContent(message);
                message += `\nLý do: ${reason}`;
                console.log("Gửi yêu cầu:", message);
            } else if (purpose === 'REPORT_FACILITY_ISSUES') {
                message = `Báo cáo cơ sở vật chất bị hỏng: ${deviceName}`;
                message += `\nVị trí: ${location}`;
                message += `\nMô tả sự cố: ${issueDescription}`;
                setContent(message);
                if (imageUri) message += `\nẢnh: ${imageUri}`;
                console.log("Gửi yêu cầu:", message);
            } else if (purpose === 'SUGGEST_SERVICE_IMPROVEMENTS') {
                message = `Đề xuất cải tiến dịch vụ: ${serviceName}`;
                message += `\nMô tả chi tiết: ${serviceDescription}`;
                setContent(message);
                message += `\nLý do đề xuất: ${serviceReason}`;
                setReason(serviceReason);
                console.log("Gửi yêu cầu:", message);
            } else if (purpose === 'FEEDBACK_STUDY_SPACE') {
                message = `Phản hồi về không gian học tập: ${studySpaceFeedback}`;
                console.log("Gửi yêu cầu:", message);
                setContent(message);
            } else if (purpose === 'FEEDBACK_STAFF') {
                message = `Phản hồi về nhân viên thư viện: ${staffFeedback}`;
                console.log("Gửi yêu cầu:", message);
                setContent(message);
            } else if (purpose === 'FEEDBACK_MANAGEMENT_SYSTEM') {
                message = `Phản hồi về hệ thống thư viện: ${managementSystemFeedback}`;
                console.log("Gửi yêu cầu:", message);
                setContent(message);
            }

            setIsOpen(true);
        }
    };
    const handleSendFeedback = async () => {
        setIsPending(true);
        try {
            const formData = new FormData();
            formData.append('purpose', purpose);
            formData.append('content', content);
            formData.append('reason', reason);
            formData.append('proposedSolution', proposedSolution);

            if (imageUri) {
                const response = await fetch(imageUri);
                const blob = await response.blob();
                const fileExtension = imageUri.split('.').pop();
                const fileName = `image_${Date.now()}.${fileExtension}`;
                formData.append('image', {
                    uri: imageUri,
                    name: fileName,
                    type: blob.type,
                } as any);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            console.log('Axios Config:', config);
            console.log('FormData:', formData);

            const response = await axios.post(`${apiConfig.baseURL}/api/feedbacks`, formData, config);
            if (response.status === 200) {
                setIsSuccess(true);
                setPurpose('');
                setProposedSolution('');
                setContent('');
                setReason('');
                setBookTitle('');
                setAuthor('');
                setPublisher('');
                setDescription('');
                setDeviceName('');
                setLocation('');
                setImageUri(null);
                setIssueDescription('');
                setServiceName('');
                setServiceDescription('');
                setServiceReason('');
                setStudySpaceFeedback('');
                setStaffFeedback('');
                setManagementSystemFeedback('');
            } else {
                setIsError(true);
                console.log('Error send feedback');
            }
        } catch (error) {
            setIsError(true);
            console.log('Error send feedback:', error);
        }
        setIsPending(false);
    };
    const handleImagePicker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert('Xin vui lòng cấp quyền truy cập thư viện ảnh!');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert('Xin vui lòng cấp quyền truy cập camera!');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };
    const renderBox = () => {
        switch (purpose) {
            case 'REQUEST_NEW_BOOKS':
                {
                    return (
                        <ScrollView >
                            <VStack px={4} pb={40}  >
                                <FormControl isInvalid={'bookTitle' in errors} >
                                    <FormControl.Label>Tên sách</FormControl.Label>
                                    <Input
                                        placeholder="Tên sách *"
                                        value={bookTitle}
                                        onChangeText={setBookTitle}
                                    />
                                    {'bookTitle' in errors ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                        {errors.bookTitle}
                                    </FormControl.ErrorMessage> : null}
                                </FormControl>
                                <FormControl isInvalid={'author' in errors} mt={2}>
                                    <FormControl.Label>Tác giả *</FormControl.Label>
                                    <Input
                                        placeholder="Tác giả"
                                        value={author}
                                        onChangeText={setAuthor}
                                    />
                                    {'author' in errors ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                        {errors.author}
                                    </FormControl.ErrorMessage> : null}
                                </FormControl>
                                <FormControl mt={2}>
                                    <FormControl.Label>Nhà xuất bản</FormControl.Label>
                                    <Input
                                        placeholder="Nhà xuất bản"
                                        value={publisher}
                                        onChangeText={setPublisher}
                                    />
                                </FormControl>
                                <FormControl mt={2}>
                                    <FormControl.Label>Mô tả ngắn gọn</FormControl.Label>
                                    <Input
                                        placeholder="Mô tả ngắn gọn"
                                        value={description}
                                        onChangeText={setDescription}
                                    />
                                </FormControl>
                                <FormControl isInvalid={'reason' in errors} mt={2}>
                                    <FormControl.Label>Lý do yêu cầu *</FormControl.Label>
                                    <Input
                                        placeholder="Lý do yêu cầu"
                                        value={reason}
                                        onChangeText={setReason}
                                    />
                                    {'reason' in errors ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                        {errors.reason}
                                    </FormControl.ErrorMessage> : null}
                                </FormControl>
                                <Button mt={4} onPress={handleSubmit}>
                                    Gửi yêu cầu
                                </Button>
                            </VStack>
                        </ScrollView>
                    )
                };
            case 'REPORT_FACILITY_ISSUES':
                return (
                    <ScrollView >
                        <VStack px={4} pb={80}  >
                            <FormControl isInvalid={'deviceName' in errors} mt={2}>
                                <FormControl.Label>Tên thiết bị</FormControl.Label>
                                <Input
                                    placeholder="Tên thiết bị"
                                    value={deviceName}
                                    onChangeText={setDeviceName}
                                />
                                {'deviceName' in errors ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    {errors.deviceName}
                                </FormControl.ErrorMessage> : null}
                            </FormControl>
                            <FormControl isInvalid={'location' in errors} mt={2}>
                                <FormControl.Label>Vị trí</FormControl.Label>
                                <Input
                                    placeholder="Vị trí"
                                    value={location}
                                    onChangeText={setLocation}
                                />
                                {'location' in errors ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    {errors.location}
                                </FormControl.ErrorMessage> : null}
                            </FormControl>
                            <FormControl mt={2}>
                                <FormControl.Label>Ảnh chụp (tùy chọn)</FormControl.Label>
                                <HStack justifyContent={'space-between'}>
                                    <Button w={'45%'} onPress={handleImagePicker}>Chọn ảnh từ thư viện</Button>
                                    <Button w={'45%'} onPress={handleCamera}>Chụp ảnh</Button>
                                </HStack>
                                {imageUri && (
                                    <Box mt={2}>
                                        <Image source={{ uri: imageUri }} alt="Selected Image" size="xl" />
                                    </Box>
                                )}
                            </FormControl>
                            <FormControl isInvalid={'issueDescription' in errors} mt={2}>
                                <FormControl.Label>Mô tả sự cố</FormControl.Label>
                                <Input
                                    placeholder="Mô tả sự cố"
                                    value={issueDescription}
                                    onChangeText={setIssueDescription}
                                />
                                {'issueDescription' in errors ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    {errors.issueDescription}
                                </FormControl.ErrorMessage> : null}
                            </FormControl>
                            <Button mt={4} onPress={(handleSubmit)}>
                                Gửi yêu cầu
                            </Button>
                        </VStack>
                    </ScrollView>
                );
            case 'SUGGEST_SERVICE_IMPROVEMENTS':
                return (
                    <ScrollView >
                        <VStack px={4} pb={40}  >
                            <FormControl isInvalid={'serviceName' in errors} mt={2}>
                                <FormControl.Label>Tên dịch vụ</FormControl.Label>
                                <Input
                                    placeholder="Tên dịch vụ"
                                    value={serviceName}
                                    onChangeText={setServiceName}
                                />
                                {'serviceName' in errors ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    {errors.serviceName}
                                </FormControl.ErrorMessage> : null}
                            </FormControl>
                            <FormControl isInvalid={'serviceDescription' in errors} mt={2}>
                                <FormControl.Label>Mô tả chi tiết</FormControl.Label>
                                <Input
                                    placeholder="Mô tả chi tiết"
                                    value={serviceDescription}
                                    onChangeText={setServiceDescription}
                                />
                                {'serviceDescription' in errors ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    {errors.serviceDescription}
                                </FormControl.ErrorMessage> : null}
                            </FormControl>
                            <FormControl isInvalid={'serviceReason' in errors} mt={2}>
                                <FormControl.Label>Lý do đề xuất</FormControl.Label>
                                <Input
                                    placeholder="Lý do đề xuất"
                                    value={serviceReason}
                                    onChangeText={setServiceReason}
                                />
                                {'serviceReason' in errors ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    {errors.serviceReason}
                                </FormControl.ErrorMessage> : null}
                                <FormControl.Label>Đề xuất giải pháp</FormControl.Label>
                                <TextArea
                                    autoCompleteType="off"
                                    h={20}
                                    placeholder="Đề xuất giải pháp"
                                    value={proposedSolution}
                                    onChangeText={setProposedSolution}
                                />
                            </FormControl>
                            <Button mt={4} onPress={handleSubmit}>
                                Gửi yêu cầu
                            </Button>
                        </VStack>
                    </ScrollView>
                );
            case 'FEEDBACK_STUDY_SPACE':
                return (
                    <ScrollView >
                        <VStack px={4} pb={40}  >
                            <FormControl isInvalid={'studySpaceFeedback' in errors} mt={2}>
                                <FormControl.Label>Phản hồi về không gian học tập</FormControl.Label>
                                <TextArea
                                    autoCompleteType="off"
                                    h={20}
                                    placeholder="Phản hồi về không gian học tập"
                                    value={studySpaceFeedback}
                                    onChangeText={setStudySpaceFeedback}
                                />
                                {'studySpaceFeedback' in errors ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    {errors.studySpaceFeedback}
                                </FormControl.ErrorMessage> : null}
                                <FormControl.Label>Đề xuất giải pháp</FormControl.Label>
                                <TextArea
                                    autoCompleteType="off"
                                    h={20}
                                    placeholder="Đề xuất giải pháp"
                                    value={proposedSolution}
                                    onChangeText={setProposedSolution}
                                />

                            </FormControl>
                            <Button mt={4} onPress={handleSubmit}>
                                Gửi yêu cầu
                            </Button>
                        </VStack>
                    </ScrollView>
                );
            case 'FEEDBACK_STAFF':
                return (
                    <ScrollView >
                        <VStack px={4} pb={40}  >
                            <FormControl isInvalid={'staffFeedback' in errors} mt={2}>
                                <FormControl.Label>Phản hồi về nhân viên thư viện</FormControl.Label>
                                <TextArea
                                    autoCompleteType="off"
                                    h={20}
                                    placeholder="Phản hồi về nhân viên thư viện"
                                    value={staffFeedback}
                                    onChangeText={setStaffFeedback}
                                />
                                {'staffFeedback' in errors ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    {errors.staffFeedback}
                                </FormControl.ErrorMessage> : null}
                                <FormControl.Label>Đề xuất giải pháp</FormControl.Label>
                                <TextArea
                                    autoCompleteType="off"
                                    h={20}
                                    placeholder="Đề xuất giải pháp"
                                    value={proposedSolution}
                                    onChangeText={setProposedSolution}
                                />
                            </FormControl>
                            <Button mt={4} onPress={handleSubmit}>
                                Gửi yêu cầu
                            </Button>
                        </VStack>
                    </ScrollView>
                );
            case 'FEEDBACK_MANAGEMENT_SYSTEM':
                return (
                    <ScrollView >
                        <VStack px={4} pb={40}  >
                            <FormControl isInvalid={'managementSystemFeedback' in errors} mt={2}>
                                <FormControl.Label>Phản hồi về hệ thống thư viện</FormControl.Label>
                                <TextArea
                                    autoCompleteType="off"
                                    h={20}
                                    placeholder="Phản hồi về hệ thống thư viện"
                                    value={managementSystemFeedback}
                                    onChangeText={setManagementSystemFeedback}
                                />
                                {'managementSystemFeedback' in errors ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    {errors.managementSystemFeedback}
                                </FormControl.ErrorMessage> : null}
                                <FormControl.Label>Đề xuất giải pháp</FormControl.Label>
                                <TextArea
                                    autoCompleteType="off"
                                    h={20}
                                    placeholder="Đề xuất giải pháp"
                                    value={proposedSolution}
                                    onChangeText={setProposedSolution}
                                />

                            </FormControl>
                            <Button mt={4} onPress={handleSubmit}>
                                Gửi yêu cầu
                            </Button>
                        </VStack>
                    </ScrollView>
                );
            default:
                return (null);
        }
    };

    const [isOpen, setIsOpen] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const handleClose = () => { setIsOpen(false); setIsError(false); setIsPending(false); };

    return (
        <KeyboardAvoidingView >
            <CustomAlertDialog isOpen={isOpen} onClose={handleClose}
                title="Xác nhận gửi"
                message="Xác nhận gửi đơn đóng góp ý kiến?"
                buttons={[{
                    label: 'Huỷ bỏ',
                    onPress: handleClose,
                    colorScheme: 'info',
                    isDisabled: isPending,
                    isCancel: true
                }, {
                    label: 'Đồng ý',
                    onPress: handleSendFeedback,
                    isLoading: isPending,
                    colorScheme: 'success'
                },]}
            />
            <CustomAlertDialog isOpen={isError} onClose={handleClose}
                title="Có lỗi xảy ra"
                message="Có lỗi xảy ra, vui lòng thử lại sau."
                buttons={[{
                    label: 'Đồng ý',
                    onPress: handleClose,
                    colorScheme: 'info'
                }]}
            />
            <CustomAlertDialog isOpen={isSuccess} onClose={handleClose}
                title="Gửi thành công"
                message="Cám ơn bạn đã góp ý."
                buttons={[{
                    label: 'Đồng ý',
                    onPress: navigation.goBack,
                    colorScheme: 'success'
                }]}
            />
            <Center >
                <Heading fontSize={'3xl'} pb={5}>Đóng góp ý kiến</Heading>
                <Text fontSize={12} color={'light.400'}>Vui lòng chọn yêu cầu</Text>
                <Select
                    placeholder={'Chọn yêu cầu'} w="70%" placeholderTextColor={'primary.500'} px={5} variant='filled' accessibilityLabel="Chọn yêu cầu"
                    onValueChange={(key) => {
                        setPurpose(key);
                    }}
                >
                    <Select.Item key={1} label={"Yêu cầu nhập thêm sách"} value={'REQUEST_NEW_BOOKS'} />
                    <Select.Item key={2} label={"Báo cáo cơ sở vật chất bị hỏng"} value={'REPORT_FACILITY_ISSUES'} />
                    <Select.Item key={3} label={"Đề xuất cải tiến dịch vụ"} value={'SUGGEST_SERVICE_IMPROVEMENTS'} />
                    <Select.Item key={4} label={"Phản hồi về không gian học tập"} value={'FEEDBACK_STUDY_SPACE'} />
                    <Select.Item key={5} label={"Phản hồi về nhân viên thư viện"} value={'FEEDBACK_STAFF'} />
                    <Select.Item key={6} label={"Phản hồi về hệ thống thư viện"} value={'FEEDBACK_MANAGEMENT_SYSTEM'} />
                </Select>
            </Center>
            {renderBox()}
        </ KeyboardAvoidingView>
    );
}

