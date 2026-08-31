import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
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


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export { db };
