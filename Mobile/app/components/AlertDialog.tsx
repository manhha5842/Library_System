import React, { useRef } from 'react';
import { AlertDialog, Button, HStack, Text } from 'native-base';

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: string;
    colorScheme?: string;
    isCancel?: boolean;
    isLoading?: boolean;
    isDisabled?: boolean;
}

interface CustomAlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    buttons: ButtonProps[];
}

const CustomAlertDialog: React.FC<CustomAlertDialogProps> = ({ isOpen, onClose, title, message, buttons }) => {
    const cancelRef = useRef(null);

    return (
        <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose} position={'absolute'}>
            <AlertDialog.Content>
                {title && (
                    <AlertDialog.Header>
                        <Text textAlign={'center'}>{title}</Text>
                    </AlertDialog.Header>
                )}
                <AlertDialog.Body>
                    <Text textAlign={'center'}>{message}</Text>
                </AlertDialog.Body>
                <AlertDialog.Footer justifyContent={'center'}>
                    <HStack space={3}>
                        {buttons.map((button, index) => (
                            <Button
                                key={index}
                                variant={button.variant || "subtle"}
                                colorScheme={button.colorScheme || "info"}
                                onPress={button.onPress}
                                isLoading={button.isLoading ? button.isLoading : false}
                                isDisabled={button.isDisabled ? button.isDisabled : false}
                                ref={button.isCancel ? cancelRef : undefined}
                            >
                                {button.label}
                            </Button>
                        ))}
                    </HStack>

                </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog>
    );
};

export default CustomAlertDialog;