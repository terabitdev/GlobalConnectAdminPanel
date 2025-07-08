import React, { useState, useRef } from "react";
import { Search, ChevronDown, Plus, Menu, Edit, Eye, MapPin, Star, Users, Trash2, Clock, Loader2 } from "lucide-react";
import { FaStar } from "react-icons/fa6";
import Sidebar from "../Components/Sidebar";
import { FaCaretDown } from "react-icons/fa";
import { useNavigate } from "react-router";
import { FaHandshakeSimple } from "react-icons/fa6";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";

function RestaurantManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedRating, setSelectedRating] = useState("All Ratings");
  const [activeMenuItem, setActiveMenuItem] = useState("Restaurant Management");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const sidebarRef = useRef();
  const navigate = useNavigate();

  const cities = ["All Cities", "Barcelona", "Madrid", "Valencia", "Seville", "Bilbao"];
  const categories = ["All Categories", "Traditional Catalan", "Cafe & Bakery", "Brewery & Restaurant", "Mediterranean", "Tapas"];
  const ratings = ["All Ratings", "5 Stars", "4+ Stars", "3+ Stars", "2+ Stars"];

  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
    console.log(`Navigating to: ${itemName}`);
  };

  const handleAddRestaurant = () => {
    console.log("Add new restaurant clicked");
    navigate("/restaurants/add-restaurant");
  };

  const handleEditRestaurant = (restaurantId) => {
    navigate(`/restaurants/edit/${restaurantId}`);
  };

  const handleDeleteRestaurant = (restaurantId) => {
    setRestaurantToDelete(restaurantId);
    setModalOpen(true);
  };

  const confirmDeleteRestaurant = async () => {
    if (!restaurantToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, "restaurants", restaurantToDelete));
      setRestaurants(restaurants.filter(restaurant => restaurant.id !== restaurantToDelete));
      setToast({ show: true, message: 'Restaurant deleted successfully!', type: 'success' });
    } catch (error) {
      setToast({ show: true, message: 'Failed to delete restaurant. Please try again.', type: 'error' });
    } finally {
      setDeleteLoading(false);
      setModalOpen(false);
      setRestaurantToDelete(null);
    }
  };

  const handleViewRestaurant = (restaurantId) => {
    console.log(`View restaurant ${restaurantId}`);
    // Add view logic here
  };

  const openDrawer = () => {
    sidebarRef.current?.openDrawer();
  };

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch restaurants from Firebase
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError("");
      const restaurantsQuery = query(
        collection(db, "restaurants"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(restaurantsQuery);
      const restaurantsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Restaurant data:", data); // Debug log
        restaurantsData.push({
          id: doc.id,
          name: data.restaurantName || "Untitled Restaurant",
          address: data.address || "No address provided",
          cuisine: data.cuisineType || "Unknown cuisine",
          city: data.city || "Unknown city",
          description: data.description || "No description available",
          images: data.images || [],
          featured: data.featuredRestaurant === true,
          priceRange: data.priceRange || "",
          phoneNumber: data.phoneNumber || "",
          createdAt: data.createdAt,
          createdByEmail: data.createdByEmail || "",
          // Add more fields as needed
        });
      });
      setRestaurants(restaurantsData);
      console.log("Fetched restaurants:", restaurantsData); // Debug log
    } catch (error) {
      setError("Failed to load restaurants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRestaurants();
  }, []);

  // Auto-hide toast after 3s
  React.useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Mobile Restaurant Card Component
  const RestaurantCard = ({ restaurant }) => {
    const [imageLoading, setImageLoading] = useState(true);

    return (
    <div className="bg-[#F8F9FA] border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex space-x-4 mb-3">
        <div className="relative w-14 h-14 flex-shrink-0">
          {imageLoading && (
            <div className="absolute inset-0 bg-[#22C55E40] rounded-md animate-pulse"></div>
          )}
          <img
            src={restaurant.images && restaurant.images.length > 0 ? restaurant.images[0] : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&h=120&fit=crop"}
            alt={restaurant.name}
            className={`w-14 h-14 rounded-md object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              setImageLoading(false);
              e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&h=120&fit=crop";
            }}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg leading-tight">{restaurant.name}</h3>
            {restaurant.featured && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full flex-shrink-0 flex items-center">
                <Star size={10} className="inline mr-1" />
                Featured
              </span>
            )}
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin size={12} className="mr-1" />
              <span>{restaurant.address}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium">{restaurant.cuisine}</span>
            </div>
            {/* Added by Admin */}
            <div className="flex items-center text-xs text-gray-500 mt-1">
              Added by Admin: <span className="ml-1 font-semibold">{restaurant.createdByEmail || "Unknown"}</span>
            </div>
            {/* Add more fields as needed */}
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{restaurant.description}</p>
      {/* Status Tags */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditRestaurant(restaurant.id)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => handleDeleteRestaurant(restaurant.id)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
  };

  // Desktop Restaurant Card Component
  const DesktopRestaurantCard = ({ restaurant }) => {
    const [imageLoading, setImageLoading] = useState(true);
    
    return (
      <div className="bg-[#4BADE61A] rounded-3xl shadow-sm border p-6">
        <div className="flex space-x-4">
          {/* Restaurant Image */}
          <div className="relative w-24 h-40 flex-shrink-0">
            {imageLoading && (
              <div className="absolute inset-0 bg-[#22C55E40] rounded-l-3xl animate-pulse"></div>
            )}
            <img
              src={restaurant.images && restaurant.images.length > 0 ? restaurant.images[0] : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&h=120&fit=crop"}
              alt={restaurant.name}
              className={`w-24 h-40 rounded-l-3xl object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                setImageLoading(false);
                e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&h=120&fit=crop";
              }}
            />
          </div>
          
          {/* Restaurant Details */}
          <div className="flex-1">
            {/* Name, Buttons, and Featured Badge */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-[#212121] font-Urbanist">{restaurant.name}</h3>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleEditRestaurant(restaurant.id)}
                    className="bg-[#4BADE6] text-white px-4 py-1 rounded text-sm "
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRestaurant(restaurant.id)}
                    className="bg-white border border-[#4BADE6] text-[#4BADE6] px-4 py-1 rounded text-sm "
                  >
                    Delete
                  </button>
                </div>
                {restaurant.featured && (
                  <span className="px-2 py-[5px] bg-[#FDE0E0] text-black text-sm rounded flex items-center">
                    <FaStar size={15} className="mr-1" />
                    Featured
                  </span>
                )}
              </div>
            </div>
            
            {/* Address */}
            <div className="flex items-center space-x-2 text-black font-WorkSansMedium mb-1">
              <img src="/assets/location.svg" className="w-4 h-4" />
              <span className="text-sm">{restaurant.address}</span>
              <span className="text-sm font-medium"> • {restaurant.cuisine}</span>
            </div>
            
            {/* Rating */}
            <div className="flex items-center mb-3">
              <div className="flex space-x-1 mr-2">
                <FaStar size={14} className="text-yellow-500" />
              </div>
              <span className="text-sm text-black font-WorkSansMedium">
                {restaurant.rating} • {restaurant.reviewCount} reviews • Added by {restaurant.createdByEmail}
              </span>
            </div>
            
            {/* Description */}
            <p className="text-black font-WorkSansMedium text-sm leading-relaxed mb-4">{restaurant.description}</p>
          </div>
        </div>
      </div>
    );
  };

  const DeleteModal = () => (
    modalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Delete Restaurant</h3>
          <p className="mb-4 text-gray-700">Are you sure you want to delete this restaurant? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => { setModalOpen(false); setRestaurantToDelete(null); }}
              className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteRestaurant}
              className={`px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 flex items-center ${deleteLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={deleteLoading}
            >
              {deleteLoading && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>}
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  );

  const Toast = () => (
    toast.show && (
      <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}> 
        {toast.message}
      </div>
    )
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <DeleteModal />
      <Toast />
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
            <h1 className="text-sm sm:text-xl font-bold text-black lg:hidden font-PlusJakartaSans">Restaurant & Place Management</h1>
          </div>
          <button
            onClick={handleAddRestaurant}
            className="lg:hidden flex items-center space-x-2 bg-[#4BADE6] text-white px-2 py-2 rounded-lg text-sm"
          >
            <Plus size={16} />
            <span>Add New Restaurant</span>
          </button>
        </div>
        
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full scrollbar-hide">
          {/* Header with Add Button - hidden on mobile since it's in the top bar */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-2xl font-bold font-PlusJakartaSans text-black">Restaurant & Place Management</h1>
            <button
              onClick={handleAddRestaurant}
              className="flex items-center space-x-2 bg-[#4BADE6]  text-white px-4 py-2 rounded-lg "
            >
              <Plus size={20} />
              <span>Add New Restaurant</span>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4BADE6]"></div>
                <p className="mt-2 text-sm text-gray-600">Loading restaurants...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <p>{error}</p>
                <button
                  onClick={fetchRestaurants}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div>
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
                    placeholder="Search restaurants by name, cuisine, or location"
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

                  {/* Rating Filter */}
                  <div className="relative sm:max-w-[12.5rem] sm:w-full">
                    <select
                      value={selectedRating}
                      onChange={(e) => setSelectedRating(e.target.value)}
                      className="appearance-none bg-[#FAFAFB] border text-grayModern border-gray-300 rounded-lg px-4 py-2.5 sm:py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm sm:text-base"
                    >
                      {ratings.map((rating) => (
                        <option key={rating} value={rating}>
                          {rating}
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

              {/* Desktop Restaurant Cards - Hidden on Mobile */}
              <div className="hidden lg:block space-y-4">
                {filteredRestaurants.map((restaurant) => (
                  <DesktopRestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}

                {/* Empty State - Desktop */}
                {filteredRestaurants.length === 0 && (
                  <div className="text-center py-12">
                    <Search size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">
                      No restaurants found matching your search criteria.
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile Restaurant Cards - Visible only on Mobile/Tablet */}
              <div className="lg:hidden">
                {filteredRestaurants.length > 0 ? (
                  <div className="space-y-4">
                    {filteredRestaurants.map((restaurant) => (
                      <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-base">
                      No restaurants found matching your search criteria.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>   
    </div>
  );
}

export default RestaurantManagement;