import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, collection, onSnapshot, addDoc, setDoc } from 'firebase/firestore';
import AddExpense from './AddExpense';

type Expense = {
    id: string;
    title: string;
    amount: number;
    date: string;
    description?: string;
};


export default function EntertainmentScreen() {
    const navigation = useNavigation();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [remainingIncome, setRemainingIncome] = useState(0);

    useEffect(() => {
        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser;
        if (!user) return;

        // Listen to Entertainment expenses
        const entertainmentExpensesRef = collection(db, 'usernames', user.uid, 'categories', 'Entertainment', 'expenses');
        const unsubscribeExpenses = onSnapshot(entertainmentExpensesRef, (snapshot) => {
            const expenseList: Expense[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Expense, 'id'>),
            }));
            setExpenses(expenseList);
        });

        // Listen to income total (remaining after expenses)
        const incomeDocRef = doc(db, 'usernames', user.uid, 'categories', 'Income');
        const unsubscribeIncome = onSnapshot(incomeDocRef, (snapshot) => {
            if (snapshot.exists()) {
                setRemainingIncome(snapshot.data()?.income || 0);
            } else {
                setRemainingIncome(0);
            }
        });

        return () => {
            unsubscribeExpenses();
            unsubscribeIncome();
        };
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

                        <Text style={styles.title}>Entertainment Category Details</Text>

                        {/* Show remaining income */}
                        <View style={styles.incomeContainer}>
                            <Text style={styles.incomeLabel}>Remaining Income:</Text>
                            <Text style={[
                                styles.incomeAmount,
                                remainingIncome < 0 ? styles.negative : styles.positive
                            ]}>
                                ${remainingIncome.toFixed(2)}
                            </Text>
                        </View>

                        <AddExpense presetCategory="Entertainment" />
                        <Text style={styles.sectionTitle}>Entertainment Transactions</Text>
                    </>
                }
                renderItem={({ item }) => (
                    <View style={styles.expenseItem}>
                        <Text style={styles.expenseTitle}>{item.title}</Text>
                        <Text style={styles.expenseAmount}>${Number(item.amount || 0).toFixed(2)}</Text>
                        <Text style={styles.expenseDate}>{item.date}</Text>
                        {item.description && <Text style={styles.expenseDescription}>{item.description}</Text>}
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No entertainment expenses yet.</Text>}
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
    incomeContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderColor: '#ddd',
        borderWidth: 1,
    },
    incomeLabel: {
        fontSize: 16,
        color: '#052224',
        fontWeight: '500',
    },
    incomeAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    positive: {
        color: '#00D09E',
    },
    negative: {
        color: '#FF6B6B',
    },
    addExpenseContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    addExpenseHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#052224',
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#aaa',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: '#F9F9F9',
    },
    button: {
        backgroundColor: '#00D09E',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#052224',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#052224' },
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
    expenseDescription: { fontSize: 12, color: '#777', marginTop: 4 },
    emptyText: { textAlign: 'center', marginTop: 10, color: '#888' },
});
