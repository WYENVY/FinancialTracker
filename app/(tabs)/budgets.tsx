import { View, Text, StyleSheet } from 'react-native';

export default function BudgetScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Budgets</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 60,
        backgroundColor: '#000000',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#76c75f'
    }
});