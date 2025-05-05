// app/SignInLogin.jsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignInLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Logged in!');
    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created!');
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In / Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign In" onPress={handleSignIn} />
      <Button title="Sign Up" onPress={handleSignUp} />
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
