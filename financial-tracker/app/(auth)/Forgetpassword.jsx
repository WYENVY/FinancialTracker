import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../fireconfig';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

export default function ForgotPassword({ navigation }) {
  const [username, setUsername] = useState('');

  const handleReset = async () => {
    try {
      const docRef = doc(db, 'usernames', username);
      const docSnap = await getDoc(docRef);
       
      // debug
      if (!docSnap.exists()) {
        Alert.alert('Error', 'Username not found');
        return;
      }

      const email = docSnap.data().email;
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
        placeholder="Username"
        onChangeText={setUsername}
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
});
