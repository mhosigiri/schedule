// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIZmLOtfdFgtSSVWbbLt9npxaycwhRHqA",
  authDomain: "schedule-kc.firebaseapp.com",
  projectId: "schedule-kc",
  storageBucket: "schedule-kc.firebasestorage.app",
  messagingSenderId: "403527554588",
  appId: "1:403527554588:web:cb870bc499eb8eb98531d9",
  measurementId: "G-2VLQ0W6Y7L",
  // Add this if you're using Realtime Database
  databaseURL: "https://schedule-kc-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const firestore = getFirestore(app);
const auth = getAuth(app);

// Export initialized instances
export { app, firestore, auth };