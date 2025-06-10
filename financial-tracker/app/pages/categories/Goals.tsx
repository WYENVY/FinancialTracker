import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, addDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import { auth } from '../../fireconfig';
import { useNavigation } from '@react-navigation/native';
import { Modal } from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import { doc, updateDoc } from 'firebase/firestore';

const db = getFirestore();

type GoalFormProps = {
    userId: string;
    onGoalAdded?: () => void;
};

// Generates the goal form
const GoalForm = ({ userId, onGoalAdded }: GoalFormProps) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const navigation = useNavigation();
    const [amountError, setAmountError] = useState('');

    const validateForm = () => {
        const amountRegex = /^\d+(\.\d{0,2})?$/;
        if (!title.trim() || !category.trim() || !targetAmount) {
            Alert.alert('Error', 'Please fill in all fields');
            return false;
        }
        if (!amountRegex.test(targetAmount)) {
            setAmountError('Amount must be a valid number with up to 2 decimal places');
            return false;
        } else {
            setAmountError('');
            return true;
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#052224" />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
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
            {amountError ? <Text style={{ color: 'red', marginBottom: 8 }}>{amountError}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Add Goal</Text>
            </TouchableOpacity>
        </View>
    );
};

type GoalListProps = {
    userId: string;
};

type Goal = {
    id: string;
    title: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    createdAt?: any;
    userId: string;
};

// Edit button so the user can update the goal
const GoalList = ({ userId }: GoalListProps) => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedTargetAmount, setEditedTargetAmount] = useState('');
    const [addedAmount, setAddedAmount] = useState('');

    const handleUpdateGoal = async () => {
        if (!editingGoal) return;

        try {
            const newAmount = editingGoal.currentAmount + parseFloat(addedAmount || '0');
            const goalDocRef = doc(db, 'financialGoals', editingGoal.id);
            await updateDoc(goalDocRef, {
                title: editedTitle,
                targetAmount: parseFloat(editedTargetAmount),
                currentAmount: newAmount,
            });

            setEditingGoal(null);
            setEditedTitle('');
            setEditedTargetAmount('');
            setAddedAmount('');
            Alert.alert('Success', 'Goal updated!');
        } catch (error) {
            console.error('Error updating goal:', error);
            Alert.alert('Error', 'Failed to update goal');
        }
    };

    useEffect(() => {
        const q = query(collection(db, 'financialGoals'), where('userId', '==', userId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const goalData: Goal[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    category: data.category,
                    targetAmount: data.targetAmount,
                    currentAmount: data.currentAmount,
                    userId: data.userId,
                    createdAt: data.createdAt,
                };
            });
            setGoals(goalData);
        });
        return () => unsubscribe();
    }, [userId]);

    const groupedGoals = goals.reduce<Record<string, Goal[]>>((acc, goal) => {
        acc[goal.category] = acc[goal.category] || [];
        acc[goal.category].push(goal);
        return acc;
    }, {});

    return (
        <ScrollView
            contentContainerStyle={[
                styles.scrollContent,
                goals.length === 0
                    ? { paddingTop: 30 }
                    : { paddingTop: 10 }
            ]}
            style={{ flex: 1 }}
        >
        <Text style={styles.listTitle}>Your Financial Goals</Text>

            {goals.length === 0 ? (
                <Text style={styles.emptyText}>No goals added yet.</Text>
            ) : (
                Object.entries(groupedGoals).map(([category, goals]) => (
                    <View key={category} style={styles.categorySection}>
                        <Text style={styles.categoryTitle}>{category}</Text>
                        {goals.map((goal) => (
                            <View key={goal.id}>
                                <GoalProgress
                                    goal={goal}
                                    onEdit={() => {
                                        setEditingGoal(goal);
                                        setEditedTitle(goal.title);
                                        setEditedTargetAmount(goal.targetAmount.toString());
                                        setAddedAmount('');
                                    }}
                                />
                            </View>
                        ))}
                    </View>
                ))
            )}

            <Modal visible={!!editingGoal} animationType="slide" transparent>
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20
                }}>
                    <View style={{backgroundColor: 'white', padding: 20, borderRadius: 10, width: '100%'}}>
                        <Text style={{fontWeight: 'bold', fontSize: 18, marginBottom: 10}}>Edit Goal</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Title"
                            value={editedTitle}
                            onChangeText={setEditedTitle}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Target Amount"
                            value={editedTargetAmount}
                            onChangeText={setEditedTargetAmount}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Add to Saved Amount"
                            value={addedAmount}
                            onChangeText={setAddedAmount}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity style={styles.button} onPress={handleUpdateGoal}>
                            <Text style={styles.buttonText}>Save Changes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setEditingGoal(null)} style={{marginTop: 10}}>
                            <Text style={{color: 'red', textAlign: 'center'}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};
// progress bar on the goal
const GoalProgress = ({ goal, onEdit }: { goal: Goal; onEdit: () => void }) => {
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
            <TouchableOpacity onPress={onEdit} style={{ marginTop: 8 }}>
                <Text style={{ color: '#0068FF' }}>Edit</Text>
            </TouchableOpacity>
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
        <View style={styles.pageContainer}>
            <GoalForm userId={userId} />
            <GoalList userId={userId} />
        </View>
    );
}


const styles = StyleSheet.create({
    container: { backgroundColor: '#F0FAF8', padding: 16, paddingBottom: 60, },
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
    backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backText: { marginLeft: 8, fontSize: 16, color: '#052224' },

    scrollContent: { padding: 20, paddingBottom: 80, },
    emptyText: { textAlign: 'center', marginTop: 10, color: '#888', },
    pageContainer: { flex: 1, backgroundColor: '#F0FAF8', },
});