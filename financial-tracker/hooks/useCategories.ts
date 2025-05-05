// hooks/useCategories.ts
import { useState } from 'react';
import { ExpenseCategory, Expense } from '@/src/types';

const COLOR_PALETTE = [
    '#FF6B6B', // red
    '#48D1CC', // teal
    '#76C75F', // green
    '#FFA500', // orange
    '#9370DB', // purple
    '#FFD700', // gold
    '#1E90FF', // dodgerblue
    '#FF69B4'  // hotpink
];

const getRandomColor = () => {
    return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
};

export default function useCategories() {
    const [categories, setCategories] = useState<ExpenseCategory[]>([
        {
            id: '1',
            name: 'Food',
            icon: 'fast-food',
            color: '#FF6B6B',
            expenses: []
        },
        {
            id: '2',
            name: 'Transport',
            icon: 'car',
            color: '#48D1CC',
            expenses: []
        }
    ]);

    const addCategory = (category: Omit<ExpenseCategory, 'id' | 'expenses'>) => {
        setCategories(prev => [...prev, {
            ...category,
            id: Date.now().toString(),
            expenses: [],
            color: category.color || getRandomColor() // Fallback to random color
        }]);
    };

    const deleteCategory = (id: string) => {
        setCategories(prev => prev.filter(cat => cat.id !== id));
    };

    const updateCategory = (id: string, updates: Partial<Omit<ExpenseCategory, 'id'>>) => {
        setCategories(prev => prev.map(cat =>
            cat.id === id ? { ...cat, ...updates } : cat
        ));
    };

    const addExpense = (categoryId: string, expense: Omit<Expense, 'id'>) => {
        setCategories(prev => prev.map(cat =>
            cat.id === categoryId
                ? {
                    ...cat,
                    expenses: [
                        ...cat.expenses,
                        {
                            ...expense,
                            id: Date.now().toString(),
                            date: expense.date || new Date().toISOString()
                        }
                    ]
                }
                : cat
        ));
    };

    const deleteExpense = (categoryId: string, expenseId: string) => {
        setCategories(prev => prev.map(cat =>
            cat.id === categoryId
                ? {
                    ...cat,
                    expenses: cat.expenses.filter(exp => exp.id !== expenseId)
                }
                : cat
        ));
    };

    return {
        categories,
        addCategory,
        deleteCategory,
        updateCategory,
        addExpense,
        deleteExpense
    };
}