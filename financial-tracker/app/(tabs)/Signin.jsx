/*import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../fireconfig';
import { getFirestore, doc, getDocs, collection, query, where } from 'firebase/firestore';

const db = getFirestore();

export default function SignIn({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
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
      navigation.navigate('Home');
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
});*/

import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../fireconfig';
import { getFirestore, doc, getDocs, collection, query, where } from 'firebase/firestore';

const db = getFirestore();

export default function SignIn({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
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
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>

      <TextInput style={styles.input} placeholder="Username" onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgot}>Forgot Password?</Text>
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
    marginBottom: 20,
    textAlign: 'center',
    color: '#0a6857',
    fontWeight: '600',
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
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  forgot: {
    textAlign: 'center',
    color: '#0a6857',
    marginBottom: 20,
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