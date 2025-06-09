import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, collectionGroup } from 'firebase/firestore';
import { auth } from '../fireconfig';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import DropdownMenu from '@/components/DropdownMenu';


type Transaction = {
    id: string;
    amount: number;
    description: string;
    date: Date;
    type: 'income' | 'expense';
};

export default function HomeScreen() {
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [greeting, setGreeting] = useState('');
    const navigation = useNavigation();
    const [monthlyExpenseTotal, setMonthlyExpenseTotal] = useState(0);
    const [monthlyIncomeTotal, setMonthlyIncomeTotal] = useState(0);
    const accountBalance = monthlyIncomeTotal - monthlyExpenseTotal;


    useEffect(() => {
        const hour = new Date().getHours();

        // Greeting display
        if (hour >= 5 && hour < 12) setGreeting('Morning');
        else if (hour >= 12 && hour < 17) setGreeting('Afternoon');
        else if (hour >= 17 && hour < 21) setGreeting('Evening');
        else setGreeting('Night');

        // Update greeting every hour
        const interval = setInterval(() => {
            const updatedHour = new Date().getHours();
            if (updatedHour >= 5 && updatedHour < 12) setGreeting('Morning');
            else if (updatedHour >= 12 && updatedHour < 17) setGreeting('Afternoon');
            else if (updatedHour >= 17 && updatedHour < 21) setGreeting('Evening');
            else setGreeting('Night');
        }, 3600000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();
        const expensesRef = collectionGroup(db, 'expenses');

        const unsubscribe = onSnapshot(expensesRef, (snapshot) => {
            const transactions: Transaction[] = [];

            snapshot.forEach((doc) => {
                if (!doc.ref.path.includes(user.uid)) return;

                const data = doc.data();
                const amount = parseFloat(data.amount);
                const date = new Date(data.date);
                const description = data.title || data.description || 'Transaction';
                const isIncome = doc.ref.path.includes('/Income/');

                if (!isNaN(amount) && !isNaN(date.getTime())) {
                    transactions.push({
                        id: doc.id,
                        amount,
                        date,
                        description,
                        type: isIncome ? 'income' : 'expense',
                    });
                }
            });

            const sorted = transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
            setRecentTransactions(sorted.slice(0, 3));
        });

        return () => unsubscribe();
    }, []);

    // Display income and expense widget
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();
        const expensesRef = collectionGroup(db, 'expenses');

        const unsubscribe = onSnapshot(expensesRef, (snapshot) => {
            const now = new Date();
            let totalIncome = 0;
            let totalExpenses = 0;

            snapshot.forEach((doc) => {
                if (!doc.ref.path.includes(user.uid)) return;

                const data = doc.data();
                const amount = parseFloat(data.amount);
                const date = new Date(data.date);
                const isIncome = doc.ref.path.includes('/Income/');

                const sameMonth = date.getMonth() === now.getMonth();
                const sameYear = date.getFullYear() === now.getFullYear();

                if (!isNaN(amount) && sameMonth && sameYear) {
                    if (isIncome) {
                        totalIncome += amount;
                    } else {
                        totalExpenses += amount;
                    }
                }
            });

            setMonthlyIncomeTotal(totalIncome);
            setMonthlyExpenseTotal(totalExpenses);
        });

        return () => unsubscribe();
    }, []);



    const renderTransactionItem = ({ item }: { item: Transaction }) => (
        <View style={styles.transactionItem}>
            <View style={styles.transactionRow}>
                <Text style={styles.transactionDescription}>
                    {item.description}
                </Text>
                <Text
                    style={[
                        styles.transactionAmount,
                        item.type === 'income' ? styles.incomeText : styles.expenseText,
                    ]}
                >
                    {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                </Text>
            </View>
            <Text style={styles.transactionDate}>
                {item.date.toLocaleDateString()} •{' '}
                {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
    );


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.title}>Finova</Text>
                    <DropdownMenu />
                </View>
                <Text style={styles.welcomeText}>Hi, Welcome Back</Text>
                <Text style={styles.welcomeText}>Good {greeting}</Text>
            </View>
            <View style={styles.balanceContainer}>
                <View style={styles.balanceBox}>
                    <Feather name="arrow-up-right" size={18} color="#fff" />
                    <Text style={styles.label}>Total Balance</Text>
                    <Text style={styles.balanceAmount}>${accountBalance.toFixed(2)}</Text>
                </View>

                <View style={styles.separator} />

                <View style={styles.balanceBox}>
                    <Feather name="arrow-down-left" size={18} color="#304FFE" />
                    <Text style={styles.label}>Total Expense</Text>
                    <Text style={styles.expenseAmount}>-${monthlyExpenseTotal.toFixed(2)}</Text>
                </View>
            </View>

            <View style={styles.whiteSheet}>
                <View style={styles.contentPadding}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    {recentTransactions.length === 0 ? (
                        <Text style={styles.emptyText}>No recent transactions</Text>
                    ) : (
                        <FlatList
                            data={recentTransactions}
                            renderItem={renderTransactionItem}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                        />
                    )}
                </View>
            </View>
        </View>
    );
}

const { height } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00D09E',
    },
    header: {
        padding: 20,
        paddingTop: 40,
    },
    whiteSheet: {
        position: 'absolute',
        top: height * 0.40,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F1FFF3',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    contentPadding: {
        padding: 20,
        paddingTop: 0,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#052224',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    welcomeText: {
        fontSize: 15,
        color: '#052224',
        textAlign: 'left',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#052224',
        marginBottom: 15,
        marginTop: 25,
    },
    emptyText: {
        color: '#777777',
        textAlign: 'center',
        marginTop: 10,
    },
    transactionItem: {
        backgroundColor: '#F1FFF3',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    transactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    transactionDescription: {
        color: '#052224',
        fontSize: 16,
        fontWeight: 'bold',
    },
    transactionAmount: {
        color: '#0068FF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    transactionDate: {
        color: '#0068FF',
        fontSize: 12,
    },
    transactionsContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    summaryWidget: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryItem: {
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#777',
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#052224',
    },
    balanceContainer: {
        flexDirection: 'row',
        backgroundColor: '#00D09E',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 10,
        justifyContent: 'space-around',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },

    balanceBox: {
        alignItems: 'center',
        flex: 1,
    },

    label: {
        fontSize: 14,
        color: '#052224',
        marginTop: 4,
    },

    balanceAmount: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 4,
    },

    expenseAmount: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#304FFE',
        marginTop: 4,
    },

    separator: {
        width: 1,
        height: '80%',
        backgroundColor: 'white',
        marginHorizontal: 10,
    },
    incomeText: {
        color: '#00D09E',
        fontWeight: 'bold',
        fontSize: 16,
    },
    expenseText: {
        color: '#304FFE',
        fontWeight: 'bold',
        fontSize: 16,
    },

});