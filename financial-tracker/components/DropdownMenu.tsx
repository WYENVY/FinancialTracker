import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

export default function DropdownMenu() {
    const [visible, setVisible] = useState(false);
    const navigation = useNavigation();
    const router = useRouter();

    const handleSettings = () => {
        setVisible(false);
        router.push('/settings');
    };

    {/*Add this once we have added the login process*/}
    /*const handleLogout = () => {
        setVisible(false);
        console.log('User logged out');
    };*/

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setVisible(!visible)}>
                <Ionicons name="settings" size={24} color="#76c75f" />
            </TouchableOpacity>

            {visible && (
                <View style={styles.menu}>
                    <TouchableOpacity
                        onPress={handleSettings}
                        style={styles.menuItem}
                    >
                        <Text style={styles.menuText}>Settings</Text>
                    </TouchableOpacity>
                    {/*Add this once we have added the login process*/}
                    {/*<TouchableOpacity*/}
                    {/*    onPress={handleLogout}*/}
                    {/*    style={styles.menuItem}*/}
                    {/*>*/}
                    {/*    <Text style={styles.menuText}>Logout</Text>*/}
                    {/*</TouchableOpacity>*/}
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
        top: 30,
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
});