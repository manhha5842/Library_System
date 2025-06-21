import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar, SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { Box, Text } from 'native-base';
import FineRecordList from '../components/history/FineRecordList';
import { FineRecordStatus } from '../types/enums';
import BackButton from '../components/BackButton';

interface MyRoute {
    key: string;
    title: string;
}

interface MyNavigationState extends NavigationState<MyRoute> {}

type MyTabBarProps = SceneRendererProps & {
    navigationState: MyNavigationState;
};

    const renderScene = SceneMap({
    unpaid: () => <FineRecordList statuses={[FineRecordStatus.UNPAID]} />,
    paid: () => <FineRecordList statuses={[FineRecordStatus.PAID]} />,
    });

export default function HistoryFineRecord() {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [routes] = useState<MyRoute[]>([
        { key: 'unpaid', title: 'Chưa thanh toán' },
        { key: 'paid', title: 'Đã thanh toán' },
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
            <BackButton title='Lịch sử phiếu phạt' />
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