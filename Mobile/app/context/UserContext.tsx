import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { apiConfig } from '../config/apiConfig'
import { User } from '../types';
import { ExpoPushToken } from '../components/ExpoToken';

interface UserContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    isCheckingToken: boolean;
    logout: () => void;
    loadUserAndCheckToken: () => void;
}

interface UserProviderProps {
    children: ReactNode;
}

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isCheckingToken, setIsCheckingToken] = useState(true);

    const checkToken = async (token: string) => {
        if (!token) {
            setIsLoggedIn(false);
            setIsCheckingToken(false);
        } else {
            try {
                console.info('Check token');
                const response = await axios.post(`${apiConfig.baseURL}/api/public/checkToken`, { token });
                console.info(response.data);
                if (response.status == 200 && response.data === "Token is valid") {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    setIsLoggedIn(true);
                } else {
                    AsyncStorage.clear();
                    delete axios.defaults.headers.common['Authorization'];
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.log('There was a problem checking the token:', error);
                setIsLoggedIn(false);
            }
            setIsCheckingToken(false);
        }

    };
    const loadUserAndCheckToken = async () => {
        console.log('Loading user and check token');
        const dataString = await AsyncStorage.getItem('user');
        if (dataString) {
            const userData: User = JSON.parse(dataString);
            await setUser(userData);
            await checkToken(userData.token);
            // Lấy expoPushToken
            const expoPushToken = await ExpoPushToken();
            if (expoPushToken) {
                console.log(`Push token: ${expoPushToken}`);
                await axios.put(`${apiConfig.baseURL}/api/public/expoPushToken/${userData.id}`, {
                    expoPushToken: expoPushToken,
                });
            }
        } else {
            await setIsLoggedIn(false);
            await setIsCheckingToken(false);
        }
        console.log('finished');
    };

    const logout = async () => {
        await AsyncStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = { user, setUser, isLoggedIn, setIsLoggedIn, isCheckingToken, logout, loadUserAndCheckToken };

    useEffect(() => {
        loadUserAndCheckToken();
    }, []);

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};