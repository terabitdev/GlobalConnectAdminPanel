import React, { useState, useRef, useEffect } from "react";
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
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { FaStar } from "react-icons/fa6";
import Sidebar from "../Components/Sidebar";
import { FaCaretDown } from "react-icons/fa";
import { useNavigate } from "react-router";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { getFlagPath, formatTimestamp } from "../utils/countryFlags";

function TipsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [activeMenuItem, setActiveMenuItem] = useState("Tips Management");
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [allCountries, setAllCountries] = useState(["All Countries"]);
  const [allCities, setAllCities] = useState(["All Cities"]);
  const [allCategories, setAllCategories] = useState(["All Categories"]);
  const sidebarRef = useRef();
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, tip: null });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [deleting, setDeleting] = useState(false);

  // Fetch tips and user data
  useEffect(() => {
    const fetchTipsAndUsers = async () => {
      try {
        setLoading(true);
        
        // Fetch all users for countries and cities
        const usersSnapshot = await getDocs(collection(db, "users"));
        const countriesSet = new Set();
        const citiesSet = new Set();
        const usersData = {};
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.nationality) countriesSet.add(data.nationality);
          if (data.homeCity) citiesSet.add(data.homeCity);
          usersData[doc.id] = data;
        });
        setAllCountries(["All Countries", ...Array.from(countriesSet).sort()]);
        setAllCities(["All Cities", ...Array.from(citiesSet).sort()]);

        // Fetch all tips documents for categories
        const tipsSnapshot = await getDocs(collection(db, "tips"));
        const allTips = [];
        const userPromises = [];
        const categoriesSet = new Set();
        tipsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userTips && Array.isArray(data.userTips)) {
            data.userTips.forEach((tip) => {
              allTips.push({
                ...tip,
                docId: doc.id,
                id: tip.id || Math.random().toString(36).substr(2, 9)
              });
              if (tip.createdBy && !userPromises.includes(tip.createdBy)) {
                userPromises.push(tip.createdBy);
              }
              if (tip.category) categoriesSet.add(tip.category);
            });
          }
        });
        setAllCategories(["All Categories", ...Array.from(categoriesSet).sort()]);

        // Fetch user data for all unique users in tips
        for (const userId of userPromises) {
          try {
            if (!usersData[userId]) {
              const userDoc = await getDoc(doc(db, "users", userId));
              if (userDoc.exists()) {
                usersData[userId] = userDoc.data();
              }
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        }
        setTips(allTips);
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching tips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTipsAndUsers();
  }, []);

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

  const handleDeleteTip = (tip) => {
    setDeleteModal({ isOpen: true, tip });
  };

  const confirmDeleteTip = async () => {
    if (!deleteModal.tip) return;
    setDeleting(true);
    try {
      // Remove the tip from the userTips array in the correct tips document
      const tipDocRef = doc(db, "tips", deleteModal.tip.docId);
      const tipDocSnap = await getDoc(tipDocRef);
      if (tipDocSnap.exists()) {
        const data = tipDocSnap.data();
        const updatedUserTips = (data.userTips || []).filter(t => t.id !== deleteModal.tip.id);
        await updateDoc(tipDocRef, { userTips: updatedUserTips });
        // Remove from local state
        setTips(prev => prev.filter(t => t.id !== deleteModal.tip.id));
        setAlert({ show: true, type: 'success', message: 'Tip deleted successfully!' });
      } else {
        setAlert({ show: true, type: 'error', message: 'Tip not found in database.' });
      }
    } catch (error) {
      setAlert({ show: true, type: 'error', message: 'Failed to delete tip.' });
      console.error('Error deleting tip:', error);
    } finally {
      setDeleting(false);
      setDeleteModal({ isOpen: false, tip: null });
    }
  };

  const closeAlert = () => setAlert({ show: false, type: '', message: '' });

  const handleViewTip = (tipId) => {
    console.log(`View tip ${tipId}`);
    // Add view logic here
  };

  const openDrawer = () => {
    sidebarRef.current?.openDrawer();
  };

  const filteredTips = tips.filter((tip) => {
    const user = users[tip.createdBy];
    const userName = user?.fullName || "Unknown User";
    const tipTitle = tip.title || "";
    const tipDescription = tip.tip || "";
    const tipCategory = tip.category || "";
    const tipCity = user?.homeCity || "";

    // Filter by selected city (if not "All Cities")
    if (selectedCity !== "All Cities" && tipCity !== selectedCity) return false;

    // Filter by selected category (if not "All Categories")
    if (selectedCategory !== "All Categories" && tipCategory !== selectedCategory) return false;

    // Existing search logic
    return (
      tipTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tipDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tipCategory.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // UserAvatar component for profile image with loader
  function UserAvatar({ user, userName, size = "md" }) {
    const [imgLoading, setImgLoading] = React.useState(!!user?.profileImageUrl);
    const sizeClass = size === "lg" ? "w-12 h-12" : "w-10 h-10";
    return (
      <div className={`relative ${sizeClass} flex-shrink-0`}>
        {user?.profileImageUrl && (
          <>
            {imgLoading && (
              <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full`}>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
            <img
              src={user.profileImageUrl}
              alt={userName}
              className={`${sizeClass} rounded-md object-cover flex-shrink-0 ${imgLoading ? 'invisible' : ''}`}
              onLoad={() => setImgLoading(false)}
              onError={(e) => {
                setImgLoading(false);
                e.target.style.display = 'none';
                e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
              }}
            />
          </>
        )}
        <div className={`${sizeClass} rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 absolute top-0 left-0 ${user?.profileImageUrl && !imgLoading ? 'hidden' : ''}`}>
          <span className="text-lg font-semibold text-gray-600">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  // Mobile Tip Card Component
  const TipCard = ({ tip }) => {
    const user = users[tip.createdBy];
    const userName = user?.fullName || "Unknown User";
    const userNationality = user?.nationality || "Unknown";
    const flagPath = getFlagPath(userNationality);
    const formattedTime = formatTimestamp(tip.createdAt);
    
    return (
      <div className="bg-[#F8F9FA] border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex space-x-3 mb-3">
          <UserAvatar user={user} userName={userName} size="lg" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-sm">{userName}</h4>
                <div className="flex items-center space-x-1">
                  <img 
                    src={flagPath} 
                    alt={userNationality} 
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      console.log(`Flag failed to load for ${userNationality}:`, flagPath);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log(`Flag loaded successfully for ${userNationality}:`, flagPath);
                    }}
                  />
                  <span className="text-xs text-gray-600">{userNationality}</span>
                </div>
              </div>
              <span className="text-xs text-gray-500">{formattedTime}</span>
            </div>
            <h3 className="font-semibold text-base mb-2">{tip.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {tip.tip}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <img src="/assets/like.svg" className="w-4 h-4" />
                  <span className="text-xs text-gray-600">{tip.likeCount || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <img src="/assets/dislike.svg" className="w-4 h-4" />
                  <span className="text-xs text-gray-600">{tip.dislikeCount || 0}</span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteTip(tip)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-md transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                  {allCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
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
                  {allCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
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
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500">Loading tips...</p>
              </div>
            ) : (
              filteredTips.length > 0 ? (
                filteredTips.map((tip) => {
                  const user = users[tip.createdBy];
                  const userName = user?.fullName || "Unknown User";
                  const userNationality = user?.nationality || "Unknown";
                  const flagPath = getFlagPath(userNationality);
                  const formattedTime = formatTimestamp(tip.createdAt);
                  
                  return (
                    <div
                      key={tip.id}
                      className="bg-[#4BADE61A] rounded-3xl shadow-sm border p-6"
                    >
                      <div className="flex space-x-4">
                        {/* User Profile Image */}
                        <UserAvatar user={user} userName={userName} size="lg" />

                        {/* Tip Details */}
                        <div className="flex-1">
                          {/* User Info and Actions */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-3">
                                <h4 className="text-lg font-semibold text-[#212121] font-Urbanist">
                                  {userName}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={flagPath}
                                    alt={userNationality}
                                    className="w-5 h-5 object-contain"
                                    onError={(e) => {
                                      console.log(`Flag failed to load for ${userNationality}:`, flagPath);
                                      e.target.style.display = 'none';
                                    }}
                                    onLoad={() => {
                                      console.log(`Flag loaded successfully for ${userNationality}:`, flagPath);
                                    }}
                                  />
                                  <span className="text-sm text-black font-WorkSansRegular ">
                                    {userNationality}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[15px] font-Urbanist text-primaryBlue">
                                {formattedTime}
                              </span>
                            </div>

                            <button
                              onClick={() => handleDeleteTip(tip)}
                              className="bg-white border border-[#4BADE6] text-[#4BADE6] px-4 py-1 rounded text-sm "
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        {/* Tip Title */}
                        <h3 className="text-lg font-semibold text-[#212121] font-Urbanist ">
                          {tip.title}
                        </h3>

                        {/* Description */}
                        <p className="text-secondaryGray font-Urbanist text-[15px] leading-relaxed ">
                          {tip.tip}
                        </p>

                        {/* location */}
                        {tip.address && (
                          <div className="flex items-center space-x-2 my-1 ">
                            <img src="/assets/location.svg" className="w-4 h-4" />
                            <p className="text-black font-WorkSansRegular text-xs leading-relaxed ">
                              {tip.address}
                            </p>
                          </div>
                        )}

                        {/* Like/Dislike and Category */}
                        <div className="flex items-center justify-between font-WorkSansRegular">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full">
                              <img src="/assets/like.svg" className="w-4 h-4" />
                              <span className="text-sm  text-secondaryGray">
                                {tip.likeCount || 0}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full">
                              <img src="/assets/dislike.svg" className="w-4 h-4" />
                              <span className="text-sm font-medium text-secondaryGray">
                                {tip.dislikeCount || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Search size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">
                    No tips found matching your search criteria.
                  </p>
                </div>
              )
            )}
          </div>

          {/* Mobile Tip Cards - Visible only on Mobile/Tablet */}
          <div className="lg:hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500">Loading tips...</p>
              </div>
            ) : filteredTips.length > 0 ? (
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
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setDeleteModal({ isOpen: false, tip: null })}><X size={20} /></button>
            <div className="flex flex-col items-center">
              <AlertCircle className="text-red-500 mb-2" size={40} />
              <h2 className="text-lg font-semibold mb-2">Delete Tip?</h2>
              <p className="text-gray-600 mb-4 text-center">Are you sure you want to delete this tip? This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button onClick={() => setDeleteModal({ isOpen: false, tip: null })} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" disabled={deleting}>Cancel</button>
                <button onClick={confirmDeleteTip} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 flex items-center justify-center min-w-[80px]" disabled={deleting}>
                  {deleting ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span> : null}
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {alert.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center px-4 py-3 rounded shadow-lg transition-all ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {alert.type === 'success' ? <CheckCircle className="mr-2" /> : <AlertCircle className="mr-2" />}
          <span>{alert.message}</span>
          <button className="ml-3 text-lg font-bold" onClick={closeAlert}>&times;</button>
        </div>
      )}
    </div>
  );
}

export default TipsManagement;
