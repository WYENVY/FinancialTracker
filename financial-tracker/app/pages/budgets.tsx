import React, { useState } from 'react';
import {View, Text, FlatList, StyleSheet, Button, TextInput, ScrollView, Alert, TouchableOpacity, Modal} from 'react-native';

type Budget = {
    id: string;
    budgetName: string;
    amount: number;
    amountSpent: number;
    frequency?: 'weekly' | 'monthly' | 'annually';
    category?: string;
};

type BudgetStatus = 'normal' | 'warning' | 'exceeded';

export default function BudgetScreen() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form state
    const [budgetName, setBudgetName] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'annually'>('monthly');
    const [category, setCategory] = useState('');

    // Create a simple ID generator
    const generateId = () => Math.random().toString(36).substring(7);

    const handleSubmitBudget = () => {
        if (!budgetName.trim() || !amount) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const amountNumber = parseFloat(amount);
        if (isNaN(amountNumber)) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        const newBudget: Budget = {
            id: generateId(),
            budgetName: budgetName.trim(),
            amount: amountNumber,
            amountSpent: 0, // Start with 0 spent
            frequency,
            category: category.trim(),
        };

        setBudgets([...budgets, newBudget]);
        Alert.alert('Success', 'Budget created successfully!');
        resetForm();
        setShowCreateModal(false);
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
                {item.category && <Text>Category: {item.category}</Text>}
            </View>
        );
    };

    return (
        <View style={styles.container}>
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

                    <Text style={styles.label}>Category (Optional)</Text>
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
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 45,
        backgroundColor: '#000000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#000000',
    },
    budgetCard: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        backgroundColor: '#1a1a1a',
        elevation: 2,
    },
    budgetCardText: {
        color: '#ffffff',
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#76c75f'
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#ffffff',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    progressContainer: {
        height: 20,
        backgroundColor: '#333333',
        borderRadius: 10,
        marginVertical: 8,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBar: {
        height: '100%',
    },
    progressText: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        color: '#ffffff',
    },
    overBudget: {
        color: '#ff6b6b',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 4,
    },
    listContainer: {
        paddingBottom: 20,
    },
    modalContainer: {
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#000000',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#76c75f',
    },
    label: {
        marginBottom: 8,
        fontWeight: '500',
        color: '#ffffff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
    },
    editInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#76c75f',
        marginRight: 10,
    },
    frequencyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 8,
    },
    frequencyButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#333333',
        alignItems: 'center',
    },

    selectedButton: {
        backgroundColor: '#76c75f',
    },
    buttonText: {
        color: '#ffffff',
    },
    selectedText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    addButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#76c75f',
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    editButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    iconPickerContainer: {
        marginVertical: 10,
        backgroundColor: '#333333',
        borderRadius: 8,
        padding: 10,
    },
    editInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    editContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: '#1a1a1a',
    },
});