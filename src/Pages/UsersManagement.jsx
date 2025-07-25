import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Eye, Trash2, Menu, User, Mail, MapPin, Calendar, Globe, X, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import { FaCaretDown } from "react-icons/fa";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";

function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [activeMenuItem, setActiveMenuItem] = useState("Users");
  const [users, setUsers] = useState([]);
  const [availableCountries, setAvailableCountries] = useState(["All Countries"]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: "" });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const sidebarRef = useRef();
  const navigate = useNavigate();

  // Alert timeout cleanup
  useEffect(() => {
    let timeoutId;
    if (alert.show) {
      timeoutId = setTimeout(() => {
        setAlert({ show: false, type: '', message: '' });
      }, 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [alert.show]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "user"));
        const querySnapshot = await getDocs(q);
        
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          avatar: doc.data().profileImageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face", // Use profileImageUrl from Firebase, fallback to default
          name: doc.data().fullName || "N/A",
          email: doc.data().email || "N/A",
          country: doc.data().nationality || "N/A",
          joinDate: doc.data().dateOfBirth || "N/A",
          location: doc.data().homeCity || "N/A",
          status: "active"
        }));
        
        // Extract unique countries from users data
        const uniqueCountries = [...new Set(usersData
          .map(user => user.country)
          .filter(country => country !== "N/A")
        )].sort();
        
        setAvailableCountries(["All Countries", ...uniqueCountries]);
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
    navigate(`/users-management/user-details/${userId}`);
  };

  const handleDelete = (userId, userName) => {
    setDeleteModal({ isOpen: true, userId, userName });
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, "users", deleteModal.userId));
      
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the users list by filtering out the deleted user
      setUsers(prevUsers => prevUsers.filter(user => user.id !== deleteModal.userId));
      
      // Close the modal
      setDeleteModal({ isOpen: false, userId: null, userName: "" });
      
      // Show success alert
      showAlert('success', 'User has been successfully deleted');
    } catch (error) {
      console.error("Error deleting user:", error);
      showAlert('error', 'Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDrawer = () => {
    sidebarRef.current?.openDrawer();
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedCountry === "All Countries" || user.country === selectedCountry)
  );

  // Function to truncate email for better display
  const truncateEmail = (email, maxLength = 25) => {
    if (email.length <= maxLength) return email;
    return email.slice(0, maxLength) + "...";
  };

  const UserImage = ({ src, alt, isMobile }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const imageClasses = isMobile ? "w-12 h-12 rounded-full" : "w-10 h-10 rounded-md";
    
    return (
      <div className={imageClasses}>
        {imageLoading && (
          <div className={`${imageClasses} bg-[#3B82F640] animate-pulse`} />
        )}
        <img
          src={src}
          alt={alt}
          className={`${imageClasses} object-cover flex-shrink-0 ${imageLoading ? 'hidden' : 'block'}`}
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
            setImageLoading(false);
            e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face";
          }}
        />
      </div>
    );
  };

  // Mobile Card Component
  const UserCard = ({ user }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <UserImage src={user.avatar} alt={user.name} isMobile={true} />
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
            onClick={() => handleDelete(user.id, user.name)}
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
          <Globe size={14} />
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

  // Loading Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryBlue"></div>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="text-center py-12">
      <User size={48} className="mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500 text-lg">
        No users found matching your search criteria.
      </p>
    </div>
  );

  // Alert Component
  const AlertBox = ({ type, message }) => (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
    }`}>
      <div className="flex items-center">
        {type === 'success' ? (
          <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
        ) : (
          <AlertCircle className="w-6 h-6 mr-2 text-red-500" />
        )}
        <p className="font-medium">{message}</p>
      </div>
      <button
        onClick={() => setAlert({ show: false, type: '', message: '' })}
        className="ml-4 text-gray-400 hover:text-gray-600"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-PlusJakarta">
      {/* Alert */}
      {alert.show && (
        <AlertBox type={alert.type} message={alert.message} />
      )}

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
                {availableCountries.map((country) => (
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

          {/* Delete Confirmation Modal */}
          {deleteModal.isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fadeIn">
                {/* Close button */}
                <button
                  onClick={() => setDeleteModal({ isOpen: false, userId: null, userName: "" })}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>

                {/* Warning Icon */}
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-red-100 rounded-full p-3">
                    <Trash2 size={32} className="text-red-500" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-center mb-2">Delete User</h3>
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete <span className="font-semibold">{deleteModal.userName}</span>? This action cannot be undone.
                </p>

                {/* Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, userId: null, userName: "" })}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 relative"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Initial Loading State */}
          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue mx-auto mb-4"></div>
                <p className="text-gray-500 text-lg">Loading users...</p>
              </div>
            </div>
          )}

          {/* Desktop Table View - Hidden on Mobile */}
          {!loading && (
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
                        Date of Birth
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-black w-[12%]">
                        City
                      </th>
                      <th className="text-left 2xl:text-center py-3 px-4 font-semibold text-black w-[14%]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={isDeleting ? 'opacity-50' : ''}>
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
                            <UserImage src={user.avatar} alt={user.name} isMobile={false} />
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

                        {/* Country */}
                        <td className="py-4 px-4">
                          <span className="font-Urbanist text-base text-[#212121] truncate">
                            {user.country}
                          </span>
                        </td>

                        {/* Date of Birth */}
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
                              onClick={() => handleDelete(user.id, user.name)}
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

                {/* Empty State for Desktop */}
                {filteredUsers.length === 0 && <EmptyState />}
              </div>
            </div>
          )}

          {/* Mobile Card View - Visible only on Mobile/Tablet */}
          {!loading && (
            <div className="lg:hidden">
              {filteredUsers.length > 0 ? (
                <div className={`space-y-4 ${isDeleting ? 'opacity-50' : ''}`}>
                  {filteredUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </div>
          )}

          {/* Deletion Loading Overlay */}
          {isDeleting && (
            <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-40">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryBlue mx-auto"></div>
              </div>
            </div>
          )}
        </div>
      </div>   
    </div>
  );
}

export default UsersManagement;