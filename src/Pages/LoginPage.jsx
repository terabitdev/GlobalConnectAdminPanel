// import React, { useState } from "react";
// import { Eye, EyeOff, Globe } from "lucide-react";
// import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { auth, db } from "../firebase"; // Adjust path as needed

// // Import the admin setup function
// import { createAdminUser } from "../utils/adminSetup";

// function LoginPage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [resetEmailSent, setResetEmailSent] = useState(false);
//   const [setupStatus, setSetupStatus] = useState("");
//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//   });

//   // Temporary function to create admin user
//   const handleAdminSetup = async () => {
//     setSetupStatus("Creating admin user...");
//     try {
//       const result = await createAdminUser();
//       if (result.success) {
//         setSetupStatus("✅ Admin user created! You can now remove this button.");
//       } else {
//         setSetupStatus("❌ Error: " + result.error);
//       }
//     } catch (error) {
//       setSetupStatus("❌ Error: " + error.message);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     // Clear error when user starts typing
//     if (error) setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       // Sign in with Firebase Auth
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         formData.username,
//         formData.password
//       );
      
//       const user = userCredential.user;
      
//       // Check if user exists in Firestore and has admin role
//       const userDocRef = doc(db, "users", user.uid);
//       const userDoc = await getDoc(userDocRef);
      
//       if (userDoc.exists()) {
//         const userData = userDoc.data();
        
//         // Check if user has admin role
//         if (userData.role === "admin") {
//           console.log("Admin login successful:", {
//             uid: user.uid,
//             email: user.email,
//             role: userData.role
//           });
          
//           // Redirect to dashboard
//           window.location.href = "/dashboard";
//         } else {
//           setError("Access denied. Admin privileges required.");
//           await auth.signOut(); // Sign out non-admin user
//         }
//       } else {
//         setError("User not found in system. Please contact administrator.");
//         await auth.signOut(); // Sign out user not in database
//       }
//     } catch (error) {
//       console.error("Login error:", error);
      
//       // Handle specific Firebase auth errors
//       switch (error.code) {
//         case "auth/user-not-found":
//           setError("No account found with this email address.");
//           break;
//         case "auth/wrong-password":
//           setError("Incorrect password. Please try again.");
//           break;
//         case "auth/invalid-email":
//           setError("Please enter a valid email address.");
//           break;
//         case "auth/too-many-requests":
//           setError("Too many failed attempts. Please try again later.");
//           break;
//         case "auth/user-disabled":
//           setError("This account has been disabled.");
//           break;
//         default:
//           setError("Login failed. Please check your credentials and try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = async () => {
//     if (!formData.username) {
//       setError("Please enter your email address first.");
//       return;
//     }

//     try {
//       setLoading(true);
//       await sendPasswordResetEmail(auth, formData.username);
//       setResetEmailSent(true);
//       setError("");
//     } catch (error) {
//       console.error("Password reset error:", error);
      
//       switch (error.code) {
//         case "auth/user-not-found":
//           setError("No account found with this email address.");
//           break;
//         case "auth/invalid-email":
//           setError("Please enter a valid email address.");
//           break;
//         default:
//           setError("Failed to send password reset email. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row">
//       {/* Left side - Global Connect Design */}
//       <div className="relative flex lg:max-w-2xl w-full bg-primaryBlue overflow-hidden min-h-[40vh] lg:min-h-screen">
//         {/* World Map Background */}
//         <div className="absolute inset-0 h-96 2xl:h-[24rem]">
//           <img src="/assets/map.png" alt="map" className="w-full h-full object-cover" />
//         </div>

//         {/* Main Content */}
//         <div className="relative flex flex-col items-center justify-between h-full text-white p-4 lg:p-0">
//           {/* Logo and Title */}
//           <div className="text-center w-full max-w-[18rem] sm:max-w-[22rem] h-auto lg:h-full flex items-center justify-center py-8 lg:py-0">
//             <img
//               src="/assets/logo.svg"
//               alt="logo"
//               className="w-full h-auto max-h-32 sm:max-h-40 lg:max-h-none lg:h-full object-contain lg:object-cover 2xl:h-[14rem] 2xl:w-[40rem]"
//             />
//           </div>

//           {/* Bottom Landmarks Silhouette */}
//           <div className="max-w-5xl w-full h-20 sm:h-32 lg:h-[24rem]">
//             <img
//               src="/assets/BG.png"
//               alt="landmarks"
//               className="w-full h-full object-cover"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Right side - Sign In Form */}
//       <div className="w-full lg:max-w-2xl 2xl:max-w-4xl font-poppins bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8 2xl:p-16">
//         <div className="w-full max-w-sm 2xl:max-w-lg">
//           <h2 className="text-xl sm:text-2xl 2xl:text-4xl font-semibold text-secondaryBlack mb-6 sm:mb-8 2xl:mb-12">
//             Admin Sign in
//           </h2>

//           {/* TEMPORARY: Admin Setup Button - REMOVE AFTER CREATING ADMIN */}
//           <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//             <p className="text-sm text-yellow-800 mb-2">
//               🚀 <strong>First-time setup:</strong> Create admin user
//             </p>
//             <button
//               onClick={handleAdminSetup}
//               className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
//             >
//               Create Admin User
//             </button>
//             {setupStatus && (
//               <p className="mt-2 text-sm text-gray-700">{setupStatus}</p>
//             )}
//           </div>

