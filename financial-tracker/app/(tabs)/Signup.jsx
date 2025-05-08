import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../fireconfig';

const db = getFirestore();

export default function SignUp({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      // Check required fields
      if (!username || !email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      // Check if username already exists
      const usernameDocRef = doc(db, 'usernames', username);
      const usernameDocSnap = await getDoc(usernameDocRef);
      
      if (usernameDocSnap.exists()) {
        Alert.alert('Error', 'Username already taken');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'usernames', username), {
        email,
        uid: userCredential.user.uid
      });
      Alert.alert('Success', 'Account created!');
      navigation.navigate('Home');
    } catch (error) {
      let errorMessage;
      
      // Provide specific error messages based on error type
      switch(error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak (min 6 characters)';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Sign Up Error', errorMessage);
    }
  };
  
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Already have an account? Sign In" onPress={() => navigation.navigate('SignIn')} />
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