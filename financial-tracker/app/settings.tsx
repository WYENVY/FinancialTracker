import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Home: undefined;
    Settings: undefined;

};

type SettingsScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Settings'
>;

export default function SettingsScreen() {
    const navigation = useNavigation<SettingsScreenNavigationProp>();

    return (
        <View style={styles.container}>
            {/* Back Button Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    style={styles.backButton}
                    hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                >
                    <Ionicons name="arrow-back" size={24} color="#76c75f" />
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
            </View>

            {/* Settings Content */}
            <View style={styles.content}>
                <Text style={styles.text}>Your settings content here</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    backButton: {
        marginRight: 16,
        zIndex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#76c75f',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    text: {
        color: 'white',
        fontSize: 16,
    }
});