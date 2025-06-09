import { collection, collectionGroup, getFirestore, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { auth } from '../fireconfig';

type Transaction = {
    id: string;
    amount: number;
    description: string;
    date: Date;
    category?: string;
};

type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';

type TransactionType = 'income' | 'expense' | 'all';

export default function TransactionHistoryScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('all');
    const [selectedType, setSelectedType] = useState<TransactionType>('all');
    const [totalBalance, setTotalBalance] = useState<number>(0);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [totalExpense, setTotalExpense] = useState<number>(0);

    const [transactionsByMonth, setTransactionsByMonth] = useState<{[key: string]: Transaction[]}>({});

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();
        const expensesRef = collectionGroup(db, 'expenses');

        const unsubscribe = onSnapshot(expensesRef, (snapshot) => {
            const now = new Date();
            const fetchedTransactions: Transaction[] = [];

            let income = 0;
            let expense = 0;

            snapshot.forEach((doc) => {
                if (!doc.ref.path.includes(user.uid)) return;

                const data = doc.data();
                const amount = parseFloat(data.amount);
                const date = new Date(data.date);
                const description = data.title || data.description || 'Transaction';
                const isIncome = doc.ref.path.includes('/Income/');

                if (!isNaN(amount) && !isNaN(date.getTime())) {
                    const finalAmount = isIncome ? amount : -amount;

                    const transaction: Transaction = {
                        id: doc.id,
                        amount: finalAmount,
                        date,
                        description,
                        category: data.category,
                    };

                    fetchedTransactions.push(transaction);

                    if (isIncome) {
                        income += finalAmount;
                    } else {
                        expense += Math.abs(finalAmount);
                    }
                }
            });

            fetchedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

            setTransactions(fetchedTransactions);
            setTotalIncome(income);
            setTotalExpense(expense);
            setTotalBalance(income - expense);

            const filtered = filterTransactions(fetchedTransactions, selectedTimeRange, selectedType);
            setFilteredTransactions(filtered);
            groupTransactionsByMonth(filtered);
        });

        return () => unsubscribe();
    }, []);

    const calculateTotals = (transactionList: Transaction[]) => {
        let income = 0;
        let expense = 0;

        transactionList.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            } else {
                expense += Math.abs(transaction.amount);
            }
        });

        setTotalIncome(income);
        setTotalExpense(expense);
    };

    const filterTransactions = (
        allTransactions: Transaction[] = transactions,
        timeRange: TimeRange = selectedTimeRange,
        type: TransactionType = selectedType
    ) => {
        const now = new Date();
        const timeFiltered = allTransactions.filter(transaction => {
            const transactionDate = transaction.date;

            switch (timeRange) {
                case 'day':
                    return (now.getTime() - transactionDate.getTime()) <= 24 * 60 * 60 * 1000;
                case 'week':
                    return (now.getTime() - transactionDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
                case 'month':
                    return (now.getTime() - transactionDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
                case 'year':
                    return (now.getTime() - transactionDate.getTime()) <= 365 * 24 * 60 * 60 * 1000;
                case 'all':
                default:
                    return true;
            }
        });

        return timeFiltered.filter(transaction => {
            switch (type) {
                case 'income':
                    return transaction.amount > 0;
                case 'expense':
                    return transaction.amount < 0;
                case 'all':
                default:
                    return true;
            }
        });
    };

    const handleTimeRangeChange = (range: TimeRange) => {
        setSelectedTimeRange(range);
        const filtered = filterTransactions(transactions, range, selectedType);
        setFilteredTransactions(filtered);
        calculateTotals(filtered);
        groupTransactionsByMonth(filtered);
    };

    const handleTypeChange = (type: TransactionType) => {
        setSelectedType(type);
        const filtered = filterTransactions(transactions, selectedTimeRange, type);
        setFilteredTransactions(filtered);
        calculateTotals(filtered);
        groupTransactionsByMonth(filtered);
    };

    const groupTransactionsByMonth = (filteredList: Transaction[]) => {
        const grouped: {[key: string]: Transaction[]} = {};

        filteredList.forEach(transaction => {
            const date = transaction.date;
            const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

            if (!grouped[monthYear]) {
                grouped[monthYear] = [];
            }

            grouped[monthYear].push(transaction);
        });

        setTransactionsByMonth(grouped);
    };

    const formatCurrency = (amount: number) => {
        return `$${Math.abs(amount).toFixed(2)}`;
    };

    const renderTransactionItem = ({ item }: { item: Transaction }) => {
        const isIncome = item.amount > 0;
        const time = item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const day = item.date.getDate();
        const month = item.date.toLocaleString('default', { month: 'short' });

        return (
            <View style={styles.transactionItem}>
                <View style={styles.transactionLeftContent}>
                    <Text style={styles.transactionDescription}>{item.description}</Text>
                    <Text style={styles.transactionTime}>
                        {time} - {month} {day}
                    </Text>
                    {item.category && (
                        <Text style={styles.transactionCategory}>{item.category}</Text>
                    )}
                </View>
                <View style={styles.transactionRightContent}>
                    <Text style={[
                        styles.transactionAmount,
                        isIncome ? styles.incomeText : styles.expenseText
                    ]}>
                        {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                    </Text>
                </View>
            </View>
        );
    };

    const renderMonthHeader = (monthName: string) => (
        <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>{monthName}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>History</Text>

                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={styles.balanceAmount}>${totalBalance.toFixed(2)}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.statsCard,
                            selectedType === 'income' && styles.selectedCard
                        ]}
                        onPress={() => handleTypeChange(selectedType === 'income' ? 'all' : 'income')}
                    >
                        <Text style={styles.statsLabel}>Income</Text>
                        <Text style={styles.incomeAmount}>${totalIncome.toFixed(2)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.statsCard,
                            selectedType === 'expense' && styles.selectedCard
                        ]}
                        onPress={() => handleTypeChange(selectedType === 'expense' ? 'all' : 'expense')}
                    >
                        <Text style={styles.statsLabel}>Expense</Text>
                        <Text style={styles.expenseAmount}>${totalExpense.toFixed(2)}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.whiteSheet}>
                <View style={styles.contentPadding}>
                    <View style={styles.timeRangeSelector}>
                        <TouchableOpacity
                            style={[
                                styles.timeRangeButton,
                                selectedTimeRange === 'day' && styles.selectedTimeRange
                            ]}
                            onPress={() => handleTimeRangeChange('day')}
                        >
                            <Text style={[
                                styles.timeRangeText,
                                selectedTimeRange === 'day' && styles.selectedTimeRangeText
                            ]}>
                                Day
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.timeRangeButton,
                                selectedTimeRange === 'week' && styles.selectedTimeRange
                            ]}
                            onPress={() => handleTimeRangeChange('week')}
                        >
                            <Text style={[
                                styles.timeRangeText,
                                selectedTimeRange === 'week' && styles.selectedTimeRangeText
                            ]}>
                                Week
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.timeRangeButton,
                                selectedTimeRange === 'month' && styles.selectedTimeRange
                            ]}
                            onPress={() => handleTimeRangeChange('month')}
                        >
                            <Text style={[
                                styles.timeRangeText,
                                selectedTimeRange === 'month' && styles.selectedTimeRangeText
                            ]}>
                                Month
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.timeRangeButton,
                                selectedTimeRange === 'year' && styles.selectedTimeRange
                            ]}
                            onPress={() => handleTimeRangeChange('year')}
                        >
                            <Text style={[
                                styles.timeRangeText,
                                selectedTimeRange === 'year' && styles.selectedTimeRangeText
                            ]}>
                                Year
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.timeRangeButton,
                                selectedTimeRange === 'all' && styles.selectedTimeRange
                            ]}
                            onPress={() => handleTimeRangeChange('all')}
                        >
                            <Text style={[
                                styles.timeRangeText,
                                selectedTimeRange === 'all' && styles.selectedTimeRangeText
                            ]}>
                                All
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {Object.keys(transactionsByMonth).length === 0 ? (
                            <Text style={styles.emptyText}>No transactions in this time period</Text>
                        ) : (
                            Object.entries(transactionsByMonth).map(([month, monthTransactions]) => (
                                <View key={month} style={styles.monthGroup}>
                                    {renderMonthHeader(month)}
                                    <FlatList
                                        data={monthTransactions}
                                        renderItem={renderTransactionItem}
                                        keyExtractor={item => item.id}
                                        scrollEnabled={false}
                                    />
                                </View>
                            ))
                        )}
                    </ScrollView>
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
        top: height * 0.45,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F1FFF3',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    contentPadding: {
        padding: 20,
        flex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#052224',
        marginBottom: 20,
    },
    balanceContainer: {
        backgroundColor: '#00D09E',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    balanceLabel: {
        color: '#052224',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    balanceAmount: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statsCard: {
        backgroundColor: '#DFF7E2',
        borderRadius: 12,
        padding: 16,
        width: '48%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#DFF7E2',
    },
    selectedCard: {
        borderColor: '#052224',
    },
    statsLabel: {
        color: '#052224',
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
    },
    incomeAmount: {
        color: '#00D09E',
        fontSize: 20,
        fontWeight: 'bold',
    },
    expenseAmount: {
        color: '#304FFE',
        fontSize: 20,
        fontWeight: 'bold',
    },
    timeRangeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: '#DFF7E2',
        borderRadius: 20,
        padding: 6,
    },
    timeRangeButton: {
        flex: 1,
        padding: 8,
        alignItems: 'center',
        borderRadius: 16,
    },
    selectedTimeRange: {
        backgroundColor: '#00D09E',
    },
    timeRangeText: {
        color: '#052224',
        fontSize: 14,
        fontWeight: '500',
    },
    selectedTimeRangeText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    scrollContent: {
        flex: 1,
    },
    monthGroup: {
        marginBottom: 16,
    },
    monthHeader: {
        backgroundColor: '#DFF7E2',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    monthTitle: {
        color: '#052224',
        fontSize: 18,
        fontWeight: 'bold',
    },
    transactionItem: {
        backgroundColor: '#F1FFF3',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    transactionLeftContent: {
        flex: 1,
    },
    transactionRightContent: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    transactionDescription: {
        color: '#052224',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    transactionCategory: {
        color: '#6B6B6B',
        fontSize: 14,
        marginTop: 2,
    },
    transactionTime: {
        color: '#9E9E9E',
        fontSize: 12,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    incomeText: {
        color: '#00D09E',
    },
    expenseText: {
        color: '#304FFE',
    },
    emptyText: {
        color: '#6B6B6B',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
});