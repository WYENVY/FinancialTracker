/*import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../fireconfig';
import { collection, query, getFirestore, doc, getDocs, where } from 'firebase/firestore';

const db = getFirestore();

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    if (!email|| !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Check your inbox', 'A password reset email has been sent.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>
        <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={setEmail}
        />
        <Button title="Reset Password" onPress={handleReset} />
        <Button title="Back to Sign In" onPress={() => navigation.navigate('SignIn')} />
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
});*/
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../fireconfig';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Check your inbox', 'A password reset email has been sent.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.description}>
        Enter your email to receive a password reset link.
      </Text>

      <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} autoCapitalize="none" />

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Next Step</Text>
      </TouchableOpacity>

      <Text style={styles.switchText}>
        Don’t have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
          Sign Up
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#e8fdf7',
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 10,
    color: '#0a6857',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 15,
    borderRadius: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0a6857',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  switchText: {
    textAlign: 'center',
    color: '#333',
  },
  link: {
    color: '#0a6857',
    fontWeight: '600',
  },
});