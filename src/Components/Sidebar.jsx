import React from "react";
import { 
  Users, 
  Calendar, 
  MapPin, 
  Lightbulb, 
  LogOut,
    LayoutDashboard
} from "lucide-react";

function Sidebar({ activeItem = "Dashboard", onItemClick }) {
  const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard, active: true },
    { name: "Users", icon: Users, active: false },
    { name: "Event Management", icon: Calendar, active: false },
    { name: "Restaurant Management", icon: MapPin, active: false },
    { name: "Tips Management", icon: Lightbulb, active: false }
  ];

  const handleLogout = () => {
    console.log("Logout clicked");
    // Add logout logic here
  };

  return (
    <div className="w-64 bg-white shadow-custom flex flex-col">
      {/* Logo */}
      <div className="p-6 ">
        <img
              src="/assets/logosidebar.png"
              alt="logo"
              className="w-full h-auto max-h-32 sm:max-h-40 lg:max-h-none lg:h-full object-contain lg:object-cover 2xl:h-[14rem] 2xl:w-[40rem]"
            />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.name === activeItem;
            return (
              <li key={index}>
                <button
                  onClick={() => onItemClick && onItemClick(item.name)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${
                    isActive
                      ? "bg-blue-50 text-primaryBlue  "
                      : "text-dark hover:bg-gray-50"
                  }`}
                >
                  <Icon size={20} />
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
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;