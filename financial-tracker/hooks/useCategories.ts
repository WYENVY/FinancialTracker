// hooks/useCategories.ts
import { useState, useEffect } from 'react';
import {getFirestore, collection, doc, deleteDoc, updateDoc, onSnapshot, setDoc, getDoc} from 'firebase/firestore';
import { auth } from '@/app/fireconfig';
import { ExpenseCategory, Expense } from '@/src/types';

const COLOR_PALETTE = [
    '#FF6B6B',
    '#48D1CC',
    '#FFA500',
    '#1E90FF',
    '#FF69B4'
];

const getRandomColor = () => {
    return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
};

export default function useCategories() {
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Get current user ID
    const userId = auth.currentUser?.uid;
    // Initialize Firestore once
    const db = getFirestore();

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        // Corrected path: user-specific categories subcollection
        const categoriesRef = collection(db, 'usernames', userId, 'categories');

        try {
            // Real-time listener for categories
            const unsubscribe = onSnapshot(
                categoriesRef,
                (snapshot) => {
                    const categoriesData: ExpenseCategory[] = [];
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        categoriesData.push({
                            id: doc.id,
                            name: data.name,
                            icon: data.icon,
                            color: data.color || getRandomColor(),
                            expenses: data.expenses || []
                        });
                    });
                    setCategories(categoriesData);
                    setLoading(false);
                    setError(null);
                },
                (err) => {
                    setError(err);
                    setLoading(false);
                }
            );

            // Cleanup subscription on unmount
            return () => unsubscribe();
        } catch (err) {
            setError(err as Error);
            setLoading(false);
        }
    }, [userId, db]);

    const addCategory = async (category: Omit<ExpenseCategory, 'id' | 'expenses'>) => {
        if (!userId) return;

        try {
            // Corrected path: user-specific categories subcollection
            const newCategoryRef = doc(collection(db, 'usernames', userId, 'categories'));
            await setDoc(newCategoryRef, {
                name: category.name,
                icon: category.icon,
                color: category.color || getRandomColor(),
                expenses: []
            });
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    };

    const deleteCategory = async (id: string) => {
        if (!userId) return;

        try {
            await deleteDoc(doc(db, 'users', userId, 'categories', id));
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    };

    const updateCategory = async (id: string, updates: Partial<Omit<ExpenseCategory, 'id'>>) => {
        if (!userId) return;

        try {
            await updateDoc(doc(db, 'usernames', userId, 'categories', id), updates);
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    };

    const addExpense = async (categoryId: string, expense: Omit<Expense, 'id'>) => {
        if (!userId) return;

        try {
            const categoryRef = doc(db, 'usernames', userId, 'categories', categoryId);
            const categoryDoc = await getDoc(categoryRef);

            if (categoryDoc.exists()) {
                const currentExpenses = categoryDoc.data().expenses || [];
                const newExpense = {
                    ...expense,
                    id: Date.now().toString(),
                    date: expense.date || new Date().toISOString()
                };

                await updateDoc(categoryRef, {
                    expenses: [...currentExpenses, newExpense]
                });
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    };

    const deleteExpense = async (categoryId: string, expenseId: string) => {
        if (!userId) return;

        try {
            const categoryRef = doc(db, 'users', userId, 'categories', categoryId);
            const categoryDoc = await getDoc(categoryRef);

            if (categoryDoc.exists()) {
                const currentExpenses = categoryDoc.data().expenses || [];
                const updatedExpenses = currentExpenses.filter((exp: Expense) => exp.id !== expenseId);

                await updateDoc(categoryRef, {
                    expenses: updatedExpenses
                });
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    };

    return {
        categories,
        loading,
        error,
        addCategory,
        deleteCategory,
        updateCategory,
        addExpense,
        deleteExpense
    };
}