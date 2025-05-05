import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExpenseEntry({ onAdd }: { onAdd: (amount: number, description: string) => void }) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        const numAmount = parseFloat(amount);
        if (!isNaN(numAmount)) {
            onAdd(numAmount, description);
            setAmount('');
            setDescription('');
            setIsAdding(false);
        }
    };

    return (
        <View style={styles.container}>
            {isAdding ? (
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Description"
                        value={description}
                        onChangeText={setDescription}
                    />
                    <TouchableOpacity onPress={handleAdd}>
                        <Ionicons name="checkmark" size={24} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsAdding(false)}>
                        <Ionicons name="close" size={24} color="red" />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity onPress={() => setIsAdding(true)} style={styles.addButton}>
                    <Ionicons name="add" size={20} color="white" />
                    <Text style={styles.addButtonText}>Add Expense</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 8,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#76c75f',
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        gap: 5,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});