import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCFw-fAVsa_2gzG9CvTLSQfQ9EVd-hCYq8",
    authDomain: "test-expo-project-fc6be.firebaseapp.com",
    projectId: "test-expo-project-fc6be",
    storageBucket: "test-expo-project-fc6be.firebasestorage.app",
    messagingSenderId: "938714168652",
    appId: "1:938714168652:web:b5ae50e8e31fcfddc023e9"
  };


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };