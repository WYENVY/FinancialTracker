import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';

type Props = {
  presetCategory: string;
};

export default function AddExpense({ presetCategory }: Props) {
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dateError, setDateError] = useState('');
    const [amountError, setAmountError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [titleError, setTitleError] = useState('');

    useEffect(() => {
        if (presetCategory) setCategory(presetCategory);
    }, [presetCategory]);
    
    const updateIncomeTotal = async (db: any, user: any) => {
    try {
        // 1. Get all income entries
        const incomeExpensesRef = collection(db, 'usernames', user.uid, 'categories', 'Income', 'expenses');
        const incomeSnapshot = await getDocs(incomeExpensesRef);
        let totalIncome = 0;
        incomeSnapshot.forEach((doc) => {
            totalIncome += doc.data().amount || 0;
        });

        // 2. Manually define expense categories
        const expenseCategories = ['Food', 'Entertainment', 'Gifts', 'Goals', 'Groceries', 'Rent', 'Transport']; 

        let totalExpenses = 0;
        for (const category of expenseCategories) {
            const expensesRef = collection(db, 'usernames', user.uid, 'categories', category, 'expenses');
            const expensesSnapshot = await getDocs(expensesRef);
            expensesSnapshot.forEach((doc) => {
                totalExpenses += doc.data().amount || 0;
            });
        }

        // 3. Save the result
        const finalTotal = totalIncome - totalExpenses;
        const incomeDocRef = doc(db, 'usernames', user.uid, 'categories', 'Income');
        await setDoc(incomeDocRef, { income: finalTotal }, { merge: true });

    } catch (error) {
        console.error('Error updating income total:', error);
    }
    };


    const handleAddExpense = async () => {
        const isValid = validateInputs();
        if (!isValid) {
            setSubmitError('Please correct the highlighted fields before submitting.');
            return;
        }
        setSubmitError('');

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

              const parts = date.split('/');
              const day = parseInt(parts[0]);
              const month = parseInt(parts[1]);
              const year = parseInt(parts[2]);

            const expenseData = {
                title,
                description,
                amount: Number(parseFloat(amount).toFixed(2)),
                date,
                createdAt: new Date().toISOString(),
                day,
                month,
                year
            };

            await addDoc(
                collection(db, 'usernames', user.uid, 'categories', category, 'expenses'),
                expenseData
            );

            // If this is an income entry, update the total income
            //if (category === 'Income') {
                await updateIncomeTotal(db, user);
            //}

            Alert.alert('Success', 'Expense added!');
            setDate('');
            if (!presetCategory) setCategory('');
            setAmount('');
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error('Error adding expense: ', error);
            Alert.alert('Error', 'Failed to add expense.');
        }
    };
    
    const validateInputs = () => {
        let isValid = true;
        // Date validation
        const parts = date.split('/');
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parts[2];
        
        if (parts.length !== 3 || date.length !== 10) {
            setDateError('Date must be in DD/MM/YYYY format');
            isValid = false;
        } else if (isNaN(day) || day < 1 || day > 31) {
            setDateError('Day must be between 1 and 31');
            isValid = false;
        } else if (isNaN(month) || month < 1 || month > 12) {
            setDateError('Month must be between 1 and 12');
            isValid = false;
        } else {
            setDateError('');
        }
        
        // Amount validation
        const amountRegex = /^\d+(\.\d{0,2})?$/;
        if (!amountRegex.test(amount)) {
            setAmountError('Amount must be a valid number with up to 2 decimal places');
            isValid = false;
        } else {
            setAmountError('');
        }

        if (!title.trim()) {
            setTitleError('Title is required');
            isValid = false;
        } else {
            setTitleError('');
        }

        return isValid;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>
                {presetCategory === 'Income' ? 'Add Income Entry' : 'Add Expense'}
            </Text>

            <TextInput
            placeholder="Date (DD/MM/YYYY)"
            style={styles.input}
            value={date}
            keyboardType="numeric"
            maxLength={10}
            onChangeText={(text) => {
                let cleaned = text.replace(/[^\d]/g, ''); // remove non-numeric
                
                // Limit to 8 digits max (DDMMYYYY)
                if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
                let formatted = '';
                if (cleaned.length <= 2) {
                    formatted = cleaned;
                } else if (cleaned.length <= 4) {
                    formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
                } else {
                    formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
                }
                setDate(formatted);
            }}
            />

            {dateError ? (
                <Text style={{ color: 'red', marginBottom: 8 }}>{dateError}</Text>
            ) : null}

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

            {amountError ? <Text style={{ color: 'red' }}>{amountError}</Text> : null}

            <TextInput
                placeholder="Title"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
            />

            {titleError ? <Text style={{ color: 'red' }}>{titleError}</Text> : null}

            <TextInput
                placeholder="Description"
                style={styles.input}
                value={description}
                onChangeText={setDescription}
            />

            <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
                <Text style={styles.buttonText}>
                    {presetCategory === 'Income' ? 'Save Entry' : 'Save Expense'}
                </Text>
            </TouchableOpacity>

            {submitError ? <Text style={{ color: 'red', marginBottom: 10 }}>{submitError}</Text> : null}

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
