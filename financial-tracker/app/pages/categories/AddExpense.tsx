// npx expo install @react-native-community/datetimepicker
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddExpense({ presetCategory }: { presetCategory?: string }) {
    const [date, setDate] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (presetCategory) setCategory(presetCategory);
    }, [presetCategory]);

    const formattedDate = date
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}/${date.getFullYear()}`
        : '';

    const handleAddExpense = async () => {
        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser;

        if (!user) {
            Alert.alert('Error', 'User not logged in.');
            return;
        }

        if (!category || !amount || !title || !date) {
            Alert.alert('Validation', 'Please fill in all required fields.');
            return;
        }

        try {
            const expenseData = {
                title,
                description,
                amount: parseFloat(amount),
                date: date.toISOString(),
                createdAt: new Date().toISOString(),
            };

            await addDoc(
                collection(db, 'usernames', user.uid, 'categories', category, 'expenses'),
                expenseData
            );

            Alert.alert('Success', 'Expense added!');
            setDate(null);
            if (!presetCategory) setCategory('');
            setAmount('');
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error('Error adding expense: ', error);
            Alert.alert('Error', 'Failed to add expense.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Add Expense</Text>

            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
                <Text style={{ color: date ? '#000' : '#888' }}>
                    {formattedDate || 'Select Date'}
                </Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={date || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowPicker(false);
                        if (selectedDate) setDate(selectedDate);
                    }}
                />
            )}

            {!presetCategory && (
                <TextInput
                    placeholder="Category (e.g., Entertainment)"
                    style={styles.input}
                    value={category}
                    onChangeText={setCategory}
                />
            )}

            <TextInput
                placeholder="Amount"
                keyboardType="numeric"
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
            />
            <TextInput
                placeholder="Title"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                placeholder="Description"
                style={styles.input}
                value={description}
                onChangeText={setDescription}
            />

            <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
                <Text style={styles.buttonText}>Save Expense</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F0FAF8',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        alignSelf: 'center',
        color: '#052224',
    },
    input: {
        borderWidth: 1,
        borderColor: '#aaa',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#00D09E',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#052224',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
