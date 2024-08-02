import React, { useState } from "react";
import { Button, Divider, Flex, HStack, Text } from "native-base";
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface MyDateTimePickerProps {
    selectDate?: Date | null;
    setSelectDate: (date: Date | null) => void;
    setDueDate: (date: Date | null) => void;
} 
export default function MyDateTimePicker({ selectDate = null, setSelectDate, setDueDate }: MyDateTimePickerProps) {
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date: Date) => {
        setSelectDate(date);
        const newDueDate = new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000);
        setDueDate(newDueDate);
        hideDatePicker();
    };

    // Tính minimumDate và maximumDate
    const now = new Date();
    const currentHour = now.getHours();
    let minimumDate = new Date();

    if (currentHour >= 16) {
        // Cộng thêm một ngày nếu hiện tại đã qua 16h
        minimumDate.setDate(minimumDate.getDate() + 1);
    }

    const maximumDate = new Date();
    maximumDate.setDate(maximumDate.getDate() + 30);

    return (
        <HStack h={12} justifyContent={'space-between'} alignItems={'center'} w={'100%'}  >
            <Flex direction="row" h="58" p="4">
                <Text>{selectDate ? ("0" + selectDate.getDate()).slice(-2) : 'DD'}</Text>
                <Divider bg="indigo.500" thickness="2" mx="2" orientation="vertical" />
                <Text>{selectDate ? ("0" + (selectDate.getMonth() + 1)).slice(-2) : 'MM'}</Text>
                <Divider bg="indigo.500" thickness="2" mx="2" orientation="vertical" />
                <Text>{selectDate ? selectDate.getFullYear() : 'YYYY'}</Text>
            </Flex>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
            />
            <Button onPress={showDatePicker} h={10}>Chọn ngày nhận sách</Button>
        </HStack>
    );
};