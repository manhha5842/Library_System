import React from 'react';
import { Pressable, Box, Text, HStack, VStack, Avatar } from 'native-base';
import { Notification } from '../../types';
import icons from '../../constants/icons';

interface NotificationCardProps {
    notification: Notification;
    onPress: () => void;
}

const getNotificationIcon = (type: string) => {
    // This is a placeholder. In a real app, you might have different icons
    // based on the notification type (e.g., 'borrow_approved', 'fine_issued').
    switch (type) {
        case 'SUCCESS':
            return icons.book_icon;
        case 'WARNING':
            return icons.report_icon;
        case 'INFO':
        default:
            return icons.notification_icon;
    }
};

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onPress }) => {
    const isRead = notification.isRead;

    return (
        <Pressable onPress={onPress}>
            {({ isPressed }) => (
                <Box
                    bg={isPressed ? 'coolGray.200' : isRead ? 'white' : 'lightBlue.50'}
                    p={4}
                    borderBottomWidth={1}
                    borderColor="coolGray.200"
                >
                    <HStack space={4} alignItems="center">
                        <Avatar bg="lightBlue.500" size="md">
                            <Text color="white" fontSize="xl" bold>i</Text>
                        </Avatar>
                        <VStack flex={1} space={1}>
                            <Text fontSize="md" fontWeight="bold" color={isRead ? 'coolGray.600' : 'black'}>
                                {notification.title}
                            </Text>
                            <Text fontSize="sm" color={isRead ? 'coolGray.500' : 'coolGray.800'} noOfLines={2}>
                                {notification.message}
                            </Text>
                            <Text fontSize="xs" color="coolGray.400" mt={1} alignSelf="flex-end">
                                {new Date(notification.createdAt).toLocaleString()}
                            </Text>
                        </VStack>
                    </HStack>
                </Box>
            )}
        </Pressable>
    );
};

export default NotificationCard; 