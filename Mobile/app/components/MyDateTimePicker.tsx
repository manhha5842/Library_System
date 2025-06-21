import React, { useState } from "react";
import { Button, Divider, Flex, HStack, Text } from "native-base";
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface MyDateTimePickerProps {
    selectDate: Date;
    setSelectDate: (date: Date) => void;
    minimumDate?: Date;
} 
export default function MyDateTimePicker({ selectDate, setSelectDate, minimumDate }: MyDateTimePickerProps) {
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date: Date) => {
        setSelectDate(date);
        hideDatePicker();
    };


    const maximumDate = new Date();
    maximumDate.setDate((minimumDate || new Date()).getDate() + 30);

    return (
        <HStack h={12} justifyContent={'space-between'} alignItems={'center'} w={'100%'}  >
            <Flex direction="row" h="58" p="4" borderWidth={1} borderColor="coolGray.300" borderRadius="md">
                <Text>{selectDate ? ("0" + selectDate.getDate()).slice(-2) : 'DD'}</Text>
                <Divider bg="indigo.500" thickness="1" mx="2" orientation="vertical" />
                <Text>{selectDate ? ("0" + (selectDate.getMonth() + 1)).slice(-2) : 'MM'}</Text>
                <Divider bg="indigo.500" thickness="1" mx="2" orientation="vertical" />
                <Text>{selectDate ? selectDate.getFullYear() : 'YYYY'}</Text>
            </Flex>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                minimumDate={minimumDate || new Date()}
                maximumDate={maximumDate}
                date={selectDate}
            />
            <Button onPress={showDatePicker} h={12}>Chọn ngày</Button>
        </HStack>
    );
};