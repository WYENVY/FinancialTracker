import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, addDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import { auth } from '../fireconfig';

const db = getFirestore();

const GoalForm = ({ userId, onGoalAdded }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !category.trim() || !targetAmount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await addDoc(collection(db, 'financialGoals'), {
        userId,
        title,
        category,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setCategory('');
      setTargetAmount('');
      if (onGoalAdded) onGoalAdded();
      Alert.alert('Success', 'Goal added!');
    } catch (error) {
      console.error('Error adding goal:', error);
      Alert.alert('Error', 'Failed to add goal');
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create Financial Goal</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Target Amount"
        value={targetAmount}
        onChangeText={setTargetAmount}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Add Goal</Text>
      </TouchableOpacity>
    </View>
  );
};

const GoalList = ({ userId }) => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'financialGoals'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(goalData);
    });
    return () => unsubscribe();
  }, [userId]);

  // Group goals by category
  const groupedGoals = goals.reduce((acc, goal) => {
    acc[goal.category] = acc[goal.category] || [];
    acc[goal.category].push(goal);
    return acc;
  }, {});

  return (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>Your Financial Goals</Text>
      {Object.entries(groupedGoals).map(([category, goals]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          {goals.map((goal) => (
            <GoalProgress key={goal.id} goal={goal} />
          ))}
        </View>
      ))}
    </View>
  );
};

const GoalProgress = ({ goal }) => {
  const progressPercentage = goal.targetAmount
    ? (goal.currentAmount / goal.targetAmount) * 100
    : 0;
  return (
    <View style={styles.goalCard}>
      <Text style={styles.goalTitle}>{goal.title}</Text>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
      </View>
      <Text style={styles.progressText}>
        ${goal.currentAmount} of ${goal.targetAmount} saved ({progressPercentage.toFixed(1)}%)
      </Text>
    </View>
  );
};

export default function GoalsPage() {
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  if (!userId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Please sign in to view your goals.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GoalForm userId={userId} />
      <GoalList userId={userId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FAF8', padding: 16 },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  formTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#052224' },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#F9F9F9',
  },
  button: {
    backgroundColor: '#00D09E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  listContainer: { flex: 1 },
  listTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#052224' },
  categorySection: { marginBottom: 16 },
  categoryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6, color: '#0984E3' },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  goalTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 4, color: '#052224' },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#76c75f',
    borderRadius: 5,
  },
  progressText: { fontSize: 13, color: '#333' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 16 },
});