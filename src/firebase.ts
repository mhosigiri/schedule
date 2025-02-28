// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIZmLOtfdFgtSSVWbbLt9npxaycwhRHqA",
  authDomain: "schedule-kc.firebaseapp.com",
  projectId: "schedule-kc",
  storageBucket: "schedule-kc.firebasestorage.app",
  messagingSenderId: "403527554588",
  appId: "1:403527554588:web:cb870bc499eb8eb98531d9",
  measurementId: "G-2VLQ0W6Y7L",
  databaseURL: "https://schedule-kc-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);
const functions = getFunctions(app);

// Export the services
export { app, analytics, auth, database, firestore, functions };