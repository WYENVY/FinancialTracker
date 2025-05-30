import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
} from 'react-native';
import Chatbot from '@/components/Chatbot'; // Adjust the import path as needed

const Budgets: React.FC = () => {
    const [showChatbot, setShowChatbot] = useState(false);

    return (
        <View style={styles.container}>
            {/* Your existing Budgets content here */}
            <Text style={styles.title}>My Budgets</Text>

            {/* Add your existing budget components here */}

            {/* Floating Chat Button */}
            <TouchableOpacity
                style={styles.chatButton}
                onPress={() => setShowChatbot(true)}
            >
                <Text style={styles.chatButtonText}>💬</Text>
            </TouchableOpacity>

            {/* Chatbot Modal */}
            <Modal
                visible={showChatbot}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <Chatbot onClose={() => setShowChatbot(false)} />
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        padding: 20,
        textAlign: 'center',
    },
    chatButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    chatButtonText: {
        fontSize: 24,
    },
});

export default Budgets;