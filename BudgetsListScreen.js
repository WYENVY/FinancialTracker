import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

export default function BudgetsListScreen({ navigation }) {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    const unsub = onSnapshot(
      collection(db, `users/${user.uid}/budgets`),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBudgets(data);
      }
    );
    return unsub;
  }, []);

  const renderItem = ({ item }) => {
    const progress = item.amountSpent / item.amount * 100;
    return (
      <View style={styles.budgetCard}>
        <Text style={styles.title}>{item.budgetName}</Text>
        <Text>Amount: ${item.amount}</Text>
        <Text>Spent: ${item.amountSpent}</Text>
        <Text>Progress: {progress.toFixed(1)}%</Text>
      </View>
    );
  };

  return (
    <View>
      <Button title="Create New Budget" onPress={() => navigation.navigate('CreateBudget')} />
      <FlatList
        data={budgets}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  budgetCard: { padding: 16, borderBottomWidth: 1 },
  title: { fontWeight: 'bold' },
});
