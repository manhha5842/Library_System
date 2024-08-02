import React, { useState, useEffect, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Box, Text, HStack, VStack, ScrollView, Center, Divider, Spinner, Skeleton, Flex, Button, Heading, Badge, ZStack, Image } from "native-base";
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../constants';
import { StackNavigationProp } from '@react-navigation/stack';
import { BorrowRecordDetail, Feedback, FineRecord, RenewalRecord } from '../types';

type FeedBackDetailNavigationProp = StackNavigationProp<
    RootStackParamList,
    'FeedbackDetail'
>;

type FeedbackDetailRouteProp = RouteProp<RootStackParamList, 'FeedbackDetail'>;

export default function BorrowRecordDetailPage() {
    const route = useRoute<FeedbackDetailRouteProp>();
    const { feedbackId } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [feedbackDetail, setFeedbackDetail] = useState<Feedback | null>(null);

    const [isPending, setIsPending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBorrowRecordDetail = async (id: string | undefined) => {
        if (isLoading || feedbackDetail != null) {
            return;
        } else {
            try {
                setIsLoading(true);
                const response = await axios.get<Feedback>(`${apiConfig.baseURL}/api/feedbacks/${id}`);
                if (response?.status === 200) {
                    setFeedbackDetail(response.data);
                }
            } catch (error) {
                console.info('Error fetch borrow record info', error);
            }
            setIsLoading(false);
        }
    };

    useEffect(() => {
        async function fetchDetails() {
            if (feedbackId) {
                await fetchBorrowRecordDetail(feedbackId);
            }
        }
        fetchDetails();
    }, []);
 
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchBorrowRecordDetail(feedbackId);
        } catch (error) {
            console.info('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);


    if (isLoading || !feedbackDetail) {
        return (
            <ScrollView>
                <VStack space={5} safeArea padding={3} minH={'100%'}>
                    <Skeleton.Text fontSize={'lg'} textAlign={'center'} lines={4} />
                </VStack>
            </ScrollView>
        );
    }


    const { label, color, type } = getStatusDetails(feedbackDetail.status);
    return (
        <Box>

            <ScrollView minH={"100%"} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <VStack p={3} pb={32}>
                    <Heading pb={3} color={'dark.200'} textAlign={'center'}>Đơn góp ý </Heading>

                    <Box pb={3}>
                        <Badge color={color} colorScheme={type} h={12}>
                            <Center>
                                <Text fontWeight={600} >{label}</Text>
                            </Center>
                        </Badge>
                    </Box>

                    <Box pb={3}>
                        <Text fontWeight={600}>Đơn góp ý {feedbackId}</Text>
                        <HStack justifyContent={'space-between'} alignItems={'center'}>
                            <Text >Yêu cầu: {getFeedbackPurpose(feedbackDetail.purpose).label}</Text>
                        </HStack>
                        <Divider bg="indigo.500" thickness="0.5" orientation="horizontal" />
                    </Box>



                    {feedbackDetail.image != null &&
                        <Box>
                            <Image source={{ uri: feedbackDetail?.image }} alt="Selected Image" size="xl" />
                        </Box>}
                    <Box>
                        <Text fontWeight={600} pt={3}>Nội dung</Text>
                        <Text fontWeight={500} fontSize={12} > {feedbackDetail.content}</Text>

                        <Divider my={3} bg="indigo.500" thickness="0.5" orientation="horizontal" />
                        <VStack>
                            <Text fontSize={14} fontWeight={700}>Phản hồi</Text>
                            <Text fontSize={12} fontWeight={500}>
                                {feedbackDetail.reply ? feedbackDetail.reply : "Không có phản hồi"}
                            </Text>
                        </VStack>
                    </Box>



                </VStack>
            </ScrollView>
            {isPending && <ZStack size={"100%"} opacity={1} position={'absolute'}>
                <Center bg={'white'} position={'absolute'} zIndex={99}>
                </Center>
                <Center size={"100%"} position={'absolute'} zIndex={99}>
                    <Spinner size="xl" w={'100%'} />
                </Center>
            </ZStack>}
        </Box>
    );
}
const getStatusDetails = (status: string) => {
    switch (status) {
        case 'NEW':
            return { label: 'Mới', color: 'yellow.500', type: 'warning' };
        case 'NOTED':
            return { label: 'Đã ghi nhận', color: 'green.500', type: 'success' };
        case 'REJECTED':
            return { label: 'Đã từ chối', color: 'red.500', type: 'danger' };

        default:
            return { label: status, color: 'black' };
    }
};
const getFeedbackPurpose = (status: string) => {
    switch (status) {
        case 'REQUEST_NEW_BOOKS':
            return { label: 'Yêu cầu nhập thêm sách' };
        case 'REPORT_FACILITY_ISSUES':
            return { label: 'Báo cáo cơ sở vật chất bị hỏng' };
        case 'SUGGEST_SERVICE_IMPROVEMENTS':
            return { label: 'Đề xuất cải tiến dịch vụ' };
        case 'FEEDBACK_STUDY_SPACE':
            return { label: 'Góp ý về không gian học tập' };
        case 'FEEDBACK_STAFF':
            return { label: 'Phản hồi về nhân viên thư viện' };
        case 'FEEDBACK_MANAGEMENT_SYSTEM':
            return { label: 'Phản hồi về hệ thống thư viện' };

        default:
            return { label: status };
    }
};
const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'DD / MM / YYYY';
    const date = new Date(dateString);
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};