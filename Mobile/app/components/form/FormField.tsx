import React from 'react';
import { FormControl, Input, TextArea, WarningOutlineIcon } from 'native-base';

interface FormFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    error?: string;
    isInvalid: boolean;
    isRequired?: boolean;
    isTextArea?: boolean;
    lines?: number;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    isInvalid,
    isRequired = false,
    isTextArea = false,
    lines = 4,
}) => {
    const InputComponent = isTextArea ? TextArea : Input;

    return (
        <FormControl isInvalid={isInvalid} isRequired={isRequired}>
            <FormControl.Label>{label}</FormControl.Label>
            <InputComponent
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                autoCompleteType={undefined} // for TextArea
                h={isTextArea ? undefined : 'auto'} // for TextArea
                numberOfLines={isTextArea ? lines : undefined} // for TextArea
            />
            {isInvalid && error && (
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                    {error}
                </FormControl.ErrorMessage>
            )}
        </FormControl>
    );
};

export default FormField; 