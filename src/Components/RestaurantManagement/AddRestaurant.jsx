import React, { useState, useRef, useEffect } from "react";
import { Camera, Menu, ArrowLeft, X, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Sidebar";
import { FaCaretDown } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

// Firebase imports
import { db, storage, auth } from "../../firebase"; // Adjust the path to your Firebase config
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function AddRestaurant() {
  const [activeMenuItem, setActiveMenuItem] = useState("Restaurant Management");
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sidebarRef = useRef();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { restaurantId } = useParams();
  const isEditMode = Boolean(restaurantId);
  

  const [formData, setFormData] = useState({
    restaurantName: '',
    city: '',
    cuisineType: '',
    featuredRestaurant: 'No',
    phoneNumber: '',
    address: '',
    description: '',
    priceRange: ''
  });

  const cities = ["Select City", "Barcelona", "Madrid", "Valencia", "Seville", "Bilbao"];
  const cuisineTypes = ["Select Cuisine", "Traditional Catalan", "Mediterranean", "Italian", "French", "Asian", "Mexican", "American", "Seafood", "Vegetarian"];
  const priceRanges = ["$", "$$", "$$$", "$$$$"];

  const [error, setError] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Auto-hide success alert after 3 seconds
  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
        navigate('/restaurants');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert, navigate]);

  // Fetch restaurant data for editing
  useEffect(() => {
    if (isEditMode) {
      const fetchRestaurant = async () => {
        try {
          const docRef = doc(db, "restaurants", restaurantId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              restaurantName: data.restaurantName || "",
              city: data.city || "",
              cuisineType: data.cuisineType || "",
              featuredRestaurant: data.featuredRestaurant ? 'Yes' : 'No',
              phoneNumber: data.phoneNumber || "",
              address: data.address || "",
              description: data.description || "",
              priceRange: data.priceRange || ""
            });
            if (data.images && data.images.length > 0) {
              setSelectedImages(
                data.images.map((url, idx) => ({
                  id: idx,
                  url,
                  file: null,
                }))
              );
            } else {
              setSelectedImages([]);
            }
          }
        } catch (error) {
          console.error("Failed to fetch restaurant for editing:", error);
          setError("Failed to load restaurant data. Please try again.");
        }
      };
      fetchRestaurant();
    }
  }, [restaurantId, isEditMode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
    console.log(`Navigating to: ${itemName}`);
  };

  const openDrawer = () => {
    sidebarRef.current?.openDrawer();
  };

  const handleBackToRestaurants = () => {
    navigate('/restaurants');
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      file: file
    }));
    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handlePriceRangeSelect = (range) => {
    setFormData(prev => ({
      ...prev,
      priceRange: range
    }));
  };

  // Function to upload images to Firebase Storage
  const uploadImagesToStorage = async (images) => {
    const uploadPromises = images.map(async (imageObj, index) => {
      try {
        // Create a unique filename with timestamp
        const timestamp = Date.now();
        const filename = `restaurants/${timestamp}_${index}_${imageObj.file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, filename);
        
        console.log(`Uploading image ${index + 1} to: ${filename}`);
        
        // Upload the file with metadata
        const metadata = {
          contentType: imageObj.file.type,
          customMetadata: {
            originalName: imageObj.file.name,
            uploadedAt: new Date().toISOString()
          }
        };
        
        const snapshot = await uploadBytes(storageRef, imageObj.file, metadata);
        console.log(`Image ${index + 1} uploaded successfully`);
        
        // Get the download URL and return just the URL string
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL; // Return only the URL string
      } catch (error) {
        console.error(`Error uploading image ${index + 1}:`, error);
        
        // Handle specific Firebase errors
        if (error.code === 'storage/unauthorized') {
          throw new Error(`Upload failed: You don't have permission to upload files. Please check Firebase Storage rules.`);
        } else if (error.code === 'storage/invalid-format') {
          throw new Error(`Upload failed: Invalid file format for image ${index + 1}`);
        } else if (error.code === 'storage/object-not-found') {
          throw new Error(`Upload failed: Storage bucket not found`);
        } else {
          throw new Error(`Upload failed for image ${index + 1}: ${error.message}`);
        }
      }
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.restaurantName.trim()) {
        setError('Please enter restaurant name');
        setIsSubmitting(false);
        return;
      }

      if (formData.city === 'Select City') {
        setError('Please select a city');
        setIsSubmitting(false);
        return;
      }

      if (formData.cuisineType === 'Select Cuisine') {
        setError('Please select a cuisine type');
        setIsSubmitting(false);
        return;
      }

      let imageUrls = [];
      
      // Handle image uploads for new images
      const newImages = selectedImages.filter((img) => img.file);
      if (newImages.length > 0) {
        imageUrls = await uploadImagesToStorage(newImages);
      }

      if (isEditMode) {
        // Merge old and new images for edit mode
        const allImages = [
          ...selectedImages.filter((img) => !img.file).map((img) => img.url),
          ...imageUrls,
        ];
        
        const restaurantData = {
          restaurantName: formData.restaurantName.trim(),
          city: formData.city,
          cuisineType: formData.cuisineType,
          featuredRestaurant: formData.featuredRestaurant === 'Yes',
          phoneNumber: formData.phoneNumber.trim(),
          address: formData.address.trim(),
          description: formData.description.trim(),
          priceRange: formData.priceRange || '',
          images: allImages,
          updatedAt: serverTimestamp(),
        };

        await updateDoc(doc(db, "restaurants", restaurantId), restaurantData);
        setSuccessMessage('Restaurant updated successfully!');
      } else {
        // Create new restaurant
        const restaurantData = {
          restaurantName: formData.restaurantName.trim(),
          city: formData.city,
          cuisineType: formData.cuisineType,
          featuredRestaurant: formData.featuredRestaurant === 'Yes',
          phoneNumber: formData.phoneNumber.trim(),
          address: formData.address.trim(),
          description: formData.description.trim(),
          priceRange: formData.priceRange || '',
          images: imageUrls,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdByEmail: user?.email || '',
        };

        const docRef = await addDoc(collection(db, "restaurants"), restaurantData);
        setSuccessMessage('Restaurant created successfully!');
        
        // Reset form for create mode
        setFormData({
          restaurantName: '',
          city: '',
          cuisineType: '',
          featuredRestaurant: 'No',
          phoneNumber: '',
          address: '',
          description: '',
          priceRange: ''
        });
        setSelectedImages([]);
      }
      
      setShowSuccessAlert(true);
      setError("");
    } catch (error) {
      if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        setError('Upload failed: Please check Firebase Storage permissions. Contact your administrator.');
      } else if (error.message.includes('network')) {
        setError('Network error: Please check your internet connection and try again.');
      } else {
        setError(`Error ${isEditMode ? 'updating' : 'creating'} restaurant: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-PlusJakarta">
      {/* Sidebar Component */}
      <Sidebar
        ref={sidebarRef}
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header with hamburger menu */}
        <div className="w-full h-16 shadow-custom bg-[#FAFAFB] flex items-center px-4 lg:px-6">
          <button
            onClick={openDrawer}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors mr-3"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <div className="flex items-center">
            <button
              onClick={handleBackToRestaurants}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors mr-3"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 lg:hidden">
              {isEditMode ? 'Edit Restaurant' : 'Add Restaurant'}
            </h1>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full scrollbar-hide">
          {/* Header with Back Button - hidden on mobile since it's in the top bar */}
          <div className="hidden lg:flex items-center mb-6">
            <button
              onClick={handleBackToRestaurants}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Restaurants</span>
            </button>
          </div>

          {/* Main Content Container */}
          <div className="max-w-5xl 2xl:max-w-[100rem] mx-auto">
            <div className="bg-[#FAFAFB]">
              {/* Header */}
              <h2 className="text-xl lg:text-2xl font-bold text-black font-PlusJakartaSans mb-8 text-center lg:text-left">
                {isEditMode ? 'Edit Restaurant' : 'Add Restaurant'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {/* Success Alert */}
                {showSuccessAlert && (
                  <div className="fixed top-4 right-4 z-50 max-w-md animate-pulse">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out hover:shadow-xl">
                      <div className="flex items-center">
                        <CheckCircle className="h-6 w-6 text-green-400 mr-3 flex-shrink-0 animate-bounce" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-green-800">
                            Success!
                          </h3>
                          <p className="mt-1 text-sm text-green-700 font-medium">
                            {successMessage}
                          </p>
                          <p className="mt-1 text-xs text-green-600">
                            Redirecting to restaurants page...
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSuccessAlert(false);
                            navigate("/restaurants");
                          }}
                          className="ml-4 text-green-400 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-green-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Photo Upload Section */}
                <div className="text-center">
                  <div className="mb-4">
                    <label className="relative inline-block cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                      <div className="w-24 h-24 mx-auto bg-[#FAFAFB] rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-[#4BADE6]">
                        <Camera size={32} className="text-[#4BADE6] mb-2" />
                        <span className="text-xs text-[#4BADE6]">
                          Tap to Add Photo
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Image Thumbnails */}
                  {selectedImages.length > 0 && (
                    <div className="flex justify-center space-x-2 mb-4">
                      {selectedImages.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.url}
                            alt="Restaurant preview"
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            disabled={isSubmitting}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-PlusJakartaSans">
                  {/* Restaurant Name */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      value={formData.restaurantName}
                      onChange={(e) =>
                        handleInputChange("restaurantName", e.target.value)
                      }
                      placeholder="Enter restaurant name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* City */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      City *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        className="appearance-none w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                        disabled={isSubmitting}
                        required
                      >
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <FaCaretDown
                        size={20}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4BADE6] pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Cuisine Type */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      Cuisine Type *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.cuisineType}
                        onChange={(e) =>
                          handleInputChange("cuisineType", e.target.value)
                        }
                        className="appearance-none w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                        disabled={isSubmitting}
                        required
                      >
                        {cuisineTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <FaCaretDown
                        size={20}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4BADE6] pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Featured Restaurant */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-3">
                      Featured Restaurant
                    </label>
                    <div className="flex flex-col space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="featuredRestaurant"
                          value="Yes"
                          checked={formData.featuredRestaurant === "Yes"}
                          onChange={(e) =>
                            handleInputChange(
                              "featuredRestaurant",
                              e.target.value
                            )
                          }
                          className="mr-2 text-[#4BADE6] focus:ring-[#4BADE6]"
                          disabled={isSubmitting}
                        />
                        <span className="text-sm text-thirdBlack">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="featuredRestaurant"
                          value="No"
                          checked={formData.featuredRestaurant === "No"}
                          onChange={(e) =>
                            handleInputChange(
                              "featuredRestaurant",
                              e.target.value
                            )
                          }
                          className="mr-2 text-[#4BADE6] focus:ring-[#4BADE6]"
                          disabled={isSubmitting}
                        />
                        <span className="text-sm text-thirdBlack">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Price Range for Reservations */}
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <div className="w-full px-4 h-20 border border-gray-300 rounded-3xl bg-white font-PlusJakartaSans">
                        <h3 className="text-sm mt-3">Price Range (For Restaurants)</h3>
                        <div className="flex items-center gap-2 mt-2">
                          {priceRanges.map((range) => (
                            <button
                              key={range}
                              type="button"
                              onClick={() => handlePriceRangeSelect(range)}
                              className={`text-xs rounded-2xl px-4 py-1 transition-colors ${
                                formData.priceRange === range
                                  ? 'bg-[#4BADE6] text-white'
                                  : 'text-gray-500 bg-[#E2F2FB] hover:bg-[#4BADE6] hover:text-white'
                              }`}
                              disabled={isSubmitting}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Address */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        placeholder="Enter Address"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Describe about your restaurant"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] resize-none font-PlusJakartaSans text-grayModern"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#4BADE6] text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (isEditMode ? 'Updating Restaurant...' : 'Creating Restaurant...') : (isEditMode ? 'Update Restaurant' : 'Create Restaurant')}
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToRestaurants}
                    disabled={isSubmitting}
                    className="flex-1 bg-white border border-gray-300 text-primaryBlue py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddRestaurant;