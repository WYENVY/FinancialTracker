
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { db, auth } from '../fireconfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CreateGoalScreen({ navigation }) {
    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');

    const handleCreateGoal = async () => {
        const user = auth.currentUser;
        if (!user) return alert('Please log in');

        try {
            await addDoc(collection(db, `users/${user.uid}/savingsGoals`), {
                goalName,
                targetAmount: parseFloat(targetAmount),
                currentAmount: 0, // Start with 0 saved
                deadline,
                createdAt: serverTimestamp(),
            });
            alert('Goal created!');
            navigation.goBack(); // Navigate back to goals list
        } catch (error) {
            alert('Error creating goal: ' + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text>Goal Name</Text>
            <TextInput value={goalName} onChangeText={setGoalName} style={styles.input} />

            <Text>Target Amount</Text>
            <TextInput value={targetAmount} onChangeText={setTargetAmount} keyboardType="numeric" style={styles.input} />

            <Text>Deadline (YYYY-MM-DD)</Text>
            <TextInput value={deadline} onChangeText={setDeadline} style={styles.input} />

            <Button title="Create Goal" onPress={handleCreateGoal} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    input: { borderBottomWidth: 1, marginBottom: 12 },
});