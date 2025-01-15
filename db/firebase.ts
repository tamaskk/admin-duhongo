// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const FIREBASE_AUTH_DOMAIN = process.env.FIREBASE_AUTH_DOMAIN;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || 'kalandorokjatek-8d9d0.appspot.com';
const FIREBASE_MESSAGING_SENDER_ID = process.env.FIREBASE_MESSAGING_SENDER_ID;
const FIREBASE_APP_ID = process.env.FIREBASE_APP_ID;


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFs6qjxRY8Xio-zvsCV71KOy4AW5XmcsE",
  authDomain: "aduhongotata-57d66.firebaseapp.com",
  projectId: "aduhongotata-57d66",
  storageBucket: "aduhongotata-57d66.firebasestorage.app",
  messagingSenderId: "597762246196",
  appId: "1:597762246196:web:3dc2eae7c021391457ec61"
};

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: FIREBASE_API_KEY,
//   authDomain: FIREBASE_AUTH_DOMAIN,
//   projectId: FIREBASE_PROJECT_ID,
//   storageBucket: FIREBASE_STORAGE_BUCKET, // Ensure this has the correct bucket URL
//   messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
//   appId: FIREBASE_APP_ID
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
