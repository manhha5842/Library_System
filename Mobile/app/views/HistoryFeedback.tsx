import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar, SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { Box, Text } from 'native-base';
import FeedbackList from '../components/history/FeedbackList';
import { FeedbackStatus } from '../types/enums';
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
    new: () => <FeedbackList statuses={[FeedbackStatus.NEW]} />,
    seen: () => <FeedbackList statuses={[FeedbackStatus.SEEN]} />,
    resolved: () => <FeedbackList statuses={[FeedbackStatus.RESOLVED]} />,
});

export default function HistoryFeedback() {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [routes] = useState<MyRoute[]>([
        { key: 'new', title: 'Mới' },
        { key: 'seen', title: 'Đã xem' },
        { key: 'resolved', title: 'Đã giải quyết' },
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