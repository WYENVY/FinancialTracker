import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useCategories from '@/hooks/useCategories';
import { useState } from 'react';
import CategoryItem from '@/components/CategoryItem';
import { ExpenseCategory } from '@/src/types';
import IconPicker from '@/components/IconPicker';


export default function ExpensesScreen() {
    const {
        categories,
        addCategory,
        deleteCategory,
        updateCategory,
        addExpense,
        deleteExpense
    } = useCategories();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleEditPress = (category: ExpenseCategory) => {
        setEditingId(category.id);
        setEditName(category.name);
    };

    const handleSave = (id: string) => {
        updateCategory(id, { name: editName });
        setEditingId(null);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Expense Categories</Text>

            <FlatList
                data={categories}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    editingId === item.id ? (
                        <View style={[styles.editContainer, { backgroundColor: item.color }]}>
                            <TextInput
                                style={styles.editInput}
                                value={editName}
                                onChangeText={setEditName}
                                autoFocus
                            />
                            <IconPicker
                                selectedIcon={item.icon}
                                onSelect={(icon) => updateCategory(item.id, { icon })}
                            />
                            <View style={styles.editButtons}>
                                <TouchableOpacity onPress={() => handleSave(item.id)}>
                                    <Ionicons name="checkmark" size={20} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setEditingId(null)}>
                                    <Ionicons name="close" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <CategoryItem
                            category={item}
                            onDelete={deleteCategory}
                            onPress={() => handleEditPress(item)}
                            onAddExpense={addExpense}
                            onDeleteExpense={deleteExpense}
                        />
                    )
                )}
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => addCategory({
                    name: 'New Category',
                    icon: 'add'
                })}
            >
                <Text style={styles.addButtonText}>+ Add Category</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 45,
        backgroundColor: '#000000',

    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#76c75f'
    },
    editContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
    },
    editInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'white',
        marginRight: 10,
    },
    editButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    addButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#76c75f',
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    iconPickerContainer: {
        marginVertical: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        padding: 10,
    },
    editInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
});