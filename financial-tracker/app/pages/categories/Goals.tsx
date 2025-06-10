import React, { useEffect, useState } from 'react';
// Importing necessary React and React Native components and hooks
import { View, Text, ScrollView, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
// Importing Firestore functions for database operations
import { getFirestore, collection, addDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
// Importing authentication object
import { auth } from '../../fireconfig';
// Importing navigation hook
import { useNavigation } from '@react-navigation/native';
// Importing Modal component for popups
import { Modal } from 'react-native';
// Importing Ionicons for icons
import {Ionicons} from "@expo/vector-icons";
// Importing Firestore doc and updateDoc for updating documents
import { doc, updateDoc } from 'firebase/firestore';

 

// Initializing Firestore database instance
const db = getFirestore();

// Type definition for GoalForm component props
type GoalFormProps = {
    userId: string; // User ID for associating goals
    onGoalAdded?: () => void; // Optional callback when a goal is added
};

// Component for creating a new financial goal
const GoalForm = ({ userId, onGoalAdded }: GoalFormProps) => {
    // State for form fields
    const [amountError, setAmountError] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    // Navigation object for navigating between screens
    const navigation = useNavigation();
// validate amount
    const validateForm = () => {
        const amountRegex = /^\d+(\.\d{0,2})?$/;
        if (!amountRegex.test(targetAmount)) {
            setAmountError('Amount must be a valid number with up to 2 decimal places');
            return false;
        } else {
            setAmountError('');
            return true;
        }
    };
    // Handler for submitting the form and adding a new goal
    const handleSubmit = async () => {
        // Validate form fields
        if (!title.trim() || !category.trim() || !targetAmount || !validateForm()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        try {
            // Add new goal document to Firestore
            await addDoc(collection(db, 'financialGoals'), {
                userId,
                title,
                category,
                targetAmount: parseFloat(targetAmount),
                currentAmount: 0,
                createdAt: serverTimestamp(),
            });
            // Reset form fields
            setTitle('');
            setCategory('');
            setTargetAmount('');
            // Call callback if provided
            if (onGoalAdded) onGoalAdded();
            Alert.alert('Success', 'Goal added!');
        } catch (error) {
            // Handle errors
            console.error('Error adding goal:', error);
            Alert.alert('Error', 'Failed to add goal');
        }
    };

    // Render the goal creation form
    return (
        <View style={styles.formContainer}>
            {/* Back button to navigate to previous screen */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#052224" />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.formTitle}>Create Financial Goal</Text>
            {/* Input for goal title */}
            <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
            />
            {/* Input for goal category */}
            <TextInput
                style={styles.input}
                placeholder="Category"
                value={category}
                onChangeText={setCategory}
            />
            {/* Input for target amount */}
            <TextInput
                style={styles.input}
                placeholder="Target Amount"
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="numeric"
            />
            {/* Button to submit the form */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Add Goal</Text>
            </TouchableOpacity>
        </View>
    );
};

// Type definition for GoalList component props
type GoalListProps = {
    userId: string; // User ID for filtering goals
};

// Type definition for a Goal object
type Goal = {
    id: string; // Document ID
    title: string; // Goal title
    category: string; // Goal category
    targetAmount: number; // Target amount to save
    currentAmount: number; // Current saved amount
    createdAt?: any; // Timestamp of creation
    userId: string; // User ID
};


// Component for displaying and editing the list of goals
const GoalList = ({ userId }: GoalListProps) => {
    // State for goals, editing, and form fields
    const [goals, setGoals] = useState<Goal[]>([]);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedTargetAmount, setEditedTargetAmount] = useState('');
    const [addedAmount, setAddedAmount] = useState('');

    // Handler for updating a goal
    const handleUpdateGoal = async () => {
        if (!editingGoal) return;

        try {
            // Calculate new saved amount
            const newAmount = editingGoal.currentAmount + parseFloat(addedAmount || '0');
            // Reference to the goal document
            const goalDocRef = doc(db, 'financialGoals', editingGoal.id);
            // Update the goal document in Firestore
            await updateDoc(goalDocRef, {
                title: editedTitle,
                targetAmount: parseFloat(editedTargetAmount),
                currentAmount: newAmount,
            });

            // Reset editing state and fields
            setEditingGoal(null);
            setEditedTitle('');
            setEditedTargetAmount('');
            setAddedAmount('');
            Alert.alert('Success', 'Goal updated!');
        } catch (error) {
            // Handle errors
            console.error('Error updating goal:', error);
            Alert.alert('Error', 'Failed to update goal');
        }
    };

    // Effect to fetch and listen for changes to the user's goals
    useEffect(() => {
        // Query for goals belonging to the current user
        const q = query(collection(db, 'financialGoals'), where('userId', '==', userId));
        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
            // Map Firestore documents to Goal objects
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
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [userId]);

    // Group goals by category for display
    const groupedGoals = goals.reduce<Record<string, Goal[]>>((acc, goal) => {
        acc[goal.category] = acc[goal.category] || [];
        acc[goal.category].push(goal);
        return acc;
    }, {});

    // Render the list of goals, grouped by category
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
        {/* Title for the goals list */}
        <Text style={styles.listTitle}>Your Financial Goals</Text>

            {/* Show message if no goals exist */}
            {goals.length === 0 ? (
                <Text style={styles.emptyText}>No goals added yet.</Text>
            ) : (
                // Render each category section
                Object.entries(groupedGoals).map(([category, goals]) => (
                    <View key={category} style={styles.categorySection}>
                        <Text style={styles.categoryTitle}>{category}</Text>
                        {/* Render each goal in the category */}
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

            {/* Modal for editing a goal */}
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
                        {/* Input for editing title */}
                        <TextInput
                            style={styles.input}
                            placeholder="Title"
                            value={editedTitle}
                            onChangeText={setEditedTitle}
                        />
                        {/* Input for editing target amount */}
                        <TextInput
                            style={styles.input}
                            placeholder="Target Amount"
                            value={editedTargetAmount}
                            onChangeText={setEditedTargetAmount}
                            keyboardType="numeric"
                        />
                        {/* Input for adding to saved amount */}
                        <TextInput
                            style={styles.input}
                            placeholder="Add to Saved Amount"
                            value={addedAmount}
                            onChangeText={setAddedAmount}
                            keyboardType="numeric"
                        />
                        {/* Button to save changes */}
                        <TouchableOpacity style={styles.button} onPress={handleUpdateGoal}>
                            <Text style={styles.buttonText}>Save Changes</Text>
                        </TouchableOpacity>
                        {/* Button to cancel editing */}
                        <TouchableOpacity onPress={() => setEditingGoal(null)} style={{marginTop: 10}}>
                            <Text style={{color: 'red', textAlign: 'center'}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

// Component for displaying a single goal's progress and edit button
const GoalProgress = ({ goal, onEdit }: { goal: Goal; onEdit: () => void }) => {
    // Calculate progress percentage
    const progressPercentage = goal.targetAmount
        ? (goal.currentAmount / goal.targetAmount) * 100
        : 0;
    return (
        <View style={styles.goalCard}>
            {/* Goal title */}
            <Text style={styles.goalTitle}>{goal.title}</Text>
            {/* Progress bar */}
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
            </View>
            {/* Progress text */}
            <Text style={styles.progressText}>
                ${goal.currentAmount} of ${goal.targetAmount} saved ({progressPercentage.toFixed(1)}%)
            </Text>
            {/* Edit button */}
            <TouchableOpacity onPress={onEdit} style={{ marginTop: 8 }}>
                <Text style={{ color: '#0068FF' }}>Edit</Text>
            </TouchableOpacity>
        </View>
    );
};

// Main page component for displaying the goals page
export default function GoalsPage() {
    // Get current authenticated user
    const user = auth.currentUser;
    // Get user ID if user is signed in
    const userId = user ? user.uid : null;

    // Show error if user is not signed in
    if (!userId) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Please sign in to view your goals.</Text>
            </View>
        );
    }

    // Render the goal form and list for the signed-in user
    return (
        <View style={styles.pageContainer}>
            <GoalForm userId={userId} />
            <GoalList userId={userId} />
        </View>
    );

    
}

// Styles for the components
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
export { GoalForm, GoalProgress, GoalList };