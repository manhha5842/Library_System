import React from 'react';
import { Pressable, Box, Text, HStack, VStack } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../constants';
import { BorrowRecord } from '../../types';
import { BorrowRecordStatus } from '../../types/enums';

type HistoryNavProp = StackNavigationProp<RootStackParamList>;

interface BorrowRecordCardProps {
    record: BorrowRecord;
}

const getStatusColor = (status: BorrowRecordStatus) => {
    switch (status) {
        case BorrowRecordStatus.PENDING: return 'orange.500';
        case BorrowRecordStatus.APPROVED: return 'green.500';
        case BorrowRecordStatus.REJECTED: return 'red.500';
        case BorrowRecordStatus.BORROWED: return 'blue.500';
        case BorrowRecordStatus.RETURNED: return 'gray.500';
        case BorrowRecordStatus.OVERDUE: return 'rose.600';
        case BorrowRecordStatus.CANCELLED: return 'coolGray.400';
        default: return 'gray.500';
    }
};

const getStatusText = (status: BorrowRecordStatus) => {
    switch (status) {
        case BorrowRecordStatus.PENDING: return 'Chờ duyệt';
        case BorrowRecordStatus.APPROVED: return 'Đã duyệt';
        case BorrowRecordStatus.REJECTED: return 'Bị từ chối';
        case BorrowRecordStatus.BORROWED: return 'Đang mượn';
        case BorrowRecordStatus.RETURNED: return 'Đã trả';
        case BorrowRecordStatus.OVERDUE: return 'Quá hạn';
        case BorrowRecordStatus.CANCELLED: return 'Đã hủy';
        default: return 'Không xác định';
    }
};

const BorrowRecordCard: React.FC<BorrowRecordCardProps> = ({ record }) => {
    const navigation = useNavigation<HistoryNavProp>();

    return (
        <Pressable
            m={2}
            onPress={() => navigation.navigate('BorrowRecordDetailPage', { borrowRecordId: record.id })}
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
                                ID: {record.id}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                                Ngày mượn: {new Date(record.borrowDate).toLocaleDateString()}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                                Hạn trả: {new Date(record.dueDate).toLocaleDateString()}
                            </Text>
                        </VStack>
                        <Box
                            bg={getStatusColor(record.status as BorrowRecordStatus)}
                            px={3}
                            py={1}
                            borderRadius="full"
                            alignSelf="flex-start"
                        >
                            <Text color="white" fontSize="xs" fontWeight="bold">
                                {getStatusText(record.status as BorrowRecordStatus)}
                            </Text>
                        </Box>
                    </HStack>
                </Box>
            )}
        </Pressable>
    );
};

export default BorrowRecordCard; 