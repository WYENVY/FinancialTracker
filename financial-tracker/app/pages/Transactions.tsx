import { addDoc, collection, doc, getFirestore, onSnapshot, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../fireconfig';

type Transaction = {
    id: string;
    amount: number;
    description: string;
    date: Date;
    category?: string;
};

type Budget = {
    id: string;
    budgetName: string;
    amount: number;
    amountSpent: number;
    frequency?: 'weekly' | 'monthly' | 'annually';
    category?: string;
};

export default function AddTransactionScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();

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
            fetchedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
            setTransactions(fetchedTransactions);
        });

        const budgetsRef = collection(db, 'usernames', user.uid, 'budgets');
        const budgetsQuery = query(budgetsRef);

        const unsubscribeBudgets = onSnapshot(budgetsQuery, (querySnapshot) => {
            const fetchedBudgets: Budget[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedBudgets.push({
                    id: doc.id,
                    budgetName: data.budgetName,
                    amount: data.amount,
                    amountSpent: data.amountSpent || 0,
                    frequency: data.frequency,
                    category: data.category
                });
            });
            setBudgets(fetchedBudgets);
        });

        return () => {
            unsubscribeTransactions();
            unsubscribeBudgets();
        };
    }, []);

    // Find matching budgets based on category
    const findMatchingBudgets = (transactionCategory?: string): Budget[] => {
        if (!transactionCategory || !transactionCategory.trim()) {
            // If no category specified, return no matches
            return [];
        }


        return budgets.filter(budget =>
            budget.category &&
            budget.category.toLowerCase() === transactionCategory.toLowerCase()
        );
    };

    const updateBudgetAmount = async (budgetId: string, newAmountSpent: number) => {
        const user = auth.currentUser;
        if (!user) return false;

        try {
            const db = getFirestore();
            const budgetRef = doc(db, 'usernames', user.uid, 'budgets', budgetId);
            await updateDoc(budgetRef, {
                amountSpent: newAmountSpent
            });
            return true;
        } catch (error) {
            console.error('Error updating budget amount spent:', error);
            return false;
        }
    };

    const handleAddTransaction = async () => {
        if (!amount || isNaN(Number(amount))) {
            setMessage('Error: Please enter a valid amount');
            return;
        }

        if (!description.trim()) {
            setMessage('Error: Please enter a transaction description');
            return;
        }

        const transaction: Omit<Transaction, 'id'> = {
            amount: Number(amount),
            description: description.trim(),
            date: new Date(),
            category: category.trim() // Include category if provided
        };

        const success = await addTransaction(transaction);

        if (success) {
            // Update matching budgets if transaction was added successfully
            if (transaction.category) {
                const matchingBudgets = findMatchingBudgets(transaction.category);

                if (matchingBudgets.length > 0) {
                    let budgetUpdates = 0;

                    for (const budget of matchingBudgets) {
                        const newAmountSpent = budget.amountSpent + transaction.amount;
                        const updateSuccess = await updateBudgetAmount(budget.id, newAmountSpent);

                        if (updateSuccess) {
                            budgetUpdates++;
                        }
                    }

                    if (budgetUpdates > 0) {
                        setMessage(`Transaction added successfully and ${budgetUpdates} budget(s) updated!`);
                    } else {
                        setMessage('Transaction added successfully, but budget update failed.');
                    }
                } else {
                    setMessage('Transaction added successfully. No matching budgets to update.');
                }
            } else {
                setMessage('Transaction added successfully!');
            }

            // Reset form
            setAmount('');
            setDescription('');
            setCategory('');
        }
    };

    // Add transaction to Firestore
    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        const user = auth.currentUser;

        if (!user) {
            setMessage('Error: User not authenticated');
            return false;
        }

        try {
            const db = getFirestore();
            const transactionsRef = collection(db, 'usernames', user.uid, 'transactions');
            await addDoc(transactionsRef, {
                ...transaction,
                date: transaction.date.toISOString(),
            });
            return true;
        } catch (error) {
            console.error('Error adding transaction:', error);
            setMessage('Error: Failed to add transaction');
            return false;
        }
    };

    const renderTransactionItem = ({ item }: { item: Transaction }) => (
        <View style={styles.transactionItem}>
            <View style={styles.transactionRow}>
                <Text style={styles.transactionDescription}>{item.description}</Text>
                <Text style={styles.transactionAmount}>
                    ${item.amount.toFixed(2)}
                </Text>
            </View>
            {item.category && (
                <Text style={styles.transactionCategory}>
                    Category: {item.category}
                </Text>
            )}
            <Text style={styles.transactionDate}>
                {item.date.toLocaleDateString()} • {item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
        </View>
    );

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <Text style={styles.title}>Add New Transaction</Text>

                {message ? (
                    <Text style={[
                        styles.message,
                        message.includes('Error') ? styles.errorMessage : styles.successMessage
                    ]}>
                        {message}
                    </Text>
                ) : null}

                <Text style={styles.label}>Amount</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    placeholderTextColor="#777777"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter transaction description"
                    placeholderTextColor="#777777"
                    value={description}
                    onChangeText={setDescription}
                />

                <Text style={styles.label}>Category (for budget tracking)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter category (e.g., Groceries, Food)"
                    placeholderTextColor="#777777"
                    value={category}
                    onChangeText={setCategory}
                />

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddTransaction}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>Add Transaction</Text>
                </TouchableOpacity>

                {budgets.length > 0 && (
                    <View style={styles.budgetSummary}>
                        <Text style={styles.sectionTitle}>Budget Categories</Text>
                        {budgets.map(budget => (
                            <View key={budget.id} style={styles.budgetItem}>
                                <Text style={styles.budgetName}>{budget.budgetName}</Text>
                                <Text style={styles.budgetProgress}>
                                    ${budget.amountSpent.toFixed(2)} / ${budget.amount.toFixed(2)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Transactions list */}
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                {transactions.length === 0 ? (
                    <Text style={styles.emptyText}>No transactions yet</Text>
                ) : (
                    <FlatList
                        data={transactions}
                        renderItem={renderTransactionItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                    />
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
        marginBottom: 30,
        textAlign: 'center',
        color: '#1DB954',
    },
    label: {
        fontSize: 18,
        marginBottom: 8,
        color: '#1DB954',
    },
    input: {
        borderWidth: 1,
        borderColor: '#333333',
        backgroundColor: '#333333',
        color: '#FFFFFF',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#1DB954',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 18,
    },
    message: {
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        textAlign: 'center',
    },
    errorMessage: {
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        color: '#ff6b6b',
    },
    successMessage: {
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        color: '#1DB954',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1DB954',
        marginBottom: 15,
    },
    emptyText: {
        color: '#777777',
        textAlign: 'center',
        marginTop: 10,
    },
    transactionItem: {
        backgroundColor: '#1a1a1a',
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
        color: '#ffffff',
        fontSize: 16,
    },
    transactionAmount: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    transactionCategory: {
        color: '#1DB954',
        fontSize: 14,
        marginBottom: 4,
    },
    transactionDate: {
        color: '#777777',
        fontSize: 12,
    },
    budgetSummary: {
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
    },
    budgetItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    budgetName: {
        color: '#ffffff',
        fontSize: 16,
    },
    budgetProgress: {
        color: '#1DB954',
        fontSize: 16,
    },
});