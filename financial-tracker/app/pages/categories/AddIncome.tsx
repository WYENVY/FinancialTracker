// AddIncome.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

export default function AddIncome() {
    const [date, setDate] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amountError, setAmountError] = useState('');

    // validate amount
    const validateForm = () => {
        const amountRegex = /^\d+(\.\d{0,2})?$/;
        if (!amountRegex.test(amount)) {
            setAmountError('Amount must be a valid number with up to 2 decimal places');
            return false;
        } else {
            setAmountError('');
            return true;
        }
    };

    const handleAddIncome = async () => {
        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser;

        if (!user || !amount || !title || !date || !validateForm()) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        try {
            const incomeData = {
                title,
                description,
                amount: parseFloat(amount),
                date: date.toISOString(),
                createdAt: new Date().toISOString(),
            };

            await addDoc(
                collection(db, 'usernames', user.uid, 'categories', 'Income', 'expenses'),
                incomeData
            );

            Alert.alert('Success', 'Income added!');
            setDate(null);
            setAmount('');
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error('Error adding income:', error);
            Alert.alert('Error', 'Failed to add income.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Add Income</Text>

            <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#052224', marginBottom: 4 }}>
                    Date <Text style={{ color: 'red' }}>*</Text>
                </Text>
                <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
                    <Text style={{ color: date ? '#000' : '#888' }}>
                        {date ? date.toLocaleDateString() : 'Select Date'}
                    </Text>
                </TouchableOpacity>
            </View>

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

            <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#052224', marginBottom: 4 }}>
                    Amount <Text style={{ color: 'red' }}>*</Text>
                </Text>
                <TextInput
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    style={[styles.input, amountError ? { borderColor: 'red' } : null]}
                    value={amount}
                    onChangeText={setAmount}
                />
                {amountError ? <Text style={{ color: 'red', fontSize: 12 }}>{amountError}</Text> : null}
            </View>

            <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#052224', marginBottom: 4 }}>
                    Title <Text style={{ color: 'red' }}>*</Text>
                </Text>
                <TextInput
                    placeholder="Enter title"
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                />
            </View>

            <TextInput
                placeholder="Description"
                style={styles.input}
                value={description}
                onChangeText={setDescription}
            />

            <TouchableOpacity style={styles.button} onPress={handleAddIncome}>
                <Text style={styles.buttonText}>Save Income</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#052224' },
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
