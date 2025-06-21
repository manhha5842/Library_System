import React, { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Box, VStack, Text, HStack, Divider, TextArea, Button, Heading, Spinner, useToast, Center } from 'native-base';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../constants';
import { useRenewalRequest } from '../hooks/useRenewalRequest';
import MyDateTimePicker from '../components/MyDateTimePicker';
import BackButton from '../components/BackButton';
import CustomAlertDialog from '../components/AlertDialog';

type RenewalRequestRouteProp = RouteProp<RootStackParamList, 'RenewalRequestPage'>;

const formatDate = (dateString: string | Date | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = `0${date.getDate()}`.slice(-2);
    const month = `0${date.getMonth() + 1}`.slice(-2);
    return `${day}/${month}/${date.getFullYear()}`;
};

export default function RenewalRequestPage() {
    const route = useRoute<RenewalRequestRouteProp>();
    const navigation = useNavigation();
    const toast = useToast();
    const { borrowRecordId } = route.params;

    const {
        record,
        isLoading,
        isSubmitting,
        newDueDate,
        setNewDueDate,
        reason,
        setReason,
        fetchRecordDetail,
        submitRenewalRequest,
    } = useRenewalRequest(borrowRecordId);
    
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleSubmit = async () => {
        setIsConfirmOpen(false); // Close dialog first
        const { success, error } = await submitRenewalRequest();
        if (success) {
            toast.show({ description: "Gửi yêu cầu gia hạn thành công!", placement: 'top' });
            navigation.goBack();
        } else if (error) {
            toast.show({ description: error, placement: 'top' });
        }
    };

    if (isLoading && !record) {
        return (
            <Box flex={1} bg="white">
                 <BackButton title="Gia hạn" />
                 <Center flex={1}>
                    <Spinner color="gray.500" />
                </Center>
            </Box>
        );
    }

    if (!record) {
        return (
             <Box flex={1} bg="white">
                <BackButton title="Gia hạn" />
                <Center flex={1}>
                    <Text>Không tìm thấy thông tin phiếu mượn.</Text>
                </Center>
            </Box>
        )
    }

    return (
        <Box flex={1} bg="white">
            <BackButton title="Gia hạn phiếu mượn" />
            <CustomAlertDialog 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Xác nhận gia hạn"
                message={`Bạn có chắc muốn gia hạn phiếu mượn #${record.id} đến ngày ${formatDate(newDueDate)}?`}
            buttons={[
                    { label: 'Huỷ', onPress: () => setIsConfirmOpen(false), colorScheme: 'coolGray' },
                    { label: 'Xác nhận', onPress: handleSubmit, colorScheme: 'primary' }
                ]}
            />
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchRecordDetail} />}
                keyboardShouldPersistTaps="handled"
            >
                <VStack p={4} space={4}>
                    <Heading size="md" textAlign="center">Yêu cầu gia hạn</Heading>
                    
                    <VStack space={2} borderWidth={1} borderColor="coolGray.200" borderRadius="md" p={3}>
                        <Text fontWeight="bold">Thông tin phiếu mượn</Text>
                        <Divider my={1} />
                        <Text>Mã phiếu: #{record.id}</Text>
                        <Text>Ngày mượn: {formatDate(record.borrowDate)}</Text>
                        <Text>Ngày trả hiện tại: {formatDate(record.dueDate)}</Text>
                    </VStack>

                    <VStack space={2}>
                        <Text fontWeight="bold">Chọn ngày trả mới</Text>
                        <MyDateTimePicker selectDate={newDueDate} setSelectDate={setNewDueDate} minimumDate={new Date(record.dueDate)} />
                    </VStack>

                    <VStack space={2}>
                        <Text fontWeight="bold">Lý do gia hạn (không bắt buộc)</Text>
                        <TextArea
                            h={20}
                            placeholder="Nhập lý do của bạn..."
                            value={reason}
                            onChangeText={setReason}
                            autoCompleteType={undefined}
                        />
                    </VStack>

                    <Button
                        mt={4}
                        onPress={() => setIsConfirmOpen(true)}
                        isLoading={isSubmitting}
                        isDisabled={!newDueDate}
                        isLoadingText="Đang gửi..."
                    >
                    Gửi yêu cầu
                </Button>
            </VStack>
        </ScrollView>
        </Box>
    );
}
