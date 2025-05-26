/*import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { auth } from '../fireconfig';

const db = getFirestore();

export default function SignUp({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
      try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid; //edit
          await setDoc(doc(db, 'usernames', uid), {  //edit
              email, //edit
              username, //edit
          }); //edit
          Alert.alert('Success', 'Account created!');
          navigation.navigate('Home');
      } catch (error) {
          Alert.alert('Sign Up Error', error.message);
      }
  }
  
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={setUsername}
      />
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
});*/

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc, getDocs, query, where, collection } from 'firebase/firestore';
import { auth } from '../fireconfig';
import { Ionicons } from '@expo/vector-icons'; // requires expo or vector icons installed

const db = getFirestore();

export default function SignUp({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignUp = async () => {

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const q = query(collection(db, 'usernames'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      Alert.alert('Error', 'Username already taken');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      await setDoc(doc(db, 'usernames', uid), {
        email,
        username,
        mobile,
        dob
      });
      Alert.alert('Success', 'Account created!');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
          />

          <TextInput
            style={styles.input}
            placeholder="Date of Birth (DD/MM/YYYY)"
            value={dob}
            onChangeText={setDob}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye' : 'eye-off'}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons
                name={showConfirm ? 'eye' : 'eye-off'}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <Text style={styles.switchText}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('SignIn')}>
              Login
            </Text>
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#e8fdf7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '92%',
    height: '90%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
    textAlign: 'center',
    color: '#0a6857',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    marginBottom: 15,
    borderRadius: 14,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 15,
    borderRadius: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0a6857',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#333',
  },
  link: {
    color: '#0a6857',
    fontWeight: '600',
  },
});
