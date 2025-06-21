import React from 'react';
import { Pressable, Box, Text, HStack, VStack } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../constants';
import { FineRecord } from '../../types';
import { FineRecordStatus } from '../../types/enums';

type HistoryNavProp = StackNavigationProp<RootStackParamList, 'HistoryFineRecord'>;

interface FineRecordCardProps {
    record: FineRecord;
}

const getStatusColor = (status: FineRecordStatus) => {
    switch (status) {
        case FineRecordStatus.UNPAID: return 'orange.500';
        case FineRecordStatus.PAID: return 'green.500';
        default: return 'gray.500';
    }
};

const getStatusText = (status: FineRecordStatus) => {
    switch (status) {
        case FineRecordStatus.UNPAID: return 'Chưa thanh toán';
        case FineRecordStatus.PAID: return 'Đã thanh toán';
        default: return 'Không xác định';
    }
};

const FineRecordCard: React.FC<FineRecordCardProps> = ({ record }) => {
    const navigation = useNavigation<HistoryNavProp>();

    return (
        <Pressable
            m={2}
            onPress={() => navigation.navigate('FineRecordDetail', { borrowRecordId: record.borrowRecordId })}
        >
            {({ isPressed }) => (
                <Box
                    p={3}
                    borderRadius="md"
                    bg={isPressed ? 'coolGray.200' : 'coolGray.100'}
                    shadow={2}
                    style={{ transform: [{ scale: isPressed ? 0.98 : 1 }] }}
                >
                    <HStack justifyContent="space-between" alignItems="center">
                        <VStack flex={1} space={1}>
                            <Text fontSize="md" fontWeight="bold" isTruncated>
                                ID Phiếu mượn: {record.borrowRecordId}
                            </Text>
                            <Text fontSize="sm" color="gray.600" fontWeight="bold">
                                Số tiền phạt: {record.amount.toLocaleString('vi-VN')} VNĐ
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                                Ngày tạo: {new Date(record.createdAt).toLocaleDateString()}
                            </Text>
                        </VStack>
                        <Box
                            bg={getStatusColor(record.status)}
                            px={3}
                            py={1}
                            borderRadius="full"
                            alignSelf="flex-start"
                        >
                            <Text color="white" fontSize="xs" fontWeight="bold">
                                {getStatusText(record.status)}
                            </Text>
                        </Box>
                    </HStack>
                </Box>
            )}
        </Pressable>
    );
};

export default FineRecordCard; 