

// import React, { useState } from "react";
// import { Eye, EyeOff, Globe } from "lucide-react";

// function LoginPage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = () => {
//     console.log("Sign in attempt:", formData);
//   };

//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row">
//       {/* Left side - Global Connect Design */}
//       <div className="relative flex lg:max-w-2xl 2xl:max-w-4xl w-full bg-primaryBlue overflow-hidden min-h-[40vh] lg:min-h-screen">
//         {/* World Map Background */}
//         <div className="absolute inset-0 w-full h-72 2xl:h-96 ">
//           <img src="/assets/map.png" alt="map" className="w-full h-full object-cover" />
//         </div>

//         {/* Main Content */}
//         <div className="relative flex flex-col items-center justify-between h-full text-white p-4 lg:p-0">
//           {/* Logo and Title */}
//           <div className="text-center w-full max-w-[18rem] sm:max-w-[22rem] 2xl:max-w-[40rem] h-auto lg:h-full flex items-center justify-center py-8 lg:py-0">
//             <img
//               src="/assets/logo.svg"
//               alt="logo"
//               className="w-full h-auto max-h-32 sm:max-h-40 lg:max-h-none lg:h-full object-contain lg:object-cover"
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
//       <div className="w-full lg:max-w-2xl bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
//         <div className="w-full max-w-sm">
//           <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 sm:mb-8">Sign in</h2>

//           <div className="space-y-4 sm:space-y-6">
//             <div>
//               <label
//                 htmlFor="username"
//                 className="block text-sm text-gray-600 mb-2"
//               >
//                 User name or email address
//               </label>
//               <input
//                 type="text"
//                 id="username"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
//                 placeholder=""
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm text-gray-600 mb-2"
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
//                   onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
//                   className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10 sm:pr-12 text-sm sm:text-base"
//                   placeholder=""
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
//                 </button>
//               </div>
//             </div>

//             <div className="text-right">
//               <button className="text-sm text-gray-600 hover:text-blue-600 transition-colors underline bg-transparent border-none cursor-pointer">
//                 Forget your password
//               </button>
//             </div>

//             <button
//               onClick={handleSubmit}
//               className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 sm:py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
//             >
//               Sign in
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default LoginPage;














import React, { useState } from "react";
import { Eye, EyeOff, Globe } from "lucide-react";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
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
  };

  const handleSubmit = () => {
    console.log("Sign in attempt:", formData);
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
          <h2 className="text-xl sm:text-2xl 2xl:text-4xl font-semibold text-secondaryBlack mb-6 sm:mb-8 2xl:mb-12">Sign in</h2>

          <div className="space-y-4 sm:space-y-6 2xl:space-y-8">
            <div>
              <label
                htmlFor="username"
                className="block text-sm 2xl:text-lg text-primarGray mb-2 2xl:mb-3"
              >
                User name or email address
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 2xl:px-6 2xl:py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base 2xl:text-lg"
                placeholder=""
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
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 2xl:px-6 2xl:py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10 sm:pr-12 2xl:pr-16 text-sm sm:text-base 2xl:text-lg"
                  placeholder=""
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 2xl:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" /> : <Eye size={18} className="sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button className="text-sm 2xl:text-base text-black underline bg-transparent border-none cursor-pointer">
                Forget your password
              </button>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-primaryBlue text-white font-medium py-2.5 sm:py-3 2xl:py-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base 2xl:text-lg"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;