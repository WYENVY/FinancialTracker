import { addDoc, collection, getFirestore, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../fireconfig';
import { styles } from '../style/BudgetScreen.styles';

type Budget = {
    id: string;
    budgetName: string;
    amount: number;
    amountSpent: number;
    frequency?: 'weekly' | 'monthly' | 'annually';
    category: string; // Changed to required (no ? mark)
};

type BudgetStatus = 'normal' | 'warning' | 'exceeded';

export default function BudgetScreen() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [budgetName, setBudgetName] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'annually'>('monthly');
    const [category, setCategory] = useState('');

    // Fetch budgets from Firestore
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();
        const budgetsRef = collection(db, 'usernames', user.uid, 'budgets');
        const q = query(budgetsRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedBudgets: Budget[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedBudgets.push({
                    id: doc.id,
                    budgetName: data.budgetName,
                    amount: data.amount,
                    amountSpent: data.amountSpent || 0,
                    frequency: data.frequency,
                    category: data.category || '' // Ensure category is never undefined
                });
            });
            setBudgets(fetchedBudgets);
        });

        return () => unsubscribe();
    }, []);

    const handleSubmitBudget = async () => {
        if (!budgetName.trim() || !amount || !category.trim()) { // Added category check
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const amountNumber = parseFloat(amount);
        if (isNaN(amountNumber)) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        try {
            const db = getFirestore();
            const budgetsRef = collection(db, 'usernames', user.uid, 'budgets');

            await addDoc(budgetsRef, {
                budgetName: budgetName.trim(),
                amount: amountNumber,
                amountSpent: 0, // Start with 0 spent
                frequency,
                category: category.trim(),
                createdAt: new Date().toISOString()
            });

            Alert.alert('Success', 'Budget created successfully!');
            resetForm();
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error adding budget:', error);
            Alert.alert('Error', 'Failed to create budget');
        }
    };

    const resetForm = () => {
        setBudgetName('');
        setAmount('');
        setFrequency('monthly');
        setCategory('');
    };

    const checkBudgetStatus = (budget: Budget): BudgetStatus => {
        if (budget.amount <= 0) return 'normal';
        const percentage = (budget.amountSpent / budget.amount) * 100;
        return percentage >= 100 ? 'exceeded' : percentage >= 90 ? 'warning' : 'normal';
    };

    const renderBudgetItem = ({ item }: { item: Budget }) => {
        const status = checkBudgetStatus(item);
        const statusColors = {
            normal: '#4CAF50',
            warning: '#FFC107',
            exceeded: '#F44336'
        };

        return (
            <View style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                    <Text style={styles.title}>{item.budgetName}</Text>
                    <View style={[styles.statusIndicator, { backgroundColor: statusColors[status] }]} />
                </View>
                <Text style={styles.budgetCardText}>Amount: ${item.amount.toFixed(2)}</Text>
                <Text style={styles.budgetCardText}>Spent: ${item.amountSpent.toFixed(2)}</Text>
                <Text style={styles.budgetCardText}>Frequency: {item.frequency}</Text>
                <Text style={[styles.budgetCardText, { color: 'white' }]}>Category: {item.category}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Added Budgets title */}
            <Text style={styles.screenTitle}>Budgets</Text>

            <Button
                title="Create New Budget"
                onPress={() => setShowCreateModal(true)}
                color="#76c75f"
            />

            {budgets.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.budgetCardText}>No budgets found. Create your first budget!</Text>
                </View>
            ) : (
                <FlatList
                    data={budgets}
                    keyExtractor={item => item.id}
                    renderItem={renderBudgetItem}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            {/* Create Budget Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                transparent={false}
                onRequestClose={() => {
                    setShowCreateModal(false);
                    resetForm();
                }}
            >
                <ScrollView contentContainerStyle={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Create New Budget</Text>

                    <Text style={styles.label}>Budget Name *</Text>
                    <TextInput
                        value={budgetName}
                        onChangeText={setBudgetName}
                        style={styles.input}
                        placeholder="e.g., Groceries"
                    />

                    <Text style={styles.label}>Amount *</Text>
                    <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholder="0.00"
                    />

                    <Text style={styles.label}>Frequency *</Text>
                    <View style={styles.frequencyContainer}>
                        {['weekly', 'monthly', 'annually'].map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.frequencyButton,
                                    frequency === option && styles.selectedButton
                                ]}
                                onPress={() => setFrequency(option as any)}
                            >
                                <Text style={frequency === option ? styles.selectedText : styles.buttonText}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Category *</Text>
                    <TextInput
                        value={category}
                        onChangeText={setCategory}
                        style={styles.input}
                        placeholder="e.g., Food, Transportation"
                    />

                    <View style={styles.buttonRow}>
                        <Button
                            title="Cancel"
                            color="#76c75f"
                            onPress={() => {
                                setShowCreateModal(false);
                                resetForm();
                            }}
                        />
                        <Button
                            title="Save Budget"
                            onPress={handleSubmitBudget}
                            color="#76c75f"
                        />
                    </View>
                </ScrollView>
            </Modal>
        </View>
    );
}