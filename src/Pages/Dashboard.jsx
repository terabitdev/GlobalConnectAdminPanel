import React, { useState, useRef, useEffect } from "react";
import { Plus, Menu } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import UserDistributionChart from "../Components/UserDistributionChart";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

function Dashboard() {
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalRestaurants: 0,
    totalTips: 0,
    activeEvents: 0,
  });
  const sidebarRef = useRef();
  const Navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch users with role 'user'
        const usersQuery = query(
          collection(db, "users"),
          where("role", "==", "user")
        );
        const usersSnapshot = await getDocs(usersQuery);
        const activeUsersCount = usersSnapshot.size;

        // Fetch total restaurants
        const restaurantsSnapshot = await getDocs(collection(db, "restaurants"));
        const restaurantsCount = restaurantsSnapshot.size;

        // Fetch total tips
        const tipsSnapshot = await getDocs(collection(db, "tips"));
        const tipsCount = tipsSnapshot.size;

        // Fetch total events
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const eventsCount = eventsSnapshot.size;

        setStats({
          activeUsers: activeUsersCount,
          totalRestaurants: restaurantsCount,
          totalTips: tipsCount,
          activeEvents: eventsCount,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: "Active Users",
      value: stats.activeUsers.toString(),
      bgColor: "bg-[#3B82F640]",
      iconPath: "/assets/dashboard/user.svg",
      changeColor: "text-[#3B82F6]"
    },
    {
      title: "Restaurants",
      value: stats.totalRestaurants.toString(),
      iconPath: "/assets/dashboard/restaurant.svg",
      bgColor: "bg-[#22C55E40]",
      changeColor: "text-[#22C55E]"
    },
    {
      title: "Total Tips",
      value: stats.totalTips.toString(),
      iconPath: "/assets/dashboard/tips.svg",
      bgColor: "bg-[#A855F740]",
      changeColor: "text-[#A855F7]"
    },
    {
      title: "Active Events",
      value: stats.activeEvents.toString(),
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
    Navigate("/events/add-event");
    // Add event logic here
  };

  const handleAddRestaurant = () => {
    console.log("Add Restaurant clicked");
    Navigate("/restaurants/add-restaurant");
    // Add restaurant logic here
  };

  const openDrawer = () => {
    sidebarRef.current?.openDrawer();
  };

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
        <div className="w-full h-16 shadow-custom bg-[#FAFAFB] flex items-center px-3 sm:px-4">
          <button
            onClick={openDrawer}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors mr-2 sm:mr-3"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-black font-PlusJakartaSans lg:hidden">Dashboard</h1>
        </div>
        
        <div className="p-3 sm:p-6 lg:p-8 overflow-y-auto h-full scrollbar-hide">
          {/* Header - hidden on mobile since it's in the top bar */}
          <h1 className="text-2xl font-bold text-black font-PlusJakartaSans mb-4 hidden lg:block">Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-5 sm:mb-8">
            {statsCards.map((card, index) => {
              return (
                <div key={index} className={`${card.bgColor} rounded-lg p-3 sm:p-3 lg:p-4 h-auto min-h-[110px] sm:min-h-[130px] lg:h-34 w-[23rem] sm:w-full`}>
                  <div className="flex items-start justify-between mb-2 sm:mb-2">
                    <img 
                      src={card.iconPath} 
                      alt={`${card.title} icon`}
                      className="w-7 h-7 sm:w-10 sm:h-10 object-contain flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    {loading ? (
                      <div className="animate-pulse">
                        <div className={`h-6 sm:h-8 ${card.bgColor} rounded w-16 mb-1`}></div>
                        <div className={`h-4 sm:h-5 ${card.bgColor} rounded w-24`}></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg sm:text-2xl font-bold text-black">{card.value}</p>
                        <p className="text-xs sm:text-sm font-normal text-black">{card.title}</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* User Distribution Chart Component */}
          <div className="mb-5 sm:mb-8 font-DMSansRegular">
            <UserDistributionChart />
          </div>

          {/* Quick Actions */}
          <div>
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <img 
                src="/assets/icons/quick-actions.png" 
                alt="Quick Actions icon"
                className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <h2 className="text-base sm:text-lg font-semibold text-black">Quick Actions</h2>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={handleAddEvent}
                className="flex items-center justify-center sm:justify-start space-x-2 px-3 py-2.5 sm:px-4 sm:py-2 bg-primaryBlue text-white rounded-lg w-full sm:w-auto text-sm sm:text-base"
              >
                <Plus size={18} className="sm:w-5 sm:h-5" />
                <span className="font-medium">Add Event</span>
              </button>
              <button 
                onClick={handleAddRestaurant}
                className="flex items-center justify-center sm:justify-start space-x-2 px-3 py-2.5 sm:px-4 sm:py-2 bg-primaryBlue text-white rounded-lg w-full sm:w-auto text-sm sm:text-base"
              >
                <Plus size={18} className="sm:w-5 sm:h-5" />
                <span className="font-medium">Add Restaurant</span>
              </button>
            </div>
          </div>
        </div>
      </div>   
    </div>
  );
}

export default Dashboard;