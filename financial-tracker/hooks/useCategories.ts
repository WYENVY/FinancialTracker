import { useEffect, useState } from 'react';
import { ExpenseCategory, Expense } from '@/src/types';
import {
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    updateDoc,
    setDoc
} from 'firebase/firestore';
import { auth } from '../app/fireconfig';

const COLOR_PALETTE = [
    '#FF6B6B', '#48D1CC', '#76C75F', '#FFA500',
    '#9370DB', '#FFD700', '#1E90FF', '#FF69B4'
];

const getRandomColor = () => {
    return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
};

export default function useCategories(presetCategories: Omit<ExpenseCategory, 'id' | 'expenses'>[]) {
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const db = getFirestore();
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) return;

        const categoriesRef = collection(db, 'usernames', user.uid, 'categories');

        const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
            const data: ExpenseCategory[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<ExpenseCategory, 'id'>)
            }));
            setCategories(data);
        });

        return () => unsubscribe();
    }, [user]);

    const addCategory = async (category: Omit<ExpenseCategory, 'id' | 'expenses'>) => {
        if (!user) return;
        const categoriesRef = collection(db, 'usernames', user.uid, 'categories');
        await addDoc(categoriesRef, {
            ...category,
            color: category.color || getRandomColor(),
            expenses: [],
        });
    };

    const deleteCategory = async (id: string) => {
        if (!user) return;
        const categoryRef = doc(db, 'usernames', user.uid, 'categories', id);
        await deleteDoc(categoryRef);
    };

    const updateCategory = async (id: string, updates: Partial<Omit<ExpenseCategory, 'id' | 'expenses'>>) => {
        if (!user) return;
        const categoryRef = doc(db, 'usernames', user.uid, 'categories', id);
        await updateDoc(categoryRef, updates);
    };

    const addExpense = async (categoryId: string, expense: Omit<Expense, 'id'>) => {
        if (!user) return;

        const category = categories.find(c => c.id === categoryId);
        if (!category) return;

        const newExpense: Expense = {
            id: crypto.randomUUID(),
            ...expense
        };

        const updatedExpenses = [...(category.expenses || []), newExpense];

        const categoryRef = doc(db, 'usernames', user.uid, 'categories', categoryId);
        await updateDoc(categoryRef, { expenses: updatedExpenses });
    };

    const deleteExpense = async (categoryId: string, expenseId: string) => {
        if (!user) return;

        const category = categories.find(c => c.id === categoryId);
        if (!category) return;

        const updatedExpenses = (category.expenses || []).filter(e => e.id !== expenseId);

        const categoryRef = doc(db, 'usernames', user.uid, 'categories', categoryId);
        await updateDoc(categoryRef, { expenses: updatedExpenses });
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
