import React, { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Box, VStack, Select, Button, useToast } from 'native-base';
import BackButton from '../components/BackButton';
import FormField from '../components/form/FormField';
import ImagePicker from '../components/form/ImagePicker';
import CustomAlertDialog from '../components/AlertDialog';
import { useFeedbackForm, FeedbackPurpose } from '../hooks/useFeedbackForm';

const purposeOptions = [
    { label: 'Yêu cầu sách mới', value: 'REQUEST_NEW_BOOKS' },
    { label: 'Báo cáo sự cố cơ sở vật chất', value: 'REPORT_FACILITY_ISSUES' },
    { label: 'Đề xuất cải tiến dịch vụ', value: 'SUGGEST_SERVICE_IMPROVEMENTS' },
    { label: 'Phản hồi về không gian học tập', value: 'FEEDBACK_STUDY_SPACE' },
    { label: 'Phản hồi về nhân viên', value: 'FEEDBACK_STAFF' },
    { label: 'Phản hồi về hệ thống quản lý', value: 'FEEDBACK_MANAGEMENT_SYSTEM' },
];

export default function FeedbackPage() {
    const [purpose, setPurpose] = useState<FeedbackPurpose>('');
    const toast = useToast();
    const {
        formState,
        setFormState,
        errors,
        imageUri,
        setImageUri,
        isSubmitting,
        handleSubmit,
        resetForm
    } = useFeedbackForm();

    const handleFormSubmit = async () => {
        if (!purpose) {
            toast.show({ description: "Vui lòng chọn một mục đích phản hồi." });
            return;
        }
        const { success, error } = await handleSubmit(purpose);
        if (success) {
            toast.show({ description: "Gửi phản hồi thành công!", placement: "top" });
            setPurpose(''); // Reset purpose dropdown
        } else if (error) {
            toast.show({ description: error, placement: "top" });
        }
    };

    const handlePurposeChange = (value: FeedbackPurpose) => {
        resetForm(value); // Reset form when purpose changes
        setPurpose(value);
    }
    
    const handleFieldChange = (field: string) => (value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const renderFormFields = () => {
        switch (purpose) {
            case 'REQUEST_NEW_BOOKS':
                return (
                    <VStack space={2}>
                        <FormField label="Tên sách" placeholder="Tên sách" value={formState.bookTitle} onChangeText={handleFieldChange('bookTitle')} isInvalid={'bookTitle' in errors} error={errors.bookTitle} isRequired />
                        <FormField label="Tác giả" placeholder="Tác giả" value={formState.author} onChangeText={handleFieldChange('author')} isInvalid={'author' in errors} error={errors.author} isRequired />
                        <FormField label="Nhà xuất bản" placeholder="Không bắt buộc" value={formState.publisher} onChangeText={handleFieldChange('publisher')} isInvalid={'publisher' in errors} error={errors.publisher} />
                        <FormField label="Lý do đề xuất" placeholder="Lý do bạn muốn thư viện nhập sách này" value={formState.reasonForBook} onChangeText={handleFieldChange('reasonForBook')} isInvalid={'reasonForBook' in errors} error={errors.reasonForBook} isRequired isTextArea />
                        </VStack>
                );
            case 'REPORT_FACILITY_ISSUES':
                return (
                    <VStack space={2}>
                        <FormField label="Tên thiết bị / Khu vực" placeholder="e.g., Máy tính số 5, điều hòa tầng 3" value={formState.deviceName} onChangeText={handleFieldChange('deviceName')} isInvalid={'deviceName' in errors} error={errors.deviceName} isRequired />
                        <FormField label="Vị trí cụ thể" placeholder="e.g., Dãy B, gần cửa sổ" value={formState.location} onChangeText={handleFieldChange('location')} isInvalid={'location' in errors} error={errors.location} isRequired />
                        <FormField label="Mô tả sự cố" placeholder="Mô tả chi tiết vấn đề bạn gặp phải" value={formState.issueDescription} onChangeText={handleFieldChange('issueDescription')} isInvalid={'issueDescription' in errors} error={errors.issueDescription} isRequired isTextArea />
                        <ImagePicker imageUri={imageUri} setImageUri={setImageUri} />
                        </VStack>
                );
            // Add other cases here based on purposeOptions
            default:
                return null;
        }
    };

    return (
        <Box flex={1} bg="white">
            <BackButton title="Góp ý & Phản hồi" />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    <VStack space={4} p={4}>
                <Select
                            selectedValue={purpose}
                            placeholder="Chọn mục đích phản hồi của bạn"
                            onValueChange={handlePurposeChange}
                        >
                            {purposeOptions.map(opt => <Select.Item key={opt.value} label={opt.label} value={opt.value} />)}
                </Select>

                        {purpose ? renderFormFields() : null}
                        
                        {purpose && (
                             <Button
                                mt={4}
                                onPress={handleFormSubmit}
                                isLoading={isSubmitting}
                                isLoadingText="Đang gửi..."
                            >
                                Gửi phản hồi
                            </Button>
                        )}
                    </VStack>
                </ScrollView>
            </KeyboardAvoidingView>
        </Box>
    );
}

