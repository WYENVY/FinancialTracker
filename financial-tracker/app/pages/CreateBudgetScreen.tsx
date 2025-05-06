import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Picker } from 'react-native';
import { db, auth } from '../fireconfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CreateBudgetScreen({ navigation }) {
    const [budgetName, setBudgetName] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState('monthly');
    const [category, setCategory] = useState('');

    const handleCreateBudget = async () => {
        const user = auth.currentUser;
        if (!user) return alert('Please log in');

        try {
            await addDoc(collection(db, `users/${user.uid}/budgets`), {
                budgetName,
                amount: parseFloat(amount),
                frequency,
                category,
                amountSpent: 0,  // initial spent amount
                createdAt: serverTimestamp(),
            });
            alert('Budget created!');
            navigation.goBack(); // Navigate back to the budget list
        } catch (error) {
            alert('Error creating budget: ' + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text>Budget Name</Text>
            <TextInput value={budgetName} onChangeText={setBudgetName} style={styles.input} />

            <Text>Amount</Text>
            <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} />

            <Text>Frequency</Text>
            <Picker selectedValue={frequency} onValueChange={setFrequency}>
                <Picker.Item label="Weekly" value="weekly" />
                <Picker.Item label="Monthly" value="monthly" />
                <Picker.Item label="Annually" value="annually" />
            </Picker>

            <Text>Category (Optional)</Text>
            <TextInput value={category} onChangeText={setCategory} style={styles.input} />

            <Button title="Create Budget" onPress={handleCreateBudget} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    input: { borderBottomWidth: 1, marginBottom: 12 },
});