import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import IconPicker from '@/components/IconPicker';
import CategoryItem from '@/components/CategoryItem';
import useCategories from '@/hooks/useCategories';
import { ExpenseCategory, ValidIconName } from '@/src/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ExpensesStackParamList = {
    ExpensesMain: undefined;
    Food: undefined;
};

type NavigationProp = NativeStackNavigationProp<ExpensesStackParamList>;



const { width } = Dimensions.get('window');
const itemSize = (width - 25 * 2 - 20 * 2) / 3;

const PRESET_CATEGORIES: ExpenseCategory[] = [
    { id: '1', name: 'Food', icon: 'fast-food' as ValidIconName, color: '#FF6B6B', isPreset: true, expenses: [] },
    { id: '2', name: 'Transport', icon: 'bus' as ValidIconName, color: '#4ECDC4', isPreset: true, expenses: [] },
    { id: '3', name: 'Entertainment', icon: 'musical-notes' as ValidIconName, color: '#FF9F43', isPreset: true, expenses: [] },
    { id: '4', name: 'Groceries', icon: 'basket' as ValidIconName, color: '#6C5CE7', isPreset: true, expenses: [] },
    { id: '5', name: 'Rent', icon: 'key' as ValidIconName, color: '#00B894', isPreset: true, expenses: [] },
    { id: '6', name: 'Gifts', icon: 'gift' as ValidIconName, color: '#E84393', isPreset: true, expenses: [] },
    { id: '7', name: 'Income', icon: 'cash' as ValidIconName, color: '#00D09E', isPreset: true, expenses: [] },
    { id: '8', name: 'Goals', icon: 'trending-up' as ValidIconName, color: '#0984E3', isPreset: true, expenses: [] },
];

export default function CategoriesScreen() {
    const navigation = useNavigation<NavigationProp>()
    const {
        categories: firebaseCategories,
        addCategory,
        updateCategory,
        deleteCategory,
    } = useCategories(PRESET_CATEGORIES);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // Only display custom (non-preset) categories from Firestore
    const customCategories = firebaseCategories.filter(cat => !cat.isPreset);

    const handleEditPress = (category: ExpenseCategory) => {
        if (!category.isPreset) {
            setEditingId(category.id);
            setEditName(category.name);
        }
    };

    const handleAddCategory = () => {
        addCategory({
            name: '',
            icon: 'apps',
            color: '#76c75f',
            isPreset: false,
        });
    };

    const handleSave = (id: string, updatedIcon?: ValidIconName) => {
        const update: Partial<ExpenseCategory> = {
            name: editName,
        };

        if (updatedIcon) {
            update.icon = updatedIcon;
        }

        updateCategory(id, update);
        setEditingId(null);
    };

    const allCategories: ExpenseCategory[] = [
        ...PRESET_CATEGORIES,
        ...customCategories,
        {
            id: 'add-button',
            name: 'Add',
            icon: 'add-outline' as ValidIconName,
            color: '#AED6F1',
            isPreset: false,
            expenses: [],
        }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Categories</Text>
            </View>
            <View style={styles.contentSheet}>
                <FlatList
                    data={allCategories}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    renderItem={({ item }) => {
                        if (item.id === 'add-button') {
                            return (
                                <TouchableOpacity
                                    style={[styles.itemContainer, styles.addButton]}
                                    onPress={handleAddCategory}
                                >
                                    <Ionicons name="add-outline" size={30} color="#052224" />
                                    <Text style={styles.moreButtonText}>Add Category</Text>
                                </TouchableOpacity>
                            );
                        }

                        if (editingId === item.id && !item.isPreset) {
                            return (
                                <View style={[styles.editContainer, { backgroundColor: item.color || '#76c75f', width: itemSize, height: itemSize }]}>
                                    <TextInput
                                        style={styles.editInput}
                                        value={editName}
                                        onChangeText={setEditName}
                                        autoFocus
                                        placeholder="Enter Category Name"
                                    placeholderTextColor="rgba(255,255,255,0.7)"
                                    />
                                    <IconPicker
                                        selectedIcon={item.icon}
                                        onSelect={(icon) => handleSave(item.id, icon as ValidIconName)}
                                    />
                                    <View style={styles.editButtons}>
                                        <TouchableOpacity onPress={() => handleSave(item.id)}>
                                            <Ionicons name="checkmark-outline" size={24} color="white" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setEditingId(null)}>
                                            <Ionicons name="close-outline" size={24} color="white" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => deleteCategory(item.id)}>
                                            <Ionicons name="trash-outline" size={24} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        }

                        return (
                            <CategoryItem
                                category={item}
                                onPress={() => {
                                    if (item.isPreset && item.name === 'Food') {
                                        navigation.navigate('Food');
                                    } else {
                                        handleEditPress(item);
                                    }
                                }}
                                itemSize={itemSize}
                            />

                        );
                    }}
                />
            </View>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00D09E',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    contentSheet: {
        flex: 1,
        backgroundColor: '#F0FAF8',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    listContent: {
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    itemContainer: {
        width: itemSize,
        height: itemSize,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        backgroundColor: '#D6EAF8',
        padding: 10,
    },
    addButton: {
        backgroundColor: '#AED6F1',
    },
    moreButtonText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
        color: '#052224',
    },
    editContainer: {
        padding: 10,
        borderRadius: 15,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    editInput: {
        color: 'white',
        fontSize: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginBottom: 8,
        width: '90%',
    },
    editButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '60%',
        marginTop: 8,
    },
});
