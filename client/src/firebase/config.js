import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace these values with your actual firebaseConfig from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyDwYNFBwz6Ne02c1imvzATswIB1HP2DGx0",
  authDomain: "mediconnect-f13be.firebaseapp.com",
  projectId: "mediconnect-f13be",
  storageBucket: "mediconnect-f13be.firebasestorage.app",
  messagingSenderId: "141123075824",
  appId: "1:141123075824:web:be4f2cf9890c6e74658c35"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
