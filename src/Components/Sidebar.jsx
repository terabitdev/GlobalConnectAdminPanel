

import React, { useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Sidebar = forwardRef(({ onItemClick }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const sidebarItems = [
    { name: "Dashboard", iconPath: "/assets/dashboard.svg", route: "/dashboard", matchPaths: ["/dashboard"] },
    { name: "Users", iconPath: "/assets/user.svg", route: "/users-management", matchPaths: ["/users-management", "/users"] },
    { name: "Event Management", iconPath: "/assets/event.svg", route: "/events", matchPaths: ["/events", "/event-management"] },
    { name: "Restaurant Management", iconPath: "/assets/restaurant.svg", route: "/restaurants", matchPaths: ["/restaurants", "/restaurant-management"] },
    { name: "Tips Management", iconPath: "/assets/tips.svg", route: "/tips", matchPaths: ["/tips", "/tips-management"] },
  ];

  // Enhanced route matching that handles nested routes and URL params
  const getActiveItem = () => {
    const currentPath = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    
    // Log current route info for debugging
    console.log("Current pathname:", currentPath);
    console.log("URL params:", params);
    console.log("Search params:", Object.fromEntries(searchParams));
    
    // Find matching sidebar item based on current path
    const activeItem = sidebarItems.find(item => {
      // Check exact match first
      if (currentPath === item.route) {
        return true;
      }
      
      // Check if current path starts with any of the match paths
      return item.matchPaths.some(matchPath => {
        // Handle nested routes (e.g., /events/add-event should match /events)
        if (currentPath.startsWith(matchPath)) {
          // Make sure it's a proper path segment match, not just a string prefix
          const remainingPath = currentPath.slice(matchPath.length);
          return remainingPath === '' || remainingPath.startsWith('/');
        }
        return false;
      });
    });

    return activeItem ? activeItem.name : "Dashboard";
  };

  // Get route information for current page
  const getCurrentRouteInfo = () => {
    return {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      params: params,
      searchParams: Object.fromEntries(new URLSearchParams(location.search)),
      activeItem: getActiveItem()
    };
  };

  const handleLogout = async () => {
    try {
      console.log("Logout clicked");
      setIsOpen(false);
      
      // Sign out from Firebase
      await signOut(auth);
      console.log("User signed out successfully");
      
      // Navigate to login page (this will be handled by AuthContext automatically)
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleItemClick = (itemName, route) => {
    // Log navigation info
    console.log(`Navigating from ${location.pathname} to ${route}`);
    
    // Navigate to the route
    navigate(route);
    
    // Call parent callback if provided with current route info
    if (onItemClick) {
      onItemClick(itemName, getCurrentRouteInfo());
    }
    
    setIsOpen(false); // Close drawer when item is clicked on mobile
  };

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openDrawer,
    closeDrawer,
    isOpen,
    getCurrentRouteInfo,
    getActiveItem
  }));

  // Close drawer on ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen]);

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Update active item when route changes
  useEffect(() => {
    const routeInfo = getCurrentRouteInfo();
    console.log("Route changed:", routeInfo);
    
    // Call parent callback when route changes
    if (onItemClick) {
      onItemClick(routeInfo.activeItem, routeInfo);
    }
  }, [location.pathname, location.search, params]);

  const activeItem = getActiveItem();

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeDrawer}
      />

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full w-full min-w-[17rem] max-w-[17rem] bg-white shadow-custom flex flex-col z-50 
        transform transition-transform duration-300 ease-in-out
        lg:transform-none lg:transition-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 relative">
          <img
            src="/assets/logosidebar.png"
            alt="logo"
            className="w-full h-auto max-h-32 sm:max-h-40 lg:max-h-none lg:h-full object-contain lg:object-cover 2xl:h-[8rem] 2xl:w-[40rem]"
          />
          {/* Close button for mobile */}
          <button
            onClick={closeDrawer}
            className="lg:hidden absolute top-2 right-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => {
              const isActive = item.name === activeItem;
              return (
                <li key={index}>
                  <button
                    onClick={() => handleItemClick(item.name, item.route)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${
                      isActive
                        ? "bg-blue-50 text-primaryBlue"
                        : "text-dark hover:bg-gray-50"
                    }`}
                  >
                    <img 
                      src={item.iconPath} 
                      alt={`${item.name} icon`}
                      className={`w-5 h-5 object-contain transition-opacity ${
                        isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                      }`}
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.target.style.display = 'none';
                      }}
                    />
                    <span className="font-BarlowMedium w-max">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 text-white bg-primaryBlue rounded-lg w-full"
          >
            <img src="/assets/logout.svg" alt="logout" />
            <span className="font-BarlowMedium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;