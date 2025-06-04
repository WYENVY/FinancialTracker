import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function FoodScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#052224" />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Goals Category Details</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F0FAF8' },
    backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backText: { marginLeft: 8, fontSize: 16, color: '#052224' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#052224' },
});
