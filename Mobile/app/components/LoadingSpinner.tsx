import React from 'react';
import { Center, Spinner } from 'native-base';

const LoadingSpinner = () => (
    <Center flex={1}>
        <Spinner size="lg" />
    </Center>
);

export default LoadingSpinner; 