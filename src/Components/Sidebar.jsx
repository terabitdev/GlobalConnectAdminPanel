
import React, { useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, X } from "lucide-react";

const Sidebar = forwardRef(({ onItemClick }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    { name: "Dashboard", iconPath: "/assets/dashboard.svg", route: "/dashboard" },
    { name: "Users", iconPath: "/assets/user.svg", route: "/users-management" },
    { name: "Event Management", iconPath: "/assets/event.svg", route: "/events" },
    { name: "Restaurant Management", iconPath: "/assets/restaurant.svg", route: "/restaurants" },
    { name: "Tips Management", iconPath: "/assets/tips.svg", route: "/tips" }
  ];

  // Get current active item based on current route
  const getActiveItem = () => {
    const currentItem = sidebarItems.find(item => location.pathname === item.route);
    return currentItem ? currentItem.name : "Dashboard";
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    setIsOpen(false);
    // Add logout logic here (clear tokens, etc.)
    navigate("/login"); // Navigate to login page
  };

  const handleItemClick = (itemName, route) => {
    // Navigate to the route
    navigate(route);
    
    // Call parent callback if provided
    if (onItemClick) {
      onItemClick(itemName);
    }
    
    setIsOpen(false); // Close drawer when item is clicked on mobile
  };

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openDrawer,
    closeDrawer,
    isOpen
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
        fixed lg:relative top-0 left-0 h-full w-full min-w-[17rem] max-w-[17rem]  bg-white shadow-custom flex flex-col z-50 
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
          <ul className="space-y-2 ">
            {sidebarItems.map((item, index) => {
              const isActive = item.name === activeItem;
              return (
                <li key={index}>
                  <button
                    onClick={() => handleItemClick(item.name, item.route)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors  w-full text-left ${
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
            className="flex items-center space-x-3 px-3 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors w-full"
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