import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth } from '../fireconfig';
import { useNavigation } from '@react-navigation/native';
import DropdownMenu from '@/components/DropdownMenu';


type Transaction = {
    id: string;
    amount: number;
    description: string;
    date: Date;
};

export default function HomeScreen() {
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [greeting, setGreeting] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) setGreeting('Morning');
        else if (hour >= 12 && hour < 17) setGreeting('Afternoon');
        else if (hour >= 17 && hour < 21) setGreeting('Evening');
        else setGreeting('Night');

        // Optional: Update greeting every hour
        const interval = setInterval(() => {
            const updatedHour = new Date().getHours();
            if (updatedHour >= 5 && updatedHour < 12) setGreeting('Morning');
            else if (updatedHour >= 12 && updatedHour < 17) setGreeting('Afternoon');
            else if (updatedHour >= 17 && updatedHour < 21) setGreeting('Evening');
            else setGreeting('Night');
        }, 3600000); // Update every hour

        return () => clearInterval(interval);
    }, []);

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
            // Adds the first three transactions to the homepage
            const sortedTransactions = fetchedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
            setRecentTransactions(sortedTransactions.slice(0, 3));
        });

        return () => unsubscribe();
    }, []);

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
        <View style={styles.container}>
            {/* Header stays on green background */}
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.title}>Finova</Text>
                    <DropdownMenu />
                </View>
                <Text style={styles.welcomeText}>Hi, Welcome Back</Text>
                <Text style={styles.welcomeText}>Good {greeting}</Text>
            </View>

            {/* White background container */}
            <View style={styles.whiteSheet}>
                {/* Content starts a bit lower */}
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
        top: height * 0.40, // Starts 30% down the screen
        bottom: 0,         // Goes to bottom
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
});