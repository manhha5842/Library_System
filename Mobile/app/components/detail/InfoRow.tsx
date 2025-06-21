import React from 'react';
import { HStack, Text, ITextProps, Box } from 'native-base';

interface InfoRowProps {
    label: string;
    value: React.ReactNode;
    labelProps?: ITextProps;
    valueProps?: ITextProps;
}

const InfoRow: React.FC<InfoRowProps> = ({ 
    label, 
    value, 
    labelProps,
    valueProps
}) => {
    return (
        <HStack justifyContent="space-between" alignItems="flex-start" py={2} borderBottomWidth={1} borderColor="coolGray.100">
            <Text fontWeight="bold" flex={1} {...labelProps}>
                {label}
            </Text>
            {typeof value === 'string' ? (
                <Text flex={2} textAlign="right" {...valueProps}>
                    {value}
                </Text>
            ) : (
                <Box flex={2} alignItems="flex-end">
                    {value}
                </Box>
            )}
        </HStack>
    );
};

export default InfoRow; 