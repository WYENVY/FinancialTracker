import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

// Use the same Transaction type as the rest of the app
type Transaction = {
  id: string;
  description: string;
  amount: number;  // Positive for income, negative for expense
  date: Date;
  category?: string;
};

type Props = {
  transactions: Transaction[];
};

const RecentTransactions: React.FC<Props> = ({ transactions }) => {
  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.amount > 0;
    const color = isIncome ? '#1DB954' : '#e74c3c'; // Use app's green/red
    const formattedAmount = `${isIncome ? '+' : '-'}$${Math.abs(item.amount).toFixed(2)}`;
    const formattedDate = item.date instanceof Date
      ? item.date.toLocaleDateString()
      : new Date(item.date).toLocaleDateString();

    return (
      <View style={styles.transactionRow}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={[styles.amount, { color }]}>{formattedAmount}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#1a1a1a', // Match app background
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1DB954',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  description: {
    flex: 2,
    fontWeight: '600',
    color: '#fff',
  },
  amount: {
    flex: 1,
    fontWeight: '600',
    textAlign: 'right',
  },
  date: {
    flex: 1,
    color: '#888',
    fontWeight: '400',
    textAlign: 'right',
    fontSize: 12,
    marginLeft: 8,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default RecentTransactions;