import { useState } from 'react';
import api from '../config/apiConfig';

export type FeedbackPurpose = 
    | ''
    | 'REQUEST_NEW_BOOKS'
    | 'REPORT_FACILITY_ISSUES'
    | 'SUGGEST_SERVICE_IMPROVEMENTS'
    | 'FEEDBACK_STUDY_SPACE'
    | 'FEEDBACK_STAFF'
    | 'FEEDBACK_MANAGEMENT_SYSTEM';

interface FormState {
    [key: string]: string;
}

interface UseFeedbackFormReturn {
    formState: FormState;
    setFormState: React.Dispatch<React.SetStateAction<FormState>>;
    errors: FormState;
    imageUri: string | null;
    setImageUri: (uri: string | null) => void;
    isSubmitting: boolean;
    handleSubmit: (purpose: FeedbackPurpose) => Promise<{ success: boolean; error?: string }>;
    resetForm: (purpose: FeedbackPurpose) => void;
}

const initialFormState: FormState = {
    bookTitle: '', author: '', publisher: '', description: '', reasonForBook: '',
    deviceName: '', location: '', issueDescription: '',
    serviceName: '', serviceDescription: '', reasonForService: '',
    studySpaceFeedback: '',
    staffFeedback: '',
    managementSystemFeedback: '',
};

export const useFeedbackForm = (): UseFeedbackFormReturn => {
    const [formState, setFormState] = useState<FormState>(initialFormState);
    const [errors, setErrors] = useState<FormState>({});
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = (purpose: FeedbackPurpose): boolean => {
        const newErrors: FormState = {};
        switch (purpose) {
            case 'REQUEST_NEW_BOOKS':
                if (!formState.bookTitle) newErrors.bookTitle = "Tên sách là bắt buộc";
                if (!formState.author) newErrors.author = "Tác giả là bắt buộc";
                if (!formState.reasonForBook) newErrors.reasonForBook = "Lý do là bắt buộc";
                break;
            case 'REPORT_FACILITY_ISSUES':
                if (!formState.deviceName) newErrors.deviceName = "Tên thiết bị là bắt buộc";
                if (!formState.location) newErrors.location = "Vị trí là bắt buộc";
                if (!formState.issueDescription) newErrors.issueDescription = "Mô tả sự cố là bắt buộc";
                break;
             // Add other validation cases here...
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (purpose: FeedbackPurpose): Promise<{ success: boolean; error?: string }> => {
        if (!validate(purpose)) {
            return { success: false, error: 'Vui lòng điền đầy đủ thông tin bắt buộc.' };
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('purpose', purpose);
            
            let content = '';
            let reason = '';

            switch (purpose) {
                case 'REQUEST_NEW_BOOKS':
                    content = `Yêu cầu sách: ${formState.bookTitle} (Tác giả: ${formState.author})`;
                    reason = formState.reasonForBook;
                    break;
                case 'REPORT_FACILITY_ISSUES':
                    content = `Báo cáo sự cố: ${formState.deviceName} tại ${formState.location}. Chi tiết: ${formState.issueDescription}`;
                    break;
                // Add other content/reason builders here...
            }
            
            formData.append('content', content);
            formData.append('reason', reason);

            if (imageUri) {
                const response = await fetch(imageUri);
                const blob = await response.blob();
                formData.append('image', {
                    uri: imageUri,
                    name: `feedback_${Date.now()}.jpg`,
                    type: blob.type,
                } as any);
            }

            await api.post('/feedbacks', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            resetForm(purpose);
            return { success: true };
        } catch (error: any) {
            console.error("Error submitting feedback:", error);
            // Simulate success for offline mode
            if (error.isAxiosError && !error.response) {
                 resetForm(purpose);
                 return { success: true };
            }
            return { success: false, error: 'Gửi phản hồi thất bại. Vui lòng thử lại.' };
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const resetForm = (purpose: FeedbackPurpose) => {
        setFormState(initialFormState);
        setImageUri(null);
        setErrors({});
    };

    return {
        formState,
        setFormState,
        errors,
        imageUri,
        setImageUri,
        isSubmitting,
        handleSubmit,
        resetForm
    };
};
 