import React, { useState, useRef } from "react";
import { Camera, Menu, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import { FaCaretDown } from "react-icons/fa";

function AddRestaurant() {
  const [activeMenuItem, setActiveMenuItem] = useState("Restaurant Management");
  const [selectedImages, setSelectedImages] = useState([]);
  const sidebarRef = useRef();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    restaurantName: '',
    city: '',
    cuisineType: '',
    featuredRestaurant: 'No',
    phoneNumber: '',
    address: '',
    description: ''
  });

  const cities = ["Select City", "Barcelona", "Madrid", "Valencia", "Seville", "Bilbao"];
  const cuisineTypes = ["Select Cuisine", "Traditional Catalan", "Mediterranean", "Italian", "French", "Asian", "Mexican", "American", "Seafood", "Vegetarian"];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    console.log('Selected images:', selectedImages);
    // Add form submission logic here
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
              Add Restaurant
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
                Add Restaurant
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      value={formData.restaurantName}
                      onChange={(e) =>
                        handleInputChange("restaurantName", e.target.value)
                      }
                      placeholder="Enter restaurant name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                    />
                  </div>

                  {/* City */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      City
                    </label>
                    <div className="relative">
                      <select
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        className="appearance-none w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
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
                      Cuisine Type
                    </label>
                    <div className="relative">
                      <select
                        value={formData.cuisineType}
                        onChange={(e) =>
                          handleInputChange("cuisineType", e.target.value)
                        }
                        className="appearance-none w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
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
                        />
                        <span className="text-sm text-thirdBlack">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Price Range for Reservations */}
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <div className="w-full px-4 h-20  border border-gray-300 rounded-3xl  bg-white font-PlusJakartaSans ">
                        <h3 className=" text-sm mt-3 ">Price Range (For Restaurants)</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500 bg-[#E2F2FB] rounded-2xl px-4 py-1">$</span>
                          <span className="text-xs text-gray-500 bg-[#E2F2FB] rounded-2xl px-4 py-1">$$</span>
                          <span className="text-xs text-gray-500 bg-[#E2F2FB] rounded-2xl px-4 py-1">$$$</span>
                          <span className="text-xs text-gray-500 bg-[#E2F2FB] rounded-2xl px-4 py-1">$$$$</span>
                          </div>
                      </div>
                    </div>
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
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-[#4BADE6]  text-white py-3 px-6 rounded-lg  font-medium"
                  >
                    Create Restaurant
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToRestaurants}
                    className="flex-1 bg-white border border-gray-300 text-thirdBlack  py-3 px-6 rounded-lg  font-medium"
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