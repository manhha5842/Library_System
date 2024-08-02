import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
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


    const fetchCategories = async () => {
        console.info("Fetching categories");
        try {
            const response = await axios.get<Category[]>(`${apiConfig.baseURL}/api/categories/getAll`);
            if (response.status === 200) {
                const sortedCategories: Category[] = response.data.sort((a, b) => a.name.localeCompare(b.name));
                setCategories(sortedCategories);

                const groups = sortedCategories.reduce<{ [key: string]: Category[] }>((acc, category) => {
                    const firstLetter = category.name[0].toUpperCase();
                    if (!acc[firstLetter]) {
                        acc[firstLetter] = [];
                    }
                    acc[firstLetter].push(category);
                    return acc;
                }, {});

                const categoryGroups = Object.keys(groups).map(key => ({
                    title: key,
                    data: groups[key]
                }));

                setCategoryGroup(categoryGroups);
            }
        } catch (error) {
            console.info('Error fetching categories:', error);
        }
    };
    const fetchCategoryById = async (id: string) => {
        console.info("Fetching category", id);
        try {
            if (id) {
                const response = await axios.get<Category>(`${apiConfig.baseURL}/api/categories/getCategoriesById/${id}`);
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