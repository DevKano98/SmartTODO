/* import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Replace with your own Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage }; */
// Import the functions you need from the SDKs you need


import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgNNoKXHx5S9dt2fWGN7ZA1APHCAsNNzE",
  authDomain: "todo-30dc6.firebaseapp.com",
  databaseURL: "https://todo-30dc6-default-rtdb.firebaseio.com",
  projectId: "todo-30dc6",
  storageBucket: "todo-30dc6.firebasestorage.app",
  messagingSenderId: "407291424294",
  appId: "1:407291424294:web:86fe7a20e0ee531c1640e7"
};

// Initialize Firebase with performance optimization
const app = initializeApp(firebaseConfig);

// Initialize auth with lower timeout
const auth = getAuth(app);
auth.settings = { appVerificationDisabledForTesting: true };

// Use standard Firestore without experimental features that might slow things down
const db = getFirestore(app);

// Initialize storage
const storage = getStorage(app);

// Helper function to check if Firebase Storage is accessible
const isStorageAccessible = async () => {
  try {
    const testRef = ref(storage, `test-${Date.now()}`);
    const response = await fetch(testRef.toString(), { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Firebase Storage accessibility check failed:', error);
    return false;
  }
};

export { auth, db, storage, isStorageAccessible };