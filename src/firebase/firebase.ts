// src/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIZmLOtfdFgtSSVWbbLt9npxaycwhRHqA",
  authDomain: "schedule-kc.firebaseapp.com",
  projectId: "schedule-kc",
  storageBucket: "schedule-kc.firebasestorage.app",
  messagingSenderId: "403527554588",
  appId: "1:403527554588:web:cb870bc499eb8eb98531d9",
  measurementId: "G-2VLQ0W6Y7L",
  databaseURL: "https://schedule-kc-default-rtdb.firebaseio.com" // Add this for Realtime Database
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const firestore = getFirestore(app);
const auth = getAuth(app);
const database = getDatabase(app);
const analytics = getAnalytics(app);

// Create a function to get the current user state
const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

export { app, firestore, auth, database, analytics, getCurrentUser };