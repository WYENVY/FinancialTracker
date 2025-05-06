import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export default function AddExpenseScreen({ route, navigation }) {
  const { budgetId } = route.params;  
  const [expenseAmount, setExpenseAmount] = useState('');

  const handleAddExpense = async () => {
    const user = auth.currentUser;
    if (!user) return alert('Please log in');

    try {
      const budgetRef = doc(db, `users/${user.uid}/budgets`, budgetId);
      await updateDoc(budgetRef, {
        amountSpent: increment(parseFloat(expenseAmount)),
      });
      alert('Expense added!');
      navigation.goBack(); // Go back to the budget list
    } catch (error) {
      alert('Error adding expense: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Expense Amount</Text>
      <TextInput
        value={expenseAmount}
        onChangeText={setExpenseAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Add Expense" onPress={handleAddExpense} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderBottomWidth: 1, marginBottom: 12 },
});
