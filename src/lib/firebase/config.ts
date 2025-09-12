// src/lib/firebase/config.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'studio-6594222924-d12a3',
  appId: '1:1012012894176:web:cebc0f3fbae4224b970d85',
  storageBucket: 'studio-6594222924-d12a3.firebasestorage.app',
  apiKey: 'AIzaSyA9ECleuP2By-lmiVwlZTl8HE43EWRiqus',
  authDomain: 'studio-6594222924-d12a3.firebaseapp.com',
  messagingSenderId: '1012012894176',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
