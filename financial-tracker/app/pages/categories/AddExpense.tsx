import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';

export default function AddExpense({ presetCategory }: { presetCategory?: string }) {
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (presetCategory) setCategory(presetCategory);
    }, [presetCategory]);

    /*const updateIncomeTotal = async (db: any, user: any) => {
        try {
            // Get all income expenses
            const incomeExpensesRef = collection(db, 'usernames', user.uid, 'categories', 'Income', 'expenses');
            const snapshot = await getDocs(incomeExpensesRef);
            
            let totalIncome = 0;
            snapshot.forEach((doc) => {
                const data = doc.data();
                totalIncome += data.amount || 0;
            });

            // Update the income total in the Income category
            const incomeDocRef = doc(db, 'usernames', user.uid, 'categories', 'Income');
            await setDoc(incomeDocRef, { income: totalIncome }, { merge: true });

        } catch (error) {
            console.error('Error updating income total:', error);
        }
    };*/

    /*const updateIncomeTotal = async (db: any, user: any) => {
        try {
            // Get all income amounts
            const incomeExpensesRef = collection(db, 'usernames', user.uid, 'categories', 'Income', 'expenses');
            const incomeSnapshot = await getDocs(incomeExpensesRef);
            let totalIncome = 0;
            incomeSnapshot.forEach((doc) => {
                const data = doc.data();
                totalIncome += data.amount || 0;
            });
            
            // Get all other expense categories (excluding "Income")
            const categoriesRef = collection(db, 'usernames', user.uid, 'categories');
            const categoriesSnapshot = await getDocs(categoriesRef);
            
            let totalExpenses = 0;
            for (const categoryDoc of categoriesSnapshot.docs) {
                const categoryName = categoryDoc.id;
                if (categoryName === 'Income') continue;
                
                const expensesRef = collection(db, 'usernames', user.uid, 'categories', categoryName, 'expenses');
                const expensesSnapshot = await getDocs(expensesRef);
                expensesSnapshot.forEach((doc) => {
                    const data = doc.data();
                    totalExpenses += data.amount || 0;
                });
            }
            
            // Final total = income - expenses
            const finalTotal = totalIncome - totalExpenses;
            const incomeDocRef = doc(db, 'usernames', user.uid, 'categories', 'Income');
            await setDoc(incomeDocRef, { income: finalTotal }, { merge: true });
        } catch (error) {
            console.error('Error updating income total:', error);
        }
    };*/

    const updateIncomeTotal = async (db: any, user: any) => {
    try {
        // 1. Get all income entries
        const incomeExpensesRef = collection(db, 'usernames', user.uid, 'categories', 'Income', 'expenses');
        const incomeSnapshot = await getDocs(incomeExpensesRef);
        let totalIncome = 0;
        incomeSnapshot.forEach((doc) => {
            totalIncome += doc.data().amount || 0;
        });

        // 2. Manually define expense categories (unless you're storing category names)
        const expenseCategories = ['Food', 'Bills', 'Shopping', 'Transport']; // add your own

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
                date,
                createdAt: new Date().toISOString()
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

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Add Expense</Text>

            <TextInput
                placeholder="Date (any format)"
                style={styles.input}
                value={date}
                onChangeText={setDate}
            />

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
