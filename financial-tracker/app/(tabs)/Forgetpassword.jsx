import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../fireconfig';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleReset = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');

      if (!email.trim()) {
        setError('Email is required');
        return;
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('A password reset email has been sent to your inbox.');
    } catch (error) {
      console.error("Reset Error", error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else {
        setError('Failed to send reset email. Please try again.');
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
          <Text style={styles.welcomeText}>Reset Your Password</Text>
        </View>

        {/* White form container */}
        <View style={styles.whiteSheet}>
          <View style={styles.formContainer}>
            <Text style={styles.loginTitle}>Forgot Password</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
            />

            <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
                disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Sending...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push('/Signin')}
            >
              <Text style={styles.linkText}>Back to Sign In</Text>
            </TouchableOpacity>
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
  resetButton: {
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
  linkButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#0068FF',
    fontSize: 14,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  successText: {
    color: '#00D09E',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    fontWeight: '500',
  },
});