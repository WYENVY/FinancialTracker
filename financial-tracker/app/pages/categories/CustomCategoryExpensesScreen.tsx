// app/pages/categories/CustomCategoryExpensesScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import AddExpense from './AddExpense';
import { useRoute } from '@react-navigation/native';

type Expense = {
    id: string;
    title: string;
    amount: number;
    description: string;
    date: string;
};

export default function CustomCategoryExpensesScreen() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const route = useRoute();
    const { categoryId, categoryName } = route.params as { categoryId: string; categoryName: string };

    useEffect(() => {
        const db = getFirestore();
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) return;

        const q = query(collection(db, 'usernames', user.uid, 'categories', categoryId, 'expenses'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Expense[];

            setExpenses(data);
        });

        return () => unsubscribe();
    }, [categoryId]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{categoryName} Expenses</Text>
            <AddExpense categoryId={categoryId} />
            <View style={{ paddingHorizontal: 12, paddingBottom: 20 }}>
            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.expenseTitle}>{item.title}</Text>
                        <Text>${item.amount.toFixed(2)}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                        <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                    </View>
                )}
            />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0FAF8', padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#052224', textAlign: 'center' },
    card: {
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 2,
    },
    expenseTitle: { fontSize: 16, fontWeight: 'bold' },
    description: { color: '#666', marginTop: 4 },
    date: { marginTop: 4, fontSize: 12, color: '#999' },
});
