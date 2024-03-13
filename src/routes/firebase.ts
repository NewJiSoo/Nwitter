// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA3efQF7U_oJpu1OnCltAUZ7h_fs_1b4Yw",
    authDomain: "nwitter-b58c4.firebaseapp.com",
    projectId: "nwitter-b58c4",
    storageBucket: "nwitter-b58c4.appspot.com",
    messagingSenderId: "110225788065",
    appId: "1:110225788065:web:caee4eb2ebb2c22565b4e0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);
export const db = getFirestore(app);