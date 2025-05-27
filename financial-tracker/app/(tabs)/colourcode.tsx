import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

type Transaction = {
  id: number;
  description: string;
  amount: number;  // Positive for income, negative for expense
  date: string;    // ISO string or any format
};

type Props = {
  transactions: Transaction[];
};

const RecentTransactions: React.FC<Props> = ({ transactions }) => {
  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.amount > 0;
    const color = isIncome ? 'green' : 'red';
    const formattedAmount = `${isIncome ? '+' : '-'}$${Math.abs(item.amount).toFixed(2)}`;
    const formattedDate = new Date(item.date).toLocaleDateString();

    return (
      <View style={styles.transactionRow}>
        <Text style={[styles.description]}>{item.description}</Text>
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
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#76c75f',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
    color: '#666',
    fontWeight: '400',
    textAlign: 'right',
    fontSize: 12,
    marginLeft: 8,
  },
});

export default RecentTransactions;