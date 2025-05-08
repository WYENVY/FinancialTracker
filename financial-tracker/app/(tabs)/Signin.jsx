import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../fireconfig';

const db = getFirestore();

export default function SignIn({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      if (!username) {
        Alert.alert('Error', 'Username is empty');
        return;
      }

      if (!password) {
        Alert.alert('Error', 'Password is empty');
        return;
      }

      const docRef = doc(db, 'usernames', username);
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        Alert.alert('Error', 'Username not found');
        return;
      }
  
      const emailFromUsername = docSnap.data().email;
      await signInWithEmailAndPassword(auth, emailFromUsername, password);
      Alert.alert('Success', 'Logged in!');
      navigation.navigate('Home');
    } catch (error) {
      let errorMessage;
      
      // Provide specific error messages based on error type
      switch(error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid username or password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Login Error', errorMessage);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={setUsername}
        autoCapitalize="none"
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry
        value={password}
      />
      <Button title="Sign In" onPress={handleSignIn} />
      <Button title="Don't have an account? Sign Up" onPress={() => navigation.navigate('SignUp')} />
      <Button title="Forgot Password?" onPress={() => navigation.navigate('ForgotPassword')} />
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
