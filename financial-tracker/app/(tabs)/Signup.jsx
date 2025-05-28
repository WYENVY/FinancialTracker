import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc, collection, query, where, getDocs } from 'firebase/firestore'; // ✅ Added imports
import { auth } from '../fireconfig';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');
const db = getFirestore();

export default function SignUp() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        try {
            setIsLoading(true);
            setError('');

            // Basic validation
            if (!username.trim()) {
                setError('Username is required');
                return;
            }

            if (!email.trim()) {
                setError('Email is required');
                return;
            }

            if (!email.includes('@')) {
                setError('Please enter a valid email');
                return;
            }

            if (!password || password.length < 6) {
                setError('Password must be at least 6 characters');
                return;
            }


            // 🔍 Check if username is already taken
            const q = query(collection(db, 'usernames'), where('username', '==', username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                Alert.alert('Error', 'Username already taken');
                return;
            }

            // ✅ Create user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            // ✅ Save to Firestore
            await setDoc(doc(db, 'usernames', uid), {
                email,
                username,
            });

            Alert.alert('Success', 'Account created successfully!');
            router.replace('/HomeScreen');
        } catch (error) {
            console.error("Sign Up Error:", error);
            if (error.code === 'auth/email-already-in-use') {
                setError('Email already in use');
            } else if (error.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters');
            } else if (error.code === 'auth/invalid-email') {
                setError('Invalid email format');
            } else {
                setError('Sign up failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {/* Header with green background */}
            <View style={styles.header}>
                <Text style={styles.title}>Finova</Text>
                <Text style={styles.welcomeText}>Create Your Account</Text>
            </View>

            {/* White form container */}
            <View style={styles.whiteSheet}>
                <View style={styles.formContainer}>
                    <Text style={styles.loginTitle}>Sign Up</Text>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor="#999"
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        value={username}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password (min 6 characters)"
                        placeholderTextColor="#999"
                        onChangeText={setPassword}
                        secureTextEntry
                        value={password}
                    />

                    <TouchableOpacity
                        style={styles.signUpButton}
                        onPress={handleSignUp}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.push('/Signin')}>
                            <Text style={[styles.footerText, styles.footerLink]}> Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00D09E',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 30,
    },
    whiteSheet: {
        position: 'absolute',
        top: height * 0.35,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F1FFF3',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 30,
    },
    formContainer: {
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#052224',
    },
    welcomeText: {
        fontSize: 18,
        color: '#052224',
        marginTop: 10,
    },
    loginTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#052224',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        height: 50,
        backgroundColor: 'white',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#052224',
    },
    signUpButton: {
        backgroundColor: '#00D09E',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    footerLink: {
        color: '#0068FF',
        fontWeight: '600',
    },
    errorText: {
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 15,
        fontSize: 14,
    },
});