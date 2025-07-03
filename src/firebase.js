// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBl4BexppTULCNdwQ_r6Dt6nbvisuVWmLY",
  authDomain: "global-connect-7c86b.firebaseapp.com",
  projectId: "global-connect-7c86b",
  storageBucket: "global-connect-7c86b.firebasestorage.app",
  messagingSenderId: "148336024959",
  appId: "1:148336024959:web:951c100cf9f79e63f44e4a",
  measurementId: "G-FGJX292J3L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, analytics };
export default app;