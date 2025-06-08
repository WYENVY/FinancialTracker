import React from 'react';
import { View, StyleSheet } from 'react-native';
import Chatbot from '@/components/Chatbot';

const Budgets: React.FC = () => {
    return (
        <View style={styles.container}>
            <Chatbot />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
});

export default Budgets;
