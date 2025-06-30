

import React, { useState, useRef } from "react";
import { Search, ChevronDown, Eye, Trash2, Menu, User, Mail, MapPin, Calendar, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import { FaCaretDown } from "react-icons/fa";

function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Country");
  const [activeMenuItem, setActiveMenuItem] = useState("Users");
  const sidebarRef = useRef();
  const navigate = useNavigate();

  const users = [
    {
      id: 1,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
      name: "Jane Cooper",
      email: "jane.mcnerney44@gmail.com",
      country: "Spain",
      joinDate: "November 20, 2020",
      location: "Madrid",
      status: "active",
    },
    {
      id: 2,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      name: "Daniel Lowe",
      email: "daniel.mcnerney44@gmail.com",
      country: "Spain",
      joinDate: "November 16, 2022",
      location: "Barcelona",
      status: "active",
    },
    {
      id: 3,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      name: "Robert Johnson",
      email: "robert.johnson@gmail.com",
      country: "France",
      joinDate: "March 15, 2023",
      location: "Paris",
      status: "active",
    },
    {
      id: 4,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      name: "Sarah Wilson",
      email: "sarah.wilson@gmail.com",
      country: "Germany",
      joinDate: "January 10, 2023",
      location: "Berlin",
      status: "active",
    },
    {
      id: 5,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
      name: "Michael Chen",
      email: "michael.chen@gmail.com",
      country: "Italy",
      joinDate: "July 8, 2023",
      location: "Rome",
      status: "active",
    },
    {
      id: 6,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
      name: "Emily Davis",
      email: "emily.davis@gmail.com",
      country: "Portugal",
      joinDate: "September 12, 2023",
      location: "Lisbon",
      status: "active",
    },
  ];

  const countries = [
    "Country",
    "Spain",
    "France",
    "Germany",
    "Italy",
    "Portugal",
  ];

  // Country flag mapping
  const countryFlags = {
    "Spain": "/assets/flags/spain.png",
    "France": "/assets/flags/france.png",
    "Germany": "/assets/flags/germany.png",
    "Italy": "/assets/flags/italy.png",
    "Portugal": "/assets/flags/portugal.png",
  };

  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
    console.log(`Navigating to: ${itemName}`);
  };

  const handleView = (userId) => {
    console.log(`View user ${userId}`);
    navigate(`/users-management/user-details`);
  };

  const handleDelete = (userId) => {
    console.log(`Delete user ${userId}`);
    // Add delete logic here
  };

  const openDrawer = () => {
    sidebarRef.current?.openDrawer();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to truncate email for better display
  const truncateEmail = (email, maxLength = 25) => {
    if (email.length <= maxLength) return email;
    return email.slice(0, maxLength) + "...";
  };

  // Mobile Card Component
  const UserCard = ({ user }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
            <div className="flex items-center space-x-1 text-sm text-gray-500">    
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleView(user.id)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDelete(user.id)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-md transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Mail size={14} />
          <span className="break-all">{user.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {countryFlags[user.country] ? (
            <img 
              src={countryFlags[user.country]} 
              alt={`${user.country} flag`}
              className="w-4 h-3 object-cover rounded-sm"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <Globe size={14} />
          )}
          <span>{user.country}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin size={14} />
          <span>{user.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar size={14} />
          <span>{user.joinDate}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-PlusJakarta">
      {/* Sidebar Component */}
      <Sidebar 
        ref={sidebarRef}
        activeItem={activeMenuItem} 
        onItemClick={handleMenuItemClick} 
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header with hamburger menu */}
        <div className="w-full h-16 shadow-custom bg-[#FAFAFB] flex items-center px-4 lg:px-6">
          <button
            onClick={openDrawer}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors mr-3"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-black font-PlusJakartaSans  lg:hidden">Users Management</h1>
        </div>
        
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full scrollbar-hide">
          {/* Header - hidden on mobile since it's in the top bar */}
          <h1 className="text-xl sm:text-2xl font-bold text-black font-PlusJakartaSans  mb-4 lg:mb-6 hidden lg:block">Users Management</h1>

          {/* Search and Filter Bar */}
          <div className="flex flex-col space-y-3 mb-6">
            {/* Search Input */}
            <div className="relative flex-1">
              <img
                src="/assets/search.svg"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 "
                alt="Search"
              />
              <input
                type="text"
                placeholder="Search users by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 bg-[#FAFAFB] placeholder:text-grayModern rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Country Filter */}
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="appearance-none bg-[#FAFAFB] border placeholder:font-PlusJakarta border-gray-300 rounded-lg px-4 py-2.5 sm:py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px] w-full sm:w-auto text-sm sm:text-base text-grayModern"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <FaCaretDown
                size={24}
                className="absolute sm:left-[7rem] top-1/2 right-3 sm:right-0 transform -translate-y-1/2 text-primaryBlue pointer-events-none"
              />
            </div>
          </div>

          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden font-outfit">
            <div className="w-full">
              <table className="w-full table-fixed">
                <thead className="bg-white border-b border-gray-200">
                  <tr className="font-OutfitSemiBold">
                    <th className="text-left py-3 px-4 font-semibold text-black w-[20%]">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-black w-[25%]">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-black w-[15%]">
                      Country
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-black w-[18%]">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-black w-[12%]">
                      City
                    </th>
                    <th className="text-left 2xl:text-center py-3 px-4 font-semibold text-black w-[14%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`${
                        index !== filteredUsers.length - 1 ? 'border-b border-[#D9D9D9]' : ''
                      } bg-[#4BADE61A]`}
                    >
                      {/* User Avatar and Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                          />
                          <span className="font-Urbanist text-base text-[#212121] truncate">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4">
                        <span 
                          className="font-Urbanist text-base text-[#212121] block truncate"
                          title={user.email}
                        >
                          {user.email}
                        </span>
                      </td>

                      {/* Country with Flag */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2 min-w-0">
                          {countryFlags[user.country] ? (
                            <img 
                              src={countryFlags[user.country]} 
                              alt={`${user.country} flag`}
                              className="w-6 h-4 object-cover rounded-sm shadow-sm border border-gray-200 flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-6 h-4 bg-gray-200 rounded-sm flex items-center justify-center flex-shrink-0">
                              <Globe size={10} className="text-gray-400" />
                            </div>
                          )}
                          <span className="font-Urbanist text-base text-[#212121] truncate">{user.country}</span>
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="py-4 px-4">
                        <span className="font-Urbanist text-base text-[#212121] block truncate">
                          {user.joinDate}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4">
                        <span className="font-Urbanist text-base text-[#212121] block truncate">
                          {user.location}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex justify-center space-x-1">
                          <button
                            onClick={() => handleView(user.id)}
                            className="bg-primaryBlue text-white px-2 py-1.5 rounded text-xs transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="bg-white text-primaryBlue border border-primaryBlue px-2 py-1.5 rounded text-xs transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State - Desktop */}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <User size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  No users found matching your search criteria.
                </p>
              </div>
            )}
          </div>

          {/* Mobile Card View - Visible only on Mobile/Tablet */}
          <div className="lg:hidden">
            {filteredUsers.length > 0 ? (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <User size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-base">
                  No users found matching your search criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>   
    </div>
  );
}

export default UsersManagement;