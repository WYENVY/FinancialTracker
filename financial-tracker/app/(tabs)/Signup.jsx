import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { auth } from '../fireconfig'; // Make sure this path is correct
import { useRouter } from 'expo-router'; // Using expo-router for navigation

const db = getFirestore();

export default function SignUp() {
    const router = useRouter(); // Initialize router for navigation
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async () => {
        try {
            // Create user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            // Save username and email in Firestore under 'usernames' collection with user uid as document ID
            await setDoc(doc(db, 'usernames', uid), {
                email,
                username,
            });

            Alert.alert('Success', 'Account created!');
            router.push('/tabs/homescreen'); // Use router.push() to navigate to home screen
        } catch (error) {
            console.error("Sign Up Error:", error);
            Alert.alert('Sign Up Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                onChangeText={setUsername}
                value={username}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={setEmail}
                value={email}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                onChangeText={setPassword}
                value={password}
                secureTextEntry
            />
            <Button title="Sign Up" onPress={handleSignUp} />
            <Button title="Already have an account? Sign In" onPress={() => router.push('/tabs/signin')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        marginTop: 100,
    },
    input: {
        height: 40,
        borderColor: '#aaa',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 22,
        marginBottom: 20,
        textAlign: 'center',
    },
});
