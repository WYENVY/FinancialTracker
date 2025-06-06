import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc } from 'firebase/firestore';
import AddExpense from './AddExpense'; // Adjust if needed

type Expense = {
    id: string;
    title: string;
    amount: number;
    date: string;
};

export default function IncomeScreen() {
    const navigation = useNavigation();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [currentIncomeTotal, setCurrentIncomeTotal] = useState(0);

    useEffect(() => {
        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser;
        if (!user) return;

        // Listen to income expenses
        const incomeRef = collection(db, 'usernames', user.uid, 'categories', 'Income', 'expenses');
        const unsubscribeExpenses = onSnapshot(incomeRef, (snapshot) => {
            const expenseList: Expense[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Expense, 'id'>),
            }));
            setExpenses(expenseList);
        });

        // Listen to the income total (which gets updated when income is added or food expenses are subtracted)
        const incomeDocRef = doc(db, 'usernames', user.uid, 'categories', 'Income');
        const unsubscribeIncomeTotal = onSnapshot(incomeDocRef, (snapshot) => {
            if (snapshot.exists()) {
                setCurrentIncomeTotal(snapshot.data()?.income || 0);
            } else {
                setCurrentIncomeTotal(0);
            }
        });

        return () => {
            unsubscribeExpenses();
            unsubscribeIncomeTotal();
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

                        <Text style={styles.title}>Income Details</Text>

                        {/* Show current income total (after expenses) */}
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>Current Income Total:</Text>
                            <Text style={[
                                styles.totalAmount,
                                currentIncomeTotal < 0 ? styles.negative : styles.positive
                            ]}>
                                ${currentIncomeTotal.toFixed(2)}
                            </Text>
                        </View>

                        <AddExpense presetCategory="Income" />
                        <Text style={styles.sectionTitle}>Income</Text>
                    </>
                }
                renderItem={({ item }) => (
                    <View style={styles.expenseItem}>
                        <Text style={styles.expenseTitle}>{item.title}</Text>
                        <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
                        <Text style={styles.expenseDate}>{item.date}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No income expenses yet.</Text>}
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
    totalContainer: {
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
    totalLabel: {
        fontSize: 16,
        color: '#052224',
        fontWeight: '500',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    positive: {
        color: '#00D09E',
    },
    negative: {
        color: '#FF6B6B',
    },
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

