import * as Font from "expo-font"
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { useState, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NativeBaseProvider, Image, HStack, Spinner, Box, Center, ZStack, Text, Heading } from "native-base";
import { theme, RootStackParamList } from "./app/constants"
import { navigationTheme } from "./app/constants/navigationTheme"
import { UserProvider, useUser } from './app/context/UserContext';
import * as Screen from "./app/views"
import BackButton from "./app/components/BackButton";
import CartButton from "./app/components/CartButton";
import { CartProvider } from "./app/context/CartContext";


const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const originalWarn = console.warn;

console.warn = (message, ...args) => {
  if (typeof message === 'string' && message.includes('Support for defaultProps will be removed from memo components')) {
    return;
  }
  originalWarn(message, ...args);
};
export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const loadFonts = async () => {
    await Font.loadAsync({
      'Lexend_100Thin': require('./app/assets/fonts/Lexend_100Thin.ttf'),
      'Lexend_200ExtraLight': require('./app/assets/fonts/Lexend_200ExtraLight.ttf'),
      'Lexend_300Light': require('./app/assets/fonts/Lexend_300Light.ttf'),
      'Lexend_400Regular': require('./app/assets/fonts/Lexend_400Regular.ttf'),
      'Lexend_500Medium': require('./app/assets/fonts/Lexend_500Medium.ttf'),
      'Lexend_600SemiBold': require('./app/assets/fonts/Lexend_600SemiBold.ttf'),
      'Lexend_700Bold': require('./app/assets/fonts/Lexend_700Bold.ttf'),
      'Lexend_800ExtraBold': require('./app/assets/fonts/Lexend_800ExtraBold.ttf'),
      'Lexend_900Black': require('./app/assets/fonts/Lexend_900Black.ttf'),
    });
    setFontsLoaded(true);
  }

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <NativeBaseProvider theme={theme}>
      <Center  >
        <Spinner size="lg" />
      </Center>
    </NativeBaseProvider >;
  }

  return (

    <NativeBaseProvider theme={theme}>
      <UserProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </UserProvider>
    </NativeBaseProvider>
  );
}

