import React from 'react';
import { Button, HStack, Image, Text, VStack } from 'native-base';
import * as ExpoImagePicker from 'expo-image-picker';

interface ImagePickerProps {
    imageUri: string | null;
    setImageUri: (uri: string | null) => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ imageUri, setImageUri }) => {

    const pickImage = async (fromCamera: boolean) => {
        const hasPermission = fromCamera 
            ? await ExpoImagePicker.requestCameraPermissionsAsync()
            : await ExpoImagePicker.requestMediaLibraryPermissionsAsync();

        if (hasPermission.status !== 'granted') {
            alert(`Vui lòng cấp quyền truy cập ${fromCamera ? 'máy ảnh' : 'thư viện ảnh'}!`);
            return;
        }

        const result = fromCamera
            ? await ExpoImagePicker.launchCameraAsync({ quality: 0.5 })
            : await ExpoImagePicker.launchImageLibraryAsync({ mediaTypes: ExpoImagePicker.MediaTypeOptions.Images, quality: 0.5 });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    return (
        <VStack space={2} alignItems="center">
            <HStack space={4}>
                <Button onPress={() => pickImage(false)} variant="outline">
                    Chọn ảnh từ thư viện
                </Button>
                <Button onPress={() => pickImage(true)} variant="outline">
                    Chụp ảnh mới
                </Button>
            </HStack>
            {imageUri && (
                <VStack space={2} mt={4} alignItems="center">
                    <Text>Ảnh đã chọn:</Text>
                    <Image source={{ uri: imageUri }} alt="Selected image" size="2xl" resizeMode="contain" />
                    <Button onPress={() => setImageUri(null)} variant="ghost" colorScheme="secondary">
                        Xóa ảnh
                    </Button>
                </VStack>
            )}
        </VStack>
    );
};

export default ImagePicker; 