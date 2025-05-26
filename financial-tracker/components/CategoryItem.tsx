import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseCategory } from '@/src/types'; // Ensure this path is correct

interface CategoryItemProps {
    category: ExpenseCategory;
    onPress: () => void;
    itemSize: number; // To maintain square shape
    // onDelete?: (id: string) => void; // No longer a direct button on the grid item
    // onAddExpense, onDeleteExpense are removed as expenses are not shown directly
}

const GRID_ITEM_BACKGROUND_COLOR = '#D6EAF8'; // Light blue color from the image

export default function CategoryItem({
                                         category,
                                         onPress,
                                         itemSize,
                                     }: CategoryItemProps) {
    // Determine icon color based on preset status or other logic if needed
    // For simplicity, using a fixed color that works on the light blue background.
    const iconColor = category.isPreset ? '#052224' : '#2980B9'; // Example: darker for preset

    return (
        <TouchableOpacity
            style={[styles.container, { width: itemSize, height: itemSize, backgroundColor: GRID_ITEM_BACKGROUND_COLOR }]}
            onPress={onPress}
            // Presets are not editable by default, but onPress can still lead to a detail view.
            // The handleEditPress in ExpensesScreen already checks for !isPreset.
        >
            <Ionicons
                name={category.icon as keyof typeof Ionicons.glyphMap || 'help-circle-outline'}
                size={itemSize * 0.35} // Adjust icon size relative to itemSize
                color={iconColor} // Icon color
                style={styles.icon}
            />
            <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">{category.name}</Text>

            {/*
                Removed direct edit/delete buttons and expense list for grid view to match image.
                If !category.isPreset, onPress in ExpensesScreen triggers editing.
                Deletion would typically be part of the editing UI or a context menu.
            */}
            {/* Example: A small visual cue for custom categories if desired */}
            {/* {!category.isPreset && <View style={styles.customIndicator} />} */}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15, // Rounded corners like image
        padding: 8, // Internal padding
        // shadowColor: '#000', // Optional shadow, image items look flat
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.1,
        // shadowRadius: 2,
        // elevation: 2,
    },
    icon: {
        marginBottom: 8, // Space between icon and text
    },
    name: {
        color: '#052224', // Darker text for readability on light blue
        fontSize: 13, // Adjust as needed
        fontWeight: '500',
        textAlign: 'center',
    },
    // Example for a custom indicator
    // customIndicator: {
    //     position: 'absolute',
    //     top: 5,
    //     right: 5,
    //     width: 8,
    //     height: 8,
    //     borderRadius: 4,
    //     backgroundColor: '#3498DB', // A blue to indicate 'custom'
    // }
});