import React from 'react';
import { Pressable, Box, Text, HStack, VStack } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../constants';
import { Feedback } from '../../types';
import { FeedbackStatus } from '../../types/enums';

type HistoryNavProp = StackNavigationProp<RootStackParamList, 'HistoryFeedback'>;

interface FeedbackCardProps {
    record: Feedback;
}

const getStatusColor = (status: FeedbackStatus) => {
    switch (status) {
        case FeedbackStatus.NEW: return 'blue.500';
        case FeedbackStatus.SEEN: return 'orange.500';
        case FeedbackStatus.RESOLVED: return 'green.500';
        default: return 'gray.500';
    }
};

const getStatusText = (status: FeedbackStatus) => {
    switch (status) {
        case FeedbackStatus.NEW: return 'Mới';
        case FeedbackStatus.SEEN: return 'Đã xem';
        case FeedbackStatus.RESOLVED: return 'Đã giải quyết';
        default: return 'Không xác định';
    }
};

const FeedbackCard: React.FC<FeedbackCardProps> = ({ record }) => {
    const navigation = useNavigation<HistoryNavProp>();

    return (
        <Pressable
            m={2}
            onPress={() => navigation.navigate('FeedbackDetail' as never, { feedbackId: record.id } as never)}
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
                                {record.purpose}
                            </Text>
                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                {record.content}
                            </Text>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                Gửi lúc: {new Date(record.createdAt).toLocaleString()}
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

export default FeedbackCard; 