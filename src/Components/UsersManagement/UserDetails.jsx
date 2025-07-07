import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Menu, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

const UserDetails = () => {
  const [activeMenuItem, setActiveMenuItem] = useState("Users");
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    homeCity: '',
    countriesVisited: '',
    profileImageUrl: ''
  });

  const [isNationalityOpen, setIsNationalityOpen] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            fullName: userData.fullName || '',
            dateOfBirth: userData.dateOfBirth || '',
            nationality: userData.nationality || '',
            homeCity: userData.homeCity || '',
            countriesVisited: userData.countriesVisited || '',
            profileImageUrl: userData.profileImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
          });
        } else {
          console.error("User not found");
          navigate('/users-management');
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId, navigate]);

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

  const handleBackToUsers = () => {
    navigate('/users-management');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 font-PlusJakartaSans justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-PlusJakartaSans">
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
            <div className="bg-[#FAFAFB] p-6 sm:p-0">
              {/* Header */}
              <h2 className="text-xl lg:text-2xl font-bold text-black font-PlusJakarta mb-8 text-center lg:text-left">User Details</h2>
              
              {/* Profile Picture */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <img
                    src={formData.profileImageUrl}
                    alt="Profile"
                    className="w-20 h-20 lg:w-28 lg:h-28 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face";
                    }}
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-lg font-normal text-[#0D121C] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PublicSansMedium font-normal text-lg"
                    readOnly
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-lg font-normal text-[#0D121C] mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PublicSansMedium font-normal text-lg"
                      readOnly
                    />
                    <Calendar 
                      size={20} 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500"
                    />
                  </div>
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-lg font-normal text-[#0D121C] mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PublicSansMedium font-normal text-lg"
                    readOnly
                  />
                </div>

                {/* Home City */}
                <div>
                  <label className="block text-lg font-normal text-[#0D121C] mb-2">
                    Home City
                  </label>
                  <input
                    type="text"
                    value={formData.homeCity}
                    onChange={(e) => handleInputChange('homeCity', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PublicSansMedium font-normal text-lg"
                    readOnly
                  />
                </div>

                {/* Countries Visited */}
                <div>
                  <label className="block text-lg font-normal text-[#0D121C] mb-2">
                    Countries Visited
                  </label>
                  <textarea
                    value={formData.countriesVisited}
                    onChange={(e) => handleInputChange('countriesVisited', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] resize-none font-PublicSansMedium font-normal text-lg"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>   
    </div>
  );
};

export default UserDetails;