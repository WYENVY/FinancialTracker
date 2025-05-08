import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseCategory, Expense } from '@/src/types'; // Make sure to import Expense type
import ExpenseEntry from './ExpenseEntry';

interface CategoryItemProps {
    category: ExpenseCategory;
    onDelete: (id: string) => void;
    onPress: () => void;
    onAddExpense?: (categoryId: string, expense: Omit<Expense, 'id'>) => void;
    onDeleteExpense?: (categoryId: string, expenseId: string) => void;
}

export default function CategoryItem({
                                         category,
                                         onDelete,
                                         onPress,
                                         onAddExpense,
                                         onDeleteExpense
                                     }: CategoryItemProps) {
    return (
        <View style={[styles.container, { backgroundColor: category.color }]}>
            <View style={styles.mainContent}>
                <TouchableOpacity
                    style={styles.leftContent}
                    onPress={onPress}
                >
                    <Ionicons
                        name={category.icon as keyof typeof Ionicons.glyphMap}
                        size={20}
                        color="white"
                    />
                    <Text style={styles.name}>{category.name}</Text>
                </TouchableOpacity>

                <View style={styles.buttons}>
                    <TouchableOpacity
                        onPress={onPress}
                        style={styles.button}
                    >
                        <Ionicons name="create" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(category.id)}
                        style={styles.button}
                    >
                        <Ionicons name="trash" size={16} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.expensesContainer}>
                {category.expenses?.map(expense => (
                    <View key={expense.id} style={styles.expenseItem}>
                        <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
                        <Text style={styles.expenseDescription}>{expense.description}</Text>
                        <TouchableOpacity onPress={() => onDeleteExpense?.(category.id, expense.id)}>
                            <Ionicons name="trash" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                ))}
                <ExpenseEntry
                    onAdd={(amount: number, description: string) =>
                        onAddExpense?.(category.id, { amount, description, date: new Date().toISOString() })
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    mainContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    name: {
        color: 'white',
        marginLeft: 12,
        fontSize: 16,
    },
    buttons: {
        flexDirection: 'row',
        gap: 8,
    },
    button: {
        padding: 4,
    },
    expensesContainer: {
        marginTop: 10,
    },
    expenseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },
    expenseAmount: {
        color: 'white',
        fontWeight: 'bold',
        width: 80,
    },
    expenseDescription: {
        color: 'white',
        flex: 1,
    },
});