import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '@/app/fireconfig';
import { signOut } from 'firebase/auth';

export default function DropdownMenu() {
    const [visible, setVisible] = useState(false);
    const router = useRouter();

    // const handleSettings = () => {
    //     setVisible(false);
    //     router.push('../settings');
    // };

    const handleLogout = async () => {
        setVisible(false);
        try {
            await signOut(auth);
            router.replace('/Signin');
        } catch (error) {
            Alert.alert('Logout Error', 'Failed to sign out. Please try again.');
            console.error('Logout error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setVisible(!visible)} style={styles.bubbleButton}>
                <Ionicons name="menu" size={24} color="#052224" />
            </TouchableOpacity>

            {visible && (
                <View style={styles.menu}>
                    {/* Only keep the Logout option */}
                    <TouchableOpacity
                        onPress={handleLogout}
                        style={styles.menuItem}
                    >
                        <Text style={styles.menuText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        position: 'relative',
        marginRight: 16,
    },
    menu: {
        position: 'absolute',
        right: 0,
        top: 40,
        backgroundColor: '#64748b',
        borderRadius: 8,
        paddingVertical: 8,
        width: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 100,
    },
    menuItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#76c75f',
    },
    menuText: {
        color: 'white',
        fontSize: 16,
    },
    bubbleButton: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    }
});