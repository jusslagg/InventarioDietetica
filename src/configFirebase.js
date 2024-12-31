import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9CydI-g5NTkgmetYfiqjkZitDOaxWL_4",
  authDomain: "base-de-prueba-11f78.firebaseapp.com",
  projectId: "base-de-prueba-11f78",
  storageBucket: "base-de-prueba-11f78.appspot.com",
  messagingSenderId: "57053379420",
  appId: "1:657053379420:web:a37d8edd060f8a94ef2f99",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
