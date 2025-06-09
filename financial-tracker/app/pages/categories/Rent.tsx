import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import AddExpense from './AddExpense';

type Expense = {
    id: string;
    title: string;
    amount: number;
    date: string;
};

export default function RentScreen() {
    const navigation = useNavigation();
    const [expenses, setExpenses] = useState<Expense[]>([]);

    useEffect(() => {
        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser;
        if (!user) return;

        const rentExpensesRef = collection(db, 'usernames', user.uid, 'categories', 'Rent', 'expenses');

        const unsubscribe = onSnapshot(rentExpensesRef, (snapshot) => {
            const expenseList: Expense[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Expense, 'id'>),
            }));
            setExpenses(expenseList);
        });

        return () => unsubscribe();
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#052224" />
                            <Text style={styles.backText}>Back</Text>
                        </TouchableOpacity>

                        <Text style={styles.title}>Rent Category Details</Text>
                        <AddExpense categoryId="Rent" />
                        <Text style={styles.sectionTitle}>Rent Transactions</Text>
                    </>
                }
                renderItem={({ item }) => {
                    const formattedDate = new Date(item.date).toLocaleDateString() + ' • ' +
                        new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                        <View style={styles.expenseItem}>
                            <Text style={styles.expenseTitle}>{item.title}</Text>
                            <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
                            <Text style={styles.expenseDate}>{formattedDate}</Text>
                        </View>
                    );
                }}
                ListEmptyComponent={<Text style={styles.emptyText}>No rent expenses yet.</Text>}
                contentContainerStyle={styles.scrollContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0FAF8' },
    scrollContent: { padding: 20, paddingBottom: 80 },
    backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backText: { marginLeft: 8, fontSize: 16, color: '#052224' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#052224', marginBottom: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 30, marginBottom: 10, color: '#052224' },
    expenseItem: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    expenseTitle: { fontSize: 16, fontWeight: 'bold', color: '#052224' },
    expenseAmount: { fontSize: 14, color: '#00D09E' },
    expenseDate: { fontSize: 12, color: '#555' },
    emptyText: { textAlign: 'center', marginTop: 10, color: '#888' },
});

