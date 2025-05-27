// Import necessary modules from React and React Native
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

// Define the Transaction type for type safety
type Transaction = {
  id: number;
  description: string;
  amount: number;  // Positive for income, negative for expense
  date: string;    // ISO string or any format
};

// Define the Props type for the component
type Props = {
  transactions: Transaction[];
};

// Main component to display recent transactions
const RecentTransactions: React.FC<Props> = ({ transactions }) => {
  // Function to render each transaction item
  const renderItem = ({ item }: { item: Transaction }) => {
    // Determine if the transaction is income or expense
    const isIncome = item.amount > 0;
    // Set color based on transaction type
    const color = isIncome ? 'green' : 'red';
    // Format the amount with + or - and two decimals
    const formattedAmount = `${isIncome ? '+' : '-'}$${Math.abs(item.amount).toFixed(2)}`;
    // Format the date to a readable string
    const formattedDate = new Date(item.date).toLocaleDateString();

    // Render the transaction row
    return (
      <View style={styles.transactionRow}>
        <Text style={[styles.description]}>{item.description}</Text>
        <Text style={[styles.amount, { color }]}>{formattedAmount}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    );
  };

  // Render the list of transactions
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Transactions</Text>
      <FlatList
        data={transactions} // Array of transactions to display
        keyExtractor={item => item.id.toString()} // Unique key for each item
        renderItem={renderItem} // Function to render each item
      />
    </View>
  );
};

// Styles for the component
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

// Export the component as default
export default RecentTransactions;