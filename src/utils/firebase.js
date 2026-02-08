import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    // These would typically be in .env
    apiKey: "AIzaSyDummyKey_ReplaceWithActual",
    authDomain: "canvas-ai-student.firebaseapp.com",
    projectId: "canvas-ai-student",
    storageBucket: "canvas-ai-student.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef12345"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
