import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import axios from 'axios';
import api from '../config/apiConfig'; 
import { Category, CategoryGroup } from '../types'

interface CategoryContextType {
    category: Category | null;
    categories: Category[];
    categoryGroup: CategoryGroup[];
    fetchCategoryById: (id: string) => Promise<void>
    fetchCategories: () => void;
}

const defaultContextValue: CategoryContextType = {
    category: null,
    categories: [],
    categoryGroup: [],
    fetchCategoryById: async () => { },
    fetchCategories: async () => { },
};
interface CategoryProviderProps {
    children: ReactNode;
}

export const CategoryContext = createContext<CategoryContextType>(defaultContextValue);

export const CategoryProvider: React.FC<CategoryProviderProps> = ({ children }) => {
    const [category, setCategory] = useState<Category | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryGroup, setCategoryGroup] = useState<CategoryGroup[]>([]);
    const [isFetching, setIsFetching] = useState(false);

    const fetchCategories = async () => {
        if (isFetching) {
            return;
        }
        setIsFetching(true);
        try {
            const response = await api.get<Category[]>(`/categories/getAll`);
            if (response?.status === 200) {
                const groupedData = response.data.reduce((acc: { [key: string]: Category[] }, item: Category) => {
                    const firstLetter = item.name.charAt(0).toUpperCase();
                    if (!acc[firstLetter]) {
                        acc[firstLetter] = [];
                    }
                    acc[firstLetter].push(item);
                    return acc;
                }, {});

                const sectionedData = Object.keys(groupedData).map(key => ({
                    title: key,
                    data: groupedData[key],
                }));
                setCategories(response.data);
                setCategoryGroup(sectionedData);
            }
        } catch (error) {
            console.log('Error fetching categories', error);
            throw error;
        } finally {
            setIsFetching(false);
        }
    };
    const fetchCategoryById = async (id: string) => {
        console.info("Fetching category", id);
        try {
            if (id) {
                const response = await api.get<Category>(`/categories/getCategoriesById/${id}`);
                if (response?.status === 200) {
                    setCategory(response.data);
                }
            } else {
                console.info('Id is undefine');
            }
        } catch (error) {
            console.info('Error get category by id', error);
        }
    };



    // Cung cấp categories và setCategories đến context value
    const contextValue = {
        category,
        categories,
        categoryGroup,
        fetchCategories,
        fetchCategoryById
    };

    return (
        <CategoryContext.Provider value={contextValue}>
            {children}
        </CategoryContext.Provider>
    );
};
 
export const useCategories = () => {
    const context = useContext(CategoryContext);

    if (!context) {
        throw new Error('useCategories must be used within a CategoryProvider');
    }

    return context;
};