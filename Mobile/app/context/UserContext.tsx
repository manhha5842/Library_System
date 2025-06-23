import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from '../config/apiConfig'
import { User } from '../types';
import { ExpoPushToken } from '../components/ExpoToken';
import * as Device from 'expo-device';

interface UserContextType {
    user: User | null;
    isLoggedIn: boolean;
    isCheckingToken: boolean;
    login: (userData: User) => Promise<void>;
    logout: () => void;
}

interface UserProviderProps {
    children: ReactNode;
}

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isCheckingToken, setIsCheckingToken] = useState(true);

    useEffect(() => {
        const loadUserFromStorage = async () => {
            setIsCheckingToken(true);
            try {
                const userString = await AsyncStorage.getItem('user');
                if (userString) {
                    const userData: User = JSON.parse(userString);
                    // Thêm bước gọi API để xác thực token 
                    setUser(userData);
                    setIsLoggedIn(true);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
                }
            } catch (e) {
                console.error("Failed to load user from storage", e);
            } finally {
                setIsCheckingToken(false);
            }
        };

        loadUserFromStorage();
    }, []);

    const login = async (userData: User) => {
        try {
            setUser(userData);
            setIsLoggedIn(true);
            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
            await AsyncStorage.setItem('user', JSON.stringify(userData));

        } catch (e) {
            console.error("Failed to save user to storage", e);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user');
            setUser(null);
            setIsLoggedIn(false);
            delete axios.defaults.headers.common['Authorization'];
        } catch (e) {
            console.error("Failed to remove user from storage", e);
        }
    };

    const value = { user, isLoggedIn, isCheckingToken, login, logout };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};