import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ValidIconName } from '@/src/types';

interface IconPickerProps {
    selectedIcon: ValidIconName;
    onSelect: (icon: ValidIconName) => void;
}

export default function IconPicker({ selectedIcon, onSelect }: IconPickerProps) {
    const icons: ValidIconName[] = [
        'fast-food', 'car', 'home', 'shirt',
        'medical', 'airplane', 'game-controller', 'cart'
    ];

    return (
        <View style={styles.container}>
            <FlatList
                data={icons}
                numColumns={4}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            selectedIcon === item && styles.selectedIcon
                        ]}
                        onPress={() => onSelect(item)}
                    >
                        <Ionicons
                            name={item}
                            size={24}
                            color="#333"
                        />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    iconButton: {
        padding: 10,
        margin: 5,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
    },
    selectedIcon: {
        backgroundColor: '#00D09E',
    }
});