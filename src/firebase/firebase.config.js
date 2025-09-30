// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDikhJBMXsAe64q6mRvPu0XH0wR-kdgNU0",
  authDomain: "aegis-life.firebaseapp.com",
  projectId: "aegis-life",
  storageBucket: "aegis-life.firebasestorage.app",
  messagingSenderId: "179951024223",
  appId: "1:179951024223:web:8db2de480e3b3bff4ec3ea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default auth;