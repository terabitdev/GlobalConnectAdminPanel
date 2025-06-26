import React, { useState } from "react";
import { 
  Users, 
  Calendar, 
  MapPin, 
  Lightbulb,
  Plus,
  Link
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import UserDistributionChart from "../Components/UserDistributionChart";

function Dashboard() {
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");

  const statsCards = [
    {
      title: "Active Users",
      value: "2,847",
      change: "+12% from last period",
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Restaurants",
      value: "156",
      change: "+8% from last period",
      icon: MapPin,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Total Tips",
      value: "1,234",
      change: "+3 from last period",
      icon: Lightbulb,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      title: "Active Events",
      value: "89",
      change: "+6% from last period",
      icon: Calendar,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar 
        activeItem={activeMenuItem} 
        onItemClick={handleMenuItemClick} 
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className={`${card.bgColor} rounded-lg p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${card.iconColor} bg-white`}>
                      <Icon size={24} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500">{card.change}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* User Distribution Chart Component */}
          <div className="mb-8">
            <UserDistributionChart />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Link size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={handleAddEvent}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Plus size={18} />
                <span>Add Event</span>
              </button>
              <button 
                onClick={handleAddRestaurant}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Plus size={18} />
                <span>Add Restaurant</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;