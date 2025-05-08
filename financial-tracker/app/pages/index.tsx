import { collection, getFirestore, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { auth } from '../fireconfig';

type Transaction = {
    id: string;
    amount: number;
    description: string;
    date: Date;
};

type Budget = {
    id: string;
    budgetName: string;
    amount: number;
    amountSpent: number;
    frequency?: 'weekly' | 'monthly' | 'annually';
    category: string;
};

type BudgetAlert = {
    id: string;
    budgetName: string;
    percentage: number;
    type: 'warning' | 'exceeded';
};

export default function HomeScreen() {
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);
    const [showAlerts, setShowAlerts] = useState<boolean>(false);

    // Fetch recent transactions from Firestore
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
            // Sort by date (newest first) and take first 3
            const sortedTransactions = fetchedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
            setRecentTransactions(sortedTransactions.slice(0, 3));
        });

        return () => unsubscribe();
    }, []);

    // Fetch budgets and check for alerts
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();
        const budgetsRef = collection(db, 'usernames', user.uid, 'budgets');
        const q = query(budgetsRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const alerts: BudgetAlert[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const budget: Budget = {
                    id: doc.id,
                    budgetName: data.budgetName,
                    amount: data.amount,
                    amountSpent: data.amountSpent || 0,
                    frequency: data.frequency,
                    category: data.category || ''
                };
                
                // Check budget status
                if (budget.amount > 0) {
                    const percentage = (budget.amountSpent / budget.amount) * 100;
                    
                    if (percentage >= 100) {
                        alerts.push({
                            id: budget.id,
                            budgetName: budget.budgetName,
                            percentage: percentage,
                            type: 'exceeded'
                        });
                    } else if (percentage >= 90) {
                        alerts.push({
                            id: budget.id,
                            budgetName: budget.budgetName,
                            percentage: percentage,
                            type: 'warning'
                        });
                    }
                }
            });
            
            setBudgetAlerts(alerts);
            if (alerts.length > 0) {
                setShowAlerts(true);
                
                // Set a timer to hide alerts after 5 seconds
                const timer = setTimeout(() => {
                    setShowAlerts(false);
                }, 5000);
                
                return () => clearTimeout(timer);
            }
        });

        return () => unsubscribe();
    }, []);

    // Render each transaction item
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

    // Render all alerts
    const renderAlerts = () => {
        if (!showAlerts || budgetAlerts.length === 0) return null;
        
        return (
            <View style={styles.alertsWrapper}>
                {budgetAlerts.map((alert) => {
                    const alertStyle = alert.type === 'exceeded' ? styles.alertExceeded : styles.alertWarning;
                    
                    let message = '';
                    if (alert.type === 'exceeded') {
                        message = `Warning: Your "${alert.budgetName}" budget has exceeded 100% of its limit`;
                    } else {
                        message = `Warning: Your "${alert.budgetName}" budget has exceeded 90% of its limit`;
                    }
                    
                    return (
                        <View key={alert.id} style={[styles.alertContainer, alertStyle]}>
                            <Text style={styles.alertText}>{message}</Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Finova</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.welcomeText}>Welcome to your finance app!</Text>

                {/* Budget Alerts Popups */}
                {renderAlerts()}

                {/* Recent Transactions Section */}
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        padding: 20,
        paddingTop: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1DB954',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    welcomeText: {
        fontSize: 20,
        color: '#FFFFFF',
        marginBottom: 30,
        textAlign: 'center',
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
    alertsWrapper: {
        marginBottom: 20,
    },
    alertContainer: {
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    alertWarning: {
        backgroundColor: '#FFC107',
    },
    alertExceeded: {
        backgroundColor: '#F44336',
    },
    alertText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});