//           {/* Error Message */}
//           {error && (
//             <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           {/* Password Reset Success Message */}
//           {resetEmailSent && (
//             <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
//               Password reset email sent! Please check your inbox.
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 2xl:space-y-8">
//             <div>
//               <label
//                 htmlFor="username"
//                 className="block text-sm 2xl:text-lg text-primarGray mb-2 2xl:mb-3"
//               >
//                 Admin email address
//               </label>
//               <input
//                 type="email"
//                 id="username"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleInputChange}
//                 required
//                 disabled={loading}
//                 className="w-full px-3 py-2.5 sm:px-4 sm:py-3 2xl:px-6 2xl:py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base 2xl:text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
//                 placeholder="Enter your admin email"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm 2xl:text-lg text-primarGray mb-2 2xl:mb-3"
//               >
//                 Your password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   id="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   required
//                   disabled={loading}
//                   className="w-full px-3 py-2.5 sm:px-4 sm:py-3 2xl:px-6 2xl:py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10 sm:pr-12 2xl:pr-16 text-sm sm:text-base 2xl:text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
//                   placeholder="Enter your password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={loading}
//                   className="absolute right-2 sm:right-3 2xl:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
//                 >
//                   {showPassword ? (
//                     <EyeOff size={18} className="sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
//                   ) : (
//                     <Eye size={18} className="sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <div className="text-right">
//               <button
//                 type="button"
//                 onClick={handleForgotPassword}
//                 disabled={loading}
//                 className="text-sm 2xl:text-base text-black underline bg-transparent border-none cursor-pointer hover:text-blue-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 Forgot your password?
//               </button>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-primaryBlue text-white font-medium py-2.5 sm:py-3 2xl:py-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base 2xl:text-lg disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Signing in...
//                 </>
//               ) : (
//                 "Sign in"
//               )}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default LoginPage;








import React, { useState } from "react";
import { Eye, EyeOff, Globe } from "lucide-react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Adjust path as needed

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.username,
        formData.password
      );
      
      const user = userCredential.user;
      
      // Check if user exists in Firestore and has admin role
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if user has admin role
        if (userData.role === "admin") {
          console.log("Admin login successful:", {
            uid: user.uid,
            email: user.email,
            role: userData.role
          });
          
          // Redirect to dashboard
          window.location.href = "/dashboard";
        } else {
          setError("Access denied. Admin privileges required.");
          await auth.signOut(); // Sign out non-admin user
        }
      } else {
        setError("User not found in system. Please contact administrator.");
        await auth.signOut(); // Sign out user not in database
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case "auth/user-not-found":
          setError("No account found with this email address.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later.");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;
        default:
          setError("Login failed. Please check your credentials and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.username) {
      setError("Please enter your email address first.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, formData.username);
      setResetEmailSent(true);
      setError("");
    } catch (error) {
      console.error("Password reset error:", error);
      
      switch (error.code) {
        case "auth/user-not-found":
          setError("No account found with this email address.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        default:
          setError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Global Connect Design */}
      <div className="relative flex lg:max-w-2xl w-full bg-primaryBlue overflow-hidden min-h-[40vh] lg:min-h-screen">
        {/* World Map Background */}
        <div className="absolute inset-0 h-96 2xl:h-[24rem]">
          <img src="/assets/map.png" alt="map" className="w-full h-full object-cover" />
        </div>

        {/* Main Content */}
        <div className="relative flex flex-col items-center justify-between h-full text-white p-4 lg:p-0">
          {/* Logo and Title */}
          <div className="text-center w-full max-w-[18rem] sm:max-w-[22rem] h-auto lg:h-full flex items-center justify-center py-8 lg:py-0">
            <img
              src="/assets/logo.svg"
              alt="logo"
              className="w-full h-auto max-h-32 sm:max-h-40 lg:max-h-none lg:h-full object-contain lg:object-cover 2xl:h-[14rem] 2xl:w-[40rem]"
            />
          </div>

          {/* Bottom Landmarks Silhouette */}
          <div className="max-w-5xl w-full h-20 sm:h-32 lg:h-[24rem]">
            <img
              src="/assets/BG.png"
              alt="landmarks"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full lg:max-w-2xl 2xl:max-w-4xl font-poppins bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8 2xl:p-16">
        <div className="w-full max-w-sm 2xl:max-w-lg">
          <h2 className="text-xl sm:text-2xl 2xl:text-4xl font-semibold text-secondaryBlack mb-6 sm:mb-8 2xl:mb-12">
            Admin Sign in
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Password Reset Success Message */}
          {resetEmailSent && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              Password reset email sent! Please check your inbox.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 2xl:space-y-8">
            <div>
              <label
                htmlFor="username"
                className="block text-sm 2xl:text-lg text-primarGray mb-2 2xl:mb-3"
              >
                Admin email address
              </label>
              <input
                type="email"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 2xl:px-6 2xl:py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base 2xl:text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your admin email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm 2xl:text-lg text-primarGray mb-2 2xl:mb-3"
              >
                Your password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 2xl:px-6 2xl:py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10 sm:pr-12 2xl:pr-16 text-sm sm:text-base 2xl:text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-2 sm:right-3 2xl:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff size={18} className="sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
                  ) : (
                    <Eye size={18} className="sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-sm 2xl:text-base text-black underline bg-transparent border-none cursor-pointer hover:text-blue-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Forgot your password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primaryBlue text-white font-medium py-2.5 sm:py-3 2xl:py-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base 2xl:text-lg disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;










