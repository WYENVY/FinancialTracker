import { collection, getFirestore, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../fireconfig';

type Transaction = {
    id: string;
    amount: number;
    description: string;
    date: Date;
    category?: string;
};

//define time range filter
type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';

// define transaction type filter
type TransactionType = 'income' | 'expense' | 'all';

export default function TransactionHistoryScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('all');
    const [selectedType, setSelectedType] = useState<TransactionType>('all');
    const [totalBalance, setTotalBalance] = useState<number>(0);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [totalExpense, setTotalExpense] = useState<number>(0);

    //monthly transactions
    const [transactionsByMonth, setTransactionsByMonth] = useState<{[key: string]: Transaction[]}>({});

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();
        
        // Fetch transactions
        const transactionsRef = collection(db, 'usernames', user.uid, 'transactions');
        const transactionsQuery = query(transactionsRef);

        const unsubscribeTransactions = onSnapshot(transactionsQuery, (querySnapshot) => {
            const fetchedTransactions: Transaction[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedTransactions.push({
                    id: doc.id,
                    amount: data.amount,
                    description: data.description,
                    date: new Date(data.date),
                    category: data.category
                });
            });
            // Sort by date (newest first)
            fetchedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
            setTransactions(fetchedTransactions);
            
            // calculate totals
            calculateTotals(fetchedTransactions);
            
            //transactions filter
            const filtered = filterTransactions(fetchedTransactions, selectedTimeRange, selectedType);
            setFilteredTransactions(filtered);
            
            // monthly transactions
            groupTransactionsByMonth(filtered);
        });

        return () => {
            unsubscribeTransactions();
        };
    }, []);

    //calculate total income, expense and balance
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
        setTotalBalance(income - expense);
    };

    // filter transactions based on time range and type
    const filterTransactions = (
        allTransactions: Transaction[] = transactions, 
        timeRange: TimeRange = selectedTimeRange,
        type: TransactionType = selectedType
    ) => {
        // time range filtering
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
        
        // category filtering
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

    // time range change handler
    const handleTimeRangeChange = (range: TimeRange) => {
        setSelectedTimeRange(range);
        const filtered = filterTransactions(transactions, range, selectedType);
        setFilteredTransactions(filtered);
        groupTransactionsByMonth(filtered);
    };

    // transaction type change handler
    const handleTypeChange = (type: TransactionType) => {
        setSelectedType(type);
        const filtered = filterTransactions(transactions, selectedTimeRange, type);
        setFilteredTransactions(filtered);
        groupTransactionsByMonth(filtered);
    };

    // monthly transactions grouping
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

    // format currency function
    const formatCurrency = (amount: number) => {
        return `$${Math.abs(amount).toFixed(2)}`;
    };

    // display transaction item
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
                </View>
                <View style={styles.transactionRightContent}>
                    {item.category && (
                        <Text style={styles.transactionCategory}>{item.category}</Text>
                    )}
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

    // display month header
    const renderMonthHeader = (monthName: string) => (
        <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>{monthName}</Text>
        </View>
    );

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <Text style={styles.title}>History</Text>

                {/* total balance display */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={styles.balanceAmount}>${totalBalance.toFixed(2)}</Text>
                </View>

                {/* clcik card for income and expense */}
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

                {/* time range filiters */}
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

                {/* display transactions monthly */}
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
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#121212',
    },
    container: {
        flex: 1,
        padding: 20,
        minHeight: 600,
        backgroundColor: '#121212',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#1DB954',
    },
    balanceCard: {
        backgroundColor: '#1DB954',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
    },
    balanceLabel: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    balanceAmount: {
        color: '#000000',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statsCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        width: '48%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    selectedCard: {
        borderColor: '#1DB954',
    },
    statsLabel: {
        color: '#1DB954',
        fontSize: 16,
        marginBottom: 8,
    },
    incomeAmount: {
        color: '#1DB954',
        fontSize: 20,
        fontWeight: 'bold',
    },
    expenseAmount: {
        color: '#007AFF', // blue color for expense
        fontSize: 20,
        fontWeight: 'bold',
    },
    timeRangeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: 5,
    },
    timeRangeButton: {
        flex: 1,
        padding: 8,
        alignItems: 'center',
        borderRadius: 4,
    },
    selectedTimeRange: {
        backgroundColor: '#1DB954',
    },
    timeRangeText: {
        color: '#ffffff',
        fontSize: 14,
    },
    selectedTimeRangeText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    monthGroup: {
        marginBottom: 16,
    },
    monthHeader: {
        backgroundColor: '#1a1a1a',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    monthTitle: {
        color: '#1DB954',
        fontSize: 18,
        fontWeight: 'bold',
    },
    transactionItem: {
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    transactionLeftContent: {
        flex: 1,
    },
    transactionRightContent: {
        alignItems: 'flex-end',
    },
    transactionDescription: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    transactionCategory: {
        color: '#666666',
        fontSize: 14,
        marginBottom: 4,
    },
    transactionTime: {
        color: '#777777',
        fontSize: 12,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    incomeText: {
        color: '#1DB954',
    },
    expenseText: {
        color: '#007AFF',
    },
    emptyText: {
        color: '#777777',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
});