function AppContent() {
  const { isLoggedIn, isCheckingToken } = useUser();

  if (isCheckingToken) {
    return <NativeBaseProvider theme={theme}>
      <Center flex={1}>
        <Spinner size="xl" w={'100%'} />
        <Text>Đang tải, vui lòng đợi trong giây lát...</Text>
      </Center>
    </NativeBaseProvider >;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'HomeTabs' : 'Intro'} >
        <Stack.Screen
          name="Intro"
          component={Screen.IntroPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeTabs"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SearchBook"
          component={Screen.SearchBook}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cart"
          component={Screen.CartPage}
          options={({ navigation }) => ({
            headerShown: true,
            headerStyle: { height: 60 },
            headerTitle: '',
            headerLeft: () => (
              <BackButton navigation={navigation} />
            ),
          })}
        />
        <Stack.Screen
          name="BorrowRequest"
          component={Screen.BorrowRequest}
          options={({ navigation }) => ({
            headerShown: true,
            headerStyle: { height: 60 },
            headerTitle: '',
            headerLeft: () => (
              <BackButton navigation={navigation} />
            ),
          })}
        />
        <Stack.Screen
          name="BookList"
          component={Screen.BookList}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerStyle: { height: 60 },
            headerLeft: () => (
              <BackButton navigation={navigation} />
            ),
            headerRight: () => (
              <CartButton navigation={navigation} />
            ),
          })}
        />
        <Stack.Screen
          name="BookListSearch"
          component={Screen.BookListSearch}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerStyle: { height: 60 },
            headerLeft: () => (
              <BackButton navigation={navigation} />
            ),
            headerRight: () => (
              <CartButton navigation={navigation} />
            ),
          })}
        />
        <Stack.Screen
          name="BookDetail"
          component={Screen.BookDetailPage}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerStyle: { height: 60 },
            headerLeft: () => (
              <BackButton navigation={navigation} />
            ),
            headerRight: () => (
              <CartButton navigation={navigation} />
            ),
          })}
        />
        <Stack.Screen
          name="Category"
          component={Screen.Category}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <BackButton navigation={navigation} />
            ),

            headerRight: () => (
              <CartButton navigation={navigation} />
            ),
          })}
        />
        <Stack.Screen
          name="RenewalRequestPage"
          component={Screen.RenewalRequestPage}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <BackButton navigation={navigation} />
            ),
          })}
        />
        <Stack.Screen
          name="HistoryBorrowRecord"
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <BackButton navigation={navigation} />
            ),
          })}        >
          {() => (
            <Screen.HistoryBorrowRecord />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="BorrowRecordDetailPage"
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <BackButton navigation={navigation} />
            ),
          })}        >
          {() => (
            <Screen.BorrowRecordDetailPage />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="FineRecordDetail"
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <BackButton navigation={navigation} />
            ),
          })}        >
          {() => (
            <Screen.FineRecordDetail />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="FeedbackPage"
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <BackButton navigation={navigation} />
            ),
          })}        >
          {() => (
            <Screen.FeedbackPage />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="HistoryFeedback"
          component={Screen.HistoryFeedback}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <BackButton navigation={navigation} />
            ),
          })}
        />
        <Stack.Screen
          name="HistoryFineRecord"
          component={Screen.HistoryFineRecord}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <BackButton navigation={navigation} />
            ),
          })}
        />
        <Stack.Screen
          name="FeedbackDetail"
          component={Screen.FeedbackDetail}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <BackButton navigation={navigation} />
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator  >
      <Tab.Screen
        name="Home"
        component={Screen.HomePage}

        options={{
          tabBarShowLabel: true,
          headerShown: false,
          tabBarLabel: ({ focused }) => (<Text fontWeight={400} fontSize="12" color={focused ? "lightBlue.600" : "coolGray.400"} >Trang chủ</Text>),
          tabBarStyle: { height: 70, paddingBottom: 10 },
          tabBarIcon: ({ size, focused }) => (
            <Center size="100%" >
              <ZStack alignItems="center" justifyContent="center">
                <Box w={10} h={8} borderRadius={10} bg={"blue.400"} opacity={focused ? 0.2 : 0} />
                <Image size={focused ? size + 5 : size} alt="home-image"
                  source={require("./app/assets/icons/home-icon.png")}
                />
              </ZStack>
            </Center>
          ),
        }}

      />
      <Tab.Screen
        name="Search"
        component={Screen.SearchPage}
        options={{
          tabBarShowLabel: true,
          tabBarLabel: ({ focused }) => (
            <Text fontWeight={400} fontSize="12" color={focused ? "lightBlue.600" : "coolGray.400"}>
              Tìm kiếm
            </Text>
          ),
          tabBarStyle: {
            height: 70, paddingBottom: 10
          },
          headerShown: false,
          tabBarIcon: ({ size, focused }) => (
            <Center size="100%" >
              <ZStack alignItems="center" justifyContent="center">
                <Box w={10} h={8} borderRadius={10} bg={"blue.400"} opacity={focused ? 0.2 : 0} />
                <Image
                  source={require("./app/assets/icons/search-icon.png")}
                  size={focused ? size + 5 : size}
                  alt="home-image"
                />
              </ZStack>
            </Center>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={Screen.CartPage}
        options={{
          tabBarShowLabel: true,
          tabBarLabel: ({ focused }) => (
            <Text fontWeight={400} fontSize="12" color={focused ? "lightBlue.600" : "coolGray.400"}>Giỏ sách</Text>
          ),
          tabBarStyle: {
            height: 70, paddingBottom: 10
          },
          headerShown: false,
          tabBarIcon: ({ size, focused }) => (
            <Center size="100%" >
              <ZStack alignItems="center" justifyContent="center">
                <Box w={10} h={8} borderRadius={10} bg={"blue.400"} opacity={focused ? 0.2 : 0} />
                <Image
                  source={require("./app/assets/icons/basket-icon.png")}
                  size={focused ? size + 5 : size}
                  alt="home-image"
                />
              </ZStack>
            </Center>
          ),
        }}
      />
      <Tab.Screen
        name="Notification"
        component={Screen.NotificationPage}
        options={{
          tabBarShowLabel: true,
          tabBarLabel: ({ focused }) => (
            <Text fontWeight={400} fontSize="12" color={focused ? "lightBlue.600" : "coolGray.400"}>
              Thông báo
            </Text>
          ),
          tabBarStyle: {
            height: 70, paddingBottom: 10
          },
          headerShown: false,
          tabBarIcon: ({ size, focused }) => (
            <Center size="100%" >
              <ZStack alignItems="center" justifyContent="center">
                <Box w={10} h={8} borderRadius={10} bg={"blue.400"} opacity={focused ? 0.2 : 0} />
                <Image
                  source={require("./app/assets/icons/notification-icon.png")}
                  size={focused ? size + 5 : size}
                  alt="home-image"
                />
              </ZStack>
            </Center>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Screen.ProfilePage}
        options={{
          tabBarShowLabel: true,
          tabBarLabel: ({ focused }) => (
            <Text fontWeight={400} fontSize="12" color={focused ? "lightBlue.600" : "coolGray.400"}>
              Cá nhân
            </Text>
          ),
          tabBarStyle: {
            height: 70, paddingBottom: 10
          },
          headerShown: false,
          tabBarIcon: ({ size, focused }) => (
            <Center size="100%" >
              <ZStack alignItems="center" justifyContent="center">
                <Box w={10} h={8} borderRadius={10} bg={"blue.400"} opacity={focused ? 0.2 : 0} />
                <Image
                  source={require("./app/assets/icons/person-icon.png")}
                  size={focused ? size + 5 : size}
                  alt="home-image"
                />
              </ZStack>
            </Center>
          ),
        }}
      />
    </Tab.Navigator>
  );
}