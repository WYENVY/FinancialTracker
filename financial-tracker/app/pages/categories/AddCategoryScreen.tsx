import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import IconPicker from '@/components/IconPicker';
import { ValidIconName } from '@/src/types';
import { useNavigation } from '@react-navigation/native';

export default function AddCategoryScreen() {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState<ValidIconName>('apps');
    const [date, setDate] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const navigation = useNavigation();

    const formattedDate = date
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}/${date.getFullYear()}`
        : '';

    const handleSave = async () => {
        if (!name.trim() || !title.trim() || !amount || !date) {
            Alert.alert('Missing Info', 'Please fill out all required fields.');
            return;
        }

        try {
            const auth = getAuth();
            const db = getFirestore();
            const user = auth.currentUser;

            if (!user) {
                Alert.alert('Error', 'You must be logged in.');
                return;
            }

            // Create the new category
            const categoryRef = await addDoc(
                collection(db, 'usernames', user.uid, 'categories'),
                {
                    name: name.trim(),
                    icon,
                    color: '#76c75f',
                    isPreset: false,
                    expenses: [],
                }
            );

            // Add the first expense under the new category
            await addDoc(
                collection(db, 'usernames', user.uid, 'categories', categoryRef.id, 'expenses'),
                {
                    title,
                    description,
                    amount: parseFloat(amount),
                    date: date.toISOString(),
                    createdAt: new Date().toISOString(),
                }
            );

            Alert.alert('Success', 'Category and expense added!');
            navigation.goBack();
        } catch (err) {
            console.error('Failed to add category and expense:', err);
            Alert.alert('Error', 'Something went wrong.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Create New Category & Expense</Text>

            <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#052224', marginBottom: 4 }}>
                    Name <Text style={{ color: 'red' }}>*</Text>
                </Text>
                <TextInput
                    placeholder="Category Name"
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />
            </View>

            <IconPicker selectedIcon={icon} onSelect={setIcon} />

            <View style={styles.separator} />

            <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#052224', marginBottom: 4 }}>
                    Date <Text style={{ color: 'red' }}>*</Text>
                </Text>
                <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
                    <Text style={{ color: date ? '#000' : '#888' }}>
                        {date ? date.toLocaleDateString() + ' • ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select Date'}
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
                    Title <Text style={{ color: 'red' }}>*</Text>
                </Text>
                <TextInput
                    placeholder="Expense title"
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                />
            </View>
            <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#052224', marginBottom: 4 }}>
                    Amount <Text style={{ color: 'red' }}>*</Text>
                </Text>
                <TextInput
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                />
            </View>
            <TextInput
                placeholder="Description"
                style={styles.input}
                value={description}
                onChangeText={setDescription}
            />

            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save Category + Expense</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 14, backgroundColor: '#F0FAF8' },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#052224',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#aaa',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 10,
    },
    button: {
        backgroundColor: '#00D09E',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#052224',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
