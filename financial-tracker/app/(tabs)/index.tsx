import { View, Text, StyleSheet } from 'react-native';
import DropdownMenu from '@/components/DropdownMenu';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Finova</Text>
                <DropdownMenu />
            </View>
            <View style={styles.content}>
                <Text style={styles.welcomeText}> Welcom to your finance app!</Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50,
        backgroundColor: '#00000',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'SpaceMono',
        color: '#76c75f',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    welcomeText: {
        color: '#76c75f',
        fontSize: 16,
    },


});