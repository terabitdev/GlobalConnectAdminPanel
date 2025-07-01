// adminSetup.js - Run this once to create the admin user
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

// Admin credentials - Change these to your desired admin credentials
const ADMIN_EMAIL = "admin@globalconnect.com";
const ADMIN_PASSWORD = "AdminPassword123!"; // Use a strong password

export const createAdminUser = async () => {
  try {
    console.log("Creating admin user...");
    
    // Create admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );
    
    const user = userCredential.user;
    console.log("Admin user created in Auth:", user.uid);
    
    // Create admin user document in Firestore
    const adminUserData = {
      uid: user.uid,
      email: user.email,
      role: "admin",
      createdAt: serverTimestamp(),
      // Note: We don't store the password in Firestore as Firebase Auth handles it securely
    };
    
    await setDoc(doc(db, "users", user.uid), adminUserData);
    console.log("Admin user document created in Firestore");
    
    console.log("Admin setup completed successfully!");
    console.log("Admin Email:", ADMIN_EMAIL);
    console.log("Admin Password:", ADMIN_PASSWORD);
    
    return { success: true, uid: user.uid };
    
  } catch (error) {
    console.error("Error creating admin user:", error);
    
    if (error.code === "auth/email-already-in-use") {
      console.log("Admin user already exists. Updating Firestore document...");
      
      try {
        // If user already exists in Auth, just update Firestore
        const currentUser = auth.currentUser;
        if (currentUser) {
          const adminUserData = {
            uid: currentUser.uid,
            email: currentUser.email,
            role: "admin",
            createdAt: serverTimestamp(),
          };
          
          await setDoc(doc(db, "users", currentUser.uid), adminUserData);
          console.log("Admin user document updated in Firestore");
          return { success: true, uid: currentUser.uid };
        }
      } catch (firestoreError) {
        console.error("Error updating Firestore:", firestoreError);
      }
    }
    
    return { success: false, error: error.message };
  }
};

// Uncomment the line below and run this file once to create the admin user
// createAdminUser();