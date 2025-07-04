import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc } from 'firebase/firestore';
import AddIncome from './AddIncome';

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

        const incomeRef = collection(db, 'usernames', user.uid, 'categories', 'Income', 'expenses');
        const unsubscribe = onSnapshot(incomeRef, (snapshot) => {
            const allExpenses: Expense[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Expense, 'id'>),
            }));

            setExpenses(allExpenses);

            // Filter for current month income total
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const monthlyTotal = allExpenses.reduce((total, item) => {
                const itemDate = new Date(item.date);
                if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
                    return total + item.amount;
                }
                return total;
            }, 0);

            setCurrentIncomeTotal(monthlyTotal);
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

                        <Text style={styles.title}>Income Details</Text>

                        {/* Show current income total (after expenses) */}
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>Current Months Income Total:</Text>
                            <Text style={[
                                styles.totalAmount,
                                currentIncomeTotal < 0 ? styles.negative : styles.positive
                            ]}>
                                ${currentIncomeTotal.toFixed(2)}
                            </Text>
                        </View>

                        <AddIncome />
                        <Text style={styles.sectionTitle}>Income</Text>
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
                ListEmptyComponent={<Text style={styles.emptyText}>No income added yet.</Text>}
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