import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAgVEoVo25R1THXI17VWdq8ftuozdv5VfI",
  authDomain: "questbound-stenners.firebaseapp.com",
  projectId: "questbound-stenners",
  storageBucket: "questbound-stenners.firebasestorage.app",
  messagingSenderId: "92243041520",
  appId: "1:92243041520:web:6445187f6a079de7d5f635",
  measurementId: "G-JVTBDZX8RX"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Skip auth for now as requested
// const auth = getAuth(app);

export { db };
