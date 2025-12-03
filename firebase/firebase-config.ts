// firebase/firebase-config.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';  // Firestore import

// Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyBT8nXgG2X91s0BBo0SU-pgrx-Wb5KNe6o',
  authDomain: 'savebitee.firebaseapp.com',
  projectId: 'savebitee',
  storageBucket: 'savebitee.firebasestorage.app',
  messagingSenderId: '793040756412',
  appId: '1:793040756412:web:9f0e3aff3c492965e3bab9',
};

// Uygulama başlatılıyor
const app = initializeApp(firebaseConfig);

// Auth başlatılıyor ve AsyncStorage ile oturum kalıcılığı sağlanıyor
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore başlatılıyor
const firestore = getFirestore(app);

export { auth, firestore };
