import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar, SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { Box, Text } from 'native-base';
import BorrowRecordList from '../components/history/BorrowRecordList';
import { BorrowRecordStatus } from '../types/enums';
import BackButton from '../components/BackButton';

// Define the structure of our routes
interface MyRoute {
    key: string;
    title: string;
}

// Define the state for TabView
interface MyNavigationState extends NavigationState<MyRoute> {}

// Define the props for TabBar
type MyTabBarProps = SceneRendererProps & {
    navigationState: MyNavigationState;
};


    const renderScene = SceneMap({
    pending: () => <BorrowRecordList statuses={[BorrowRecordStatus.PENDING, BorrowRecordStatus.APPROVED]} />,
    borrowed: () => <BorrowRecordList statuses={[BorrowRecordStatus.BORROWED]} />,
    returned: () => <BorrowRecordList statuses={[BorrowRecordStatus.RETURNED]} />,
    other: () => <BorrowRecordList statuses={[BorrowRecordStatus.OVERDUE, BorrowRecordStatus.REJECTED, BorrowRecordStatus.CANCELLED]} />,
});

export default function HistoryBorrowRecord() {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [routes] = useState<MyRoute[]>([
        { key: 'pending', title: 'Chờ duyệt' },
        { key: 'borrowed', title: 'Đang mượn' },
        { key: 'returned', title: 'Lịch sử' },
        { key: 'other', title: 'Khác' },
    ]);

    const renderTabBar = (props: MyTabBarProps) => (
        <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: 'black' }}
            style={{ backgroundColor: 'white' }}
            renderLabel={({ route, focused }) => (
                <Text style={{ color: focused ? 'black' : 'grey', margin: 8 }}>
                    {route.title}
                </Text>
            )}
        />
    );

        return (
        <Box flex={1} bg={'white'}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={renderTabBar}
            />
            </Box>
        );
}