// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABuHnqvgeHmtb6PNi5EZUeDvy6Dka7xT4",
  authDomain: "sheet-analytics-66ef9.firebaseapp.com",
  projectId: "sheet-analytics-66ef9",
  storageBucket: "sheet-analytics-66ef9.firebasestorage.app",
  messagingSenderId: "722704012372",
  appId: "1:722704012372:web:a844eabc7d4834468449c1",
  measurementId: "G-GRMP506ZKR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
