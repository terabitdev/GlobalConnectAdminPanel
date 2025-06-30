import React, { useState, useRef } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Menu,
  Edit,
  Eye,
  MapPin,
  Star,
  Users,
  Trash2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { FaStar } from "react-icons/fa6";
import Sidebar from "../Components/Sidebar";
import { FaCaretDown } from "react-icons/fa";
import { useNavigate } from "react-router";

function TipsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [activeMenuItem, setActiveMenuItem] = useState("Tips Management");
  const sidebarRef = useRef();
  const navigate = useNavigate();

  const tips = [
    {
      id: 1,
      userImage:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      userName: "Jorrie Cooper",
      userBadge: "Spain",
      timestamp: "about 3 years ago",
      title: "Santeria Day Trip",
      description:
        "Take the train to Santia early in the morning to avoid crowds. The paellas are incredible.",
      city: "Barcelona",
      likes: 15,
      dislikes: 2,
      tags: ["Spain"],
      location: "Barcelona, Spain",
    },
    {
      id: 2,
      userImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      userName: "Devon Lane",
      userBadge: "Spain",
      timestamp: "about 2 years ago",
      title: "Santia Day Trip",
      description:
        "Take the train to Santia early in the morning to avoid crowds. The paellas are incredible.",
      city: "Barcelona",
      likes: 8,
      dislikes: 1,
      tags: ["Spain"],
      location: "Barcelona, Spain",
    },
    {
      id: 3,
      userImage:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      userName: "Leslie Alexander",
      userBadge: "Spain",
      timestamp: "about 2 years ago",
      title: "Santia Day Trip",
      description:
        "Take the train to Santia early in the morning to avoid crowds. The paellas are incredible.",
      city: "Barcelona",
      likes: 12,
      dislikes: 0,
      tags: ["Spain"],
      location: "Barcelona, Spain",
    },
  ];

  const cities = [
    "All Cities",
    "Barcelona",
    "Madrid",
    "Valencia",
    "Seville",
    "Bilbao",
  ];
  const categories = [
    "All Categories",
    "Day Trips",
    "Restaurants",
    "Nightlife",
    "Shopping",
    "Culture",
    "Adventure",
  ];

  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
    console.log(`Navigating to: ${itemName}`);
  };

  const handleDeleteTip = (tipId) => {
    console.log(`Delete tip ${tipId}`);
    // Add delete logic here
  };

  const handleViewTip = (tipId) => {
    console.log(`View tip ${tipId}`);
    // Add view logic here
  };

  const openDrawer = () => {
    sidebarRef.current?.openDrawer();
  };

  const filteredTips = tips.filter(
    (tip) =>
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mobile Tip Card Component
  const TipCard = ({ tip }) => (
    <div className="bg-[#F8F9FA] border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex space-x-3 mb-3">
        <img
          src={tip.userImage}
          alt={tip.userName}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-sm">{tip.userName}</h4>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  tip.isExpert
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tip.userBadge}
              </span>
            </div>
            <span className="text-xs text-gray-500">{tip.timestamp}</span>
          </div>
          <h3 className="font-semibold text-base mb-2">{tip.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {tip.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <ThumbsUp size={14} className="text-gray-400" />
                <span className="text-xs text-gray-600">{tip.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ThumbsDown size={14} className="text-gray-400" />
                <span className="text-xs text-gray-600">{tip.dislikes}</span>
              </div>
            </div>
            <button
              onClick={() => handleDeleteTip(tip.id)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-md transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar
        ref={sidebarRef}
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header with hamburger menu */}
        <div className="w-full h-16 shadow-custom bg-[#FAFAFB] flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <button
              onClick={openDrawer}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors mr-3"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <h1 className="text-sm sm:text-xl font-bold text-black lg:hidden font-PlusJakartaSans">
              Tips Management
            </h1>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full scrollbar-hide">
          {/* Header with Add Button - hidden on mobile since it's in the top bar */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-2xl font-bold font-PlusJakartaSans text-black">
              Tips Management
            </h1>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col space-y-3 mb-6 font-PlusJakartaSans">
            {/* Search Input */}
            <div className="relative flex-1">
              <img
                src="/assets/search.svg"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                alt="Search"
              />
              <input
                type="text"
                placeholder="Search tips by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 placeholder:text-grayModern bg-[#FAFAFB] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:grid-cols-5 lg:grid-cols-5 2xl:grid-cols-8">
              {/* City Filter */}
              <div className="relative sm:max-w-[12.5rem] sm:w-full">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="appearance-none bg-[#FAFAFB] border text-grayModern border-gray-300 rounded-lg px-4 py-2.5 sm:py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm sm:text-base"
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <FaCaretDown
                  size={24}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4BADE6] pointer-events-none"
                />
              </div>

              {/* Category Filter */}
              <div className="relative sm:max-w-[12.5rem] sm:w-full">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-[#FAFAFB] border text-grayModern border-gray-300 rounded-lg px-4 py-2.5 sm:py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm sm:text-base"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <FaCaretDown
                  size={24}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4BADE6] pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Desktop Tip Cards - Hidden on Mobile */}
          <div className="hidden lg:block space-y-4">
            {filteredTips.map((tip) => (
              <div
                key={tip.id}
                className="bg-[#4BADE61A] rounded-3xl shadow-sm border p-6"
              >
                <div className="flex space-x-4">
                  {/* User Profile Image */}
                  <img
                    src={tip.userImage}
                    alt={tip.userName}
                    className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                  />

                  {/* Tip Details */}
                  <div className="flex-1">
                    {/* User Info and Actions */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-semibold text-[#212121] font-Urbanist">
                            {tip.userName}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <img src="/assets/flages/span.png" alt="span" className="w-3 h-3" />
                          <span
                            className="text-sm text-black font-WorkSansRegular "
                          >
                            {tip.userBadge}
                          </span>
                          </div>
                        </div>
                        <span className="text-[15px] font-Urbanist text-primaryBlue">
                          {tip.timestamp}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteTip(tip.id)}
                        className="bg-white border border-[#4BADE6] text-[#4BADE6] px-4 py-1 rounded text-sm "
                      >
                        Delete
                      </button>
                    </div>

                    {/* Tip Title */}
                    <h3 className="text-lg font-semibold text-[#212121] font-Urbanist ">
                      {tip.title}
                    </h3>

                    {/* Description */}
                    <p className="text-secondaryGray font-Urbanist text-[15px] leading-relaxed ">
                      {tip.description}
                    </p>

                     {/* location */}
                    <p className="text-black font-WorkSansRegular text-xs leading-relaxed mb-2">
                      {tip.location}
                    </p>

                    {/* Like/Dislike and Category */}
                    <div className="flex items-center justify-between font-WorkSansRegular">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full">
                          <img src="/assets/like.svg" className="w-4 h-4" />
                          <span className="text-sm  text-secondaryGray">
                            {tip.likes}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full">
                          <img src="/assets/dislike.svg" className="w-4 h-4" />
                          <span className="text-sm font-medium text-secondaryGray">
                            {tip.dislikes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State - Desktop */}
            {filteredTips.length === 0 && (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  No tips found matching your search criteria.
                </p>
              </div>
            )}
          </div>

          {/* Mobile Tip Cards - Visible only on Mobile/Tablet */}
          <div className="lg:hidden">
            {filteredTips.length > 0 ? (
              <div className="space-y-4">
                {filteredTips.map((tip) => (
                  <TipCard key={tip.id} tip={tip} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-base">
                  No tips found matching your search criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TipsManagement;
