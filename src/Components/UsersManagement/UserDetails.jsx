import React, { useState, useRef } from 'react';
import { Calendar, ChevronDown, Menu, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Sidebar';

const UserDetails = () => {
  const [activeMenuItem, setActiveMenuItem] = useState("Users");
  const sidebarRef = useRef();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [formData, setFormData] = useState({
    fullName: 'Mohammad Umer',
    dateOfBirth: 'August 13, 2000',
    nationality: 'Pakistani',
    homeCity: 'Islamabad',
    countriesVisited: 'Spain, Italy, Germany and France'
  });

  const [isNationalityOpen, setIsNationalityOpen] = useState(false);

  const nationalities = [
    'Pakistani',
    'American',
    'British',
    'Canadian',
    'Australian',
    'German',
    'French',
    'Spanish',
    'Italian'
  ];

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

  const handleSaveChanges = () => {
    console.log('Saving user details:', formData);
    // Add save logic here
  };

  const handleBackToUsers = () => {
    navigate('/users-management');
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
              onClick={handleBackToUsers}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors mr-3"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-black lg:hidden">User Details</h1>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full scrollbar-hide">
          {/* Header with Back Button - hidden on mobile since it's in the top bar */}
          <div className="hidden lg:flex items-center mb-6">
            <button
              onClick={handleBackToUsers}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Users</span>
            </button>
          </div>

          {/* Main Content Container */}
          <div className="w-full">
            <div className="bg-[#FAFAFB]  p-6 sm:p-0 ">
              {/* Header */}
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-8 text-center lg:text-left">User Details</h2>
              
              {/* Profile Picture */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
                    alt="Profile"
                    className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-Urbanist"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-Urbanist"
                    />
                    <Calendar 
                      size={20} 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500"
                    />
                  </div>
                </div>

                {/* Select Nationality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Nationality
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setIsNationalityOpen(!isNationalityOpen)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] text-left font-Urbanist"
                    >
                      {formData.nationality}
                    </button>
                    <ChevronDown 
                      size={20} 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500"
                    />
                    
                    {/* Dropdown Menu */}
                    {isNationalityOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {nationalities.map((nationality) => (
                          <button
                            key={nationality}
                            onClick={() => {
                              handleInputChange('nationality', nationality);
                              setIsNationalityOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none font-Urbanist"
                          >
                            {nationality}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Home City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Home City
                  </label>
                  <input
                    type="text"
                    value={formData.homeCity}
                    onChange={(e) => handleInputChange('homeCity', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-Urbanist"
                  />
                </div>

                {/* Countries Visited */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Countries Visited
                  </label>
                  <textarea
                    value={formData.countriesVisited}
                    onChange={(e) => handleInputChange('countriesVisited', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] resize-none font-Urbanist"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleSaveChanges}
                  className="flex-1 bg-primaryBlue hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button 
                  onClick={handleBackToUsers}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>   
    </div>
  );
};

export default UserDetails;