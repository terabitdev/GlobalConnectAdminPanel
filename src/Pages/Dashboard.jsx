
import React, { useState, useRef } from "react";
import { Plus, Menu } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import UserDistributionChart from "../Components/UserDistributionChart";

function Dashboard() {
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const sidebarRef = useRef();

  const statsCards = [
    {
      title: "Active Users",
      value: "2,847",
      change: "+12% from last period",
      bgColor: "bg-[#3B82F640]",
      iconPath: "/assets/dashboard/user.svg",
      changeColor: "text-[#3B82F6]"
    },
    {
      title: "Restaurants",
      value: "156",
      change: "+8% from last period",
      iconPath: "/assets/dashboard/restaurant.svg",
      bgColor: "bg-[#22C55E40]",
      changeColor: "text-[#22C55E]"
    },
    {
      title: "Total Tips",
      value: "1,234",
      change: "+3 from last period",
      iconPath: "/assets/dashboard/tips.svg",
      bgColor: "bg-[#A855F740]",
      changeColor: "text-[#A855F7]"
    },
    {
      title: "Active Events",
      value: "89",
      change: "+6% from last period",
      iconPath: "/assets/dashboard/events.svg",
      bgColor: "bg-[#EAB30840]",
      changeColor: "text-[#EAB308]"
    }
  ];

  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
    console.log(`Navigating to: ${itemName}`);
  };

  const handleAddEvent = () => {
    console.log("Add Event clicked");
    // Add event logic here
  };

  const handleAddRestaurant = () => {
    console.log("Add Restaurant clicked");
    // Add restaurant logic here
  };

  const openDrawer = () => {
    sidebarRef.current?.openDrawer();
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
        <div className="w-full h-16 shadow-custom bg-[#FAFAFB] flex items-center px-4">
          <button
            onClick={openDrawer}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors mr-3"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 lg:hidden">Dashboard</h1>
        </div>
        
        <div className="p-8 overflow-y-auto h-full scrollbar-hide">
          {/* Header - hidden on mobile since it's in the top bar */}
          <h1 className="text-2xl font-bold text-black mb-4 hidden lg:block">Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((card, index) => {
              return (
                <div key={index} className={`${card.bgColor} rounded-lg p-3 h-34`}>
                  <div className="flex items-center justify-between mb-2">
                    <img 
                      src={card.iconPath} 
                      alt={`${card.title} icon`}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <p className={`text-xs ${card.changeColor}`}>{card.change}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-black">{card.value}</p>
                    <p className="text-sm font-normal text-black">{card.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* User Distribution Chart Component */}
          <div className="mb-8 font-DMSansRegular">
            <UserDistributionChart />
          </div>

          {/* Quick Actions */}
    
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/assets/icons/quick-actions.png" 
                alt="Quick Actions icon"
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <h2 className="text-lg font-semibold text-black">Quick Actions</h2>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={handleAddEvent}
                className="flex items-center space-x-2 px-4 py-2 bg-primaryBlue text-white rounded-lg"
              >
                <Plus size={20} />
                <span className="font-medium">Add Event</span>
              </button>
              <button 
                onClick={handleAddRestaurant}
                className="flex items-center space-x-2 px-4 py-2 bg-primaryBlue text-white rounded-lg"
              >
                <Plus size={20} />
                <span className="font-medium">Add Restaurant</span>
              </button>
            </div>
          </div>
        </div>
      </div>   
  );
}

export default Dashboard;