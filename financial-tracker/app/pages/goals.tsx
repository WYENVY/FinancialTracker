import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert
} from 'react-native';
import { getFirestore, collection, addDoc, onSnapshot, query, where, doc } from 'firebase/firestore';
import { auth } from '../fireconfig';

type Goal = {
    id: string;
    goalName: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
};

export default function GoalsScreen() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');

    // Fetch goals from Firestore
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();
        const goalsRef = collection(db, 'usernames', user.uid, 'goals');
        const q = query(goalsRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedGoals: Goal[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedGoals.push({
                    id: doc.id,
                    goalName: data.goalName,
                    targetAmount: data.targetAmount,
                    currentAmount: data.currentAmount || 0,
                    deadline: data.deadline
                });
            });
            setGoals(fetchedGoals);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateGoal = async () => {
        if (!goalName.trim() || !targetAmount) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const targetAmountNumber = parseFloat(targetAmount);
        const currentAmountNumber = parseFloat(currentAmount) || 0;

        if (isNaN(targetAmountNumber)) {
            Alert.alert('Error', 'Please enter a valid target amount');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        try {
            const db = getFirestore();
            const goalsRef = collection(db, 'usernames', user.uid, 'goals');

            await addDoc(goalsRef, {
                goalName: goalName.trim(),
                targetAmount: targetAmountNumber,
                currentAmount: currentAmountNumber,
                deadline: deadline.trim(),
                createdAt: new Date().toISOString()
            });

            Alert.alert('Success', 'Goal created successfully!');
            resetForm();
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error adding goal:', error);
            Alert.alert('Error', 'Failed to create goal');
        }
    };

    const handleAddMoney = async (goalId: string, amountToAdd: number) => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        try {
            const db = getFirestore();
            const goalRef = doc(db, 'usernames', user.uid, 'goals', goalId);

            // In a real app, you would use updateDoc here
            // For now, we'll update the local state
            setGoals(goals.map(goal =>
                goal.id === goalId
                    ? { ...goal, currentAmount: goal.currentAmount + amountToAdd }
                    : goal
            ));
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        try {
            const db = getFirestore();
            const goalRef = doc(db, 'usernames', user.uid, 'goals', goalId);

            // In a real app, you would use deleteDoc here
            // For now, we'll update the local state
            setGoals(goals.filter(goal => goal.id !== goalId));
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    const resetForm = () => {
        setGoalName('');
        setTargetAmount('');
        setCurrentAmount('');
        setDeadline('');
    };

    const renderGoalItem = ({ item }: { item: Goal }) => {
        const progress = (item.currentAmount / item.targetAmount) * 100;
        const progressPercentage = Math.min(progress, 100);
        const isCompleted = progressPercentage >= 100;

        return (
            <View style={[
                styles.goalCard,
                isCompleted && styles.completedCard
            ]}>
                <View style={styles.goalHeader}>
                    <Text style={styles.goalName}>{item.goalName}</Text>
                    {isCompleted && (
                        <Text style={styles.completedBadge}>COMPLETED!</Text>
                    )}
                </View>

                <Text style={styles.amountText}>
                    Saved: ${item.currentAmount.toFixed(2)} / ${item.targetAmount.toFixed(2)}
                </Text>

                <View style={styles.progressContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            {
                                width: `${progressPercentage}%`,
                                backgroundColor: isCompleted ? '#76c75f' : '#4a90e2'
                            }
                        ]}
                    />
                    <Text style={styles.progressText}>{progressPercentage.toFixed(1)}%</Text>
                </View>

                {item.deadline && (
                    <Text style={styles.deadlineText}>Target Date: {item.deadline}</Text>
                )}

                <View style={styles.goalActions}>
                    <TouchableOpacity
                        style={styles.addMoneyButton}
                        onPress={() => handleAddMoney(item.id, 10)}
                    >
                        <Text style={styles.buttonText}>Add $10</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteGoal(item.id)}
                    >
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Added Goals title */}
            <Text style={styles.screenTitle}>Goals</Text>

            <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
            >
                <Text style={styles.createButtonText}>Create New Goal</Text>
            </TouchableOpacity>

            {goals.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No goals yet. Create your first savings goal!</Text>
                </View>
            ) : (
                <FlatList
                    data={goals}
                    keyExtractor={item => item.id}
                    renderItem={renderGoalItem}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            {/* Create Goal Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                transparent={false}
                onRequestClose={() => {
                    setShowCreateModal(false);
                    resetForm();
                }}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Create New Goal</Text>

                    <Text style={styles.label}>Goal Name *</Text>
                    <TextInput
                        value={goalName}
                        onChangeText={setGoalName}
                        style={styles.input}
                        placeholder="e.g., Vacation Fund"
                        placeholderTextColor="#888"
                    />

                    <Text style={styles.label}>Target Amount *</Text>
                    <TextInput
                        value={targetAmount}
                        onChangeText={setTargetAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholder="$0.00"
                        placeholderTextColor="#888"
                    />

                    <Text style={styles.label}>Current Amount (Optional)</Text>
                    <TextInput
                        value={currentAmount}
                        onChangeText={setCurrentAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholder="$0.00"
                        placeholderTextColor="#888"
                    />

                    <Text style={styles.label}>Deadline (Optional)</Text>
                    <TextInput
                        value={deadline}
                        onChangeText={setDeadline}
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#888"
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                                setShowCreateModal(false);
                                resetForm();
                            }}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleCreateGoal}
                        >
                            <Text style={styles.buttonText}>Save Goal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#000',
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#76c75f',
        marginBottom: 20,
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: '#76c75f',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    createButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    goalCard: {
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: '#1a1a1a',
    },
    completedCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#76c75f',
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    goalName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    completedBadge: {
        backgroundColor: '#76c75f',
        color: '#000',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    amountText: {
        color: '#fff',
        marginBottom: 8,
    },
    progressContainer: {
        height: 20,
        backgroundColor: '#333',
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
        color: '#fff',
        fontSize: 12,
    },
    deadlineText: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 4,
    },
    goalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    addMoneyButton: {
        backgroundColor: '#4a90e2',
        padding: 8,
        borderRadius: 6,
        flex: 1,
        marginRight: 8,
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
        padding: 8,
        borderRadius: 6,
        flex: 1,
        marginLeft: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    listContainer: {
        paddingBottom: 20,
    },
    modalContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#000',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#76c75f',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        color: '#fff',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 6,
        padding: 12,
        marginBottom: 16,
        color: '#fff',
        backgroundColor: '#1a1a1a',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 6,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#76c75f',
        padding: 12,
        borderRadius: 6,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
});