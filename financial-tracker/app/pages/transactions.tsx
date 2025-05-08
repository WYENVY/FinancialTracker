import React, { useState, useEffect } from 'react';
import {Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList} from 'react-native';
import {getFirestore, collection, addDoc, query, where, onSnapshot} from 'firebase/firestore';
import { auth } from '../fireconfig';

type Transaction = {
    id: string;
    amount: number;
    description: string;
    date: Date;
};

export default function AddTransactionScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');

    // Web-friendly alert function
    const showAlert = (title: string, message: string, onPress?: () => void) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}: ${message}`);
            if (onPress) onPress();
        } else {
            Alert.alert(title, message, [{ text: 'OK', onPress }]);
        }
    };

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();
        const transactionsRef = collection(db, 'usernames', user.uid, 'transactions');
        const q = query(transactionsRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedTransactions: Transaction[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedTransactions.push({
                    id: doc.id,
                    amount: data.amount,
                    description: data.description,
                    date: new Date(data.date)
                });
            });
            // Sort by date (newest first)
            fetchedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
            setTransactions(fetchedTransactions);
        });

        return () => unsubscribe();
    }, []);

    // Handle transaction submission
    const handleAddTransaction = async () => {
        if (!amount || isNaN(Number(amount))) {
            showAlert('Error', 'Please enter a valid amount');
            setMessage('Error: Please enter a valid amount');
            return;
        }

        if (!description.trim()) {
            showAlert('Error', 'Please enter a transaction description');
            setMessage('Error: Please enter a transaction description');
            return;
        }

        const transaction: Omit<Transaction, 'id'> = {
            amount: Number(amount),
            description: description.trim(),
            date: new Date()
        };

        const success = await addTransaction(transaction);

        if (success) {
            setAmount('');
            setDescription('');
            setMessage('Transaction added successfully!');
        }
    };

    // Add transaction to Firestore
    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        const user = auth.currentUser;

        if (!user) {
            showAlert('Error', 'User not authenticated');
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
            showAlert('Error', 'Failed to add transaction');
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
            <Text style={styles.transactionDate}>
                {item.date.toLocaleDateString()} • {item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
        </View>
    );

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <Text style={styles.title}>Add New Transaction</Text>

                {/* Display message for web (error or success) */}
                {message ? (
                    <Text style={[
                        styles.message,
                        message.includes('Error') ? styles.errorMessage : styles.successMessage
                    ]}>
                        {message}
                    </Text>
                ) : null}

                {/* Amount input */}
                <Text style={styles.label}>Amount</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    placeholderTextColor="#777777"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                />

                {/* Description input */}
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter transaction description"
                    placeholderTextColor="#777777"
                    value={description}
                    onChangeText={setDescription}
                />

                {/* Add button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddTransaction}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>Add Transaction</Text>
                </TouchableOpacity>

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
    transactionDate: {
        color: '#777777',
        fontSize: 12,
    },
});