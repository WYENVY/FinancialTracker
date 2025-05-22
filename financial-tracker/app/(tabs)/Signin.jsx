import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../fireconfig';
import { getFirestore, doc, getDocs, collection, query, where } from 'firebase/firestore';
import { useRouter } from 'expo-router';

const db = getFirestore();

export default function SignIn() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      console.log('DEBUG: username value is:', username);
      if (!username) {
        Alert.alert('Error', 'Username is empty');
        return;
      }

      const q = query(collection(db, 'usernames'), where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Error', 'Username not found');
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const emailFromUsername = userDoc.data().email;

      await signInWithEmailAndPassword(auth, emailFromUsername, password);
      Alert.alert('Success', 'Logged in!');
      router.replace('/HomeScreen'); // ✅ Navigate to homescreen after login
    } catch (error) {
      console.error("Login Error", error);
      Alert.alert('Login Error', error.message);
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
        <Button title="Don't have an account? Sign Up" onPress={() => router.push('/tabs/signup')} />
        <Button title="Forgot Password?" onPress={() => router.push('/tabs/forgotpassword')} />
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
