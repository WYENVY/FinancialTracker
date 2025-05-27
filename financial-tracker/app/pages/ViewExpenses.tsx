/*import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, onSnapshot, getFirestore } from 'firebase/firestore';
import { auth } from '../fireconfig';
import { getAuth } from 'firebase/auth';

type Expense = {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
};

export default function ViewExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const db = getFirestore();
  const user = auth.currentUser;

  console.log("Querying expenses for user:", user?.uid);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) {
          console.log('No user is logged in');
          return;
        }
    }
        console.log('Fetching for user:', user.uid);

  const expensesRef = collection(db, 'users', user.uid, 'categories', 'test', 'expenses');

  const unsubscribe = onSnapshot(expensesRef, snapshot => {
    const fetchedExpenses: Expense[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Expense[];

    setExpenses(fetchedExpenses);
  });

  return () => unsubscribe();
}, [user]);

  const renderItem = ({ item }: { item: Expense }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>Description: {item.description}</Text>
      <Text>Amount: ${item.amount}</Text>
      <Text>Date: {item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Expenses (test category)</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No expenses found in 'test'.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#DFF7E2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: 'gray',
  },
});
*/
/*import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();

export default function ExpensesList() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const user = getAuth().currentUser;
        console.log('👀 useEffect fired for ExpensesList');
        console.log('🔐 Current user:', user);

        if (!user) {
          console.log('⚠️ No user is logged in');
          return;
        }

        // 🔥 Reference to: users/{uid}/categories/test/expenses
        const expensesRef = collection(
          db,
          'users',
          user.uid,
          'categories',
          'test',
          'expenses'
        );

        console.log(
          '📂 Path:',
          `users/${user.uid}/categories/test/expenses`
        );

        const snapshot = await getDocs(expensesRef);

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log('Fetched expenses:', data);
        setExpenses(data);
      } catch (error) {
        console.error('🔥 Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  if (loading) return <Text style={styles.message}>Loading expenses...</Text>;

  return (
    <View style={styles.container}>
      {expenses.length === 0 ? (
        <Text style={styles.message}>No expenses found in "test" category</Text>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.amount}>${item.amount}</Text>
              <Text style={styles.date}>Date: {item.date}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  itemContainer: {
    backgroundColor: '#E2F3F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 16,
    color: '#007A63',
    marginTop: 4,
  },
  date: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    color: '#333',
  },
  message: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#999',
  },
});*/
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();

export default function ExpensesList() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('👀 useEffect fired for ExpensesList');

    const user = getAuth().currentUser;
    console.log('🔐 Current user:', user);

    if (!user) {
      console.log('⚠️ No user is logged in');
      setLoading(false);
      return;
    }

    try {
      const expensesRef = collection(
        db,
        'users',
        user.uid,
        'categories',
        'test',
        'expenses'
      );

      const unsubscribe = onSnapshot(expensesRef, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log('✅ Fetched expenses:', data);
        setExpenses(data);
        setLoading(false);
      });

      return () => unsubscribe(); // Cleanup on unmount
    } catch (err) {
      console.error('❌ Error fetching expenses:', err);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00D09E" />
      </View>
    );
  }

  if (expenses.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>No expenses found in "test"</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={expenses}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text>Amount: ₹{item.amount}</Text>
          <Text>Description: {item.description}</Text>
          <Text>Date: {item.date}</Text>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
  },
});


