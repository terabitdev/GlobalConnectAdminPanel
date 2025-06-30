

import React, { useState, useRef } from "react";
import { Search, ChevronDown, Plus, Menu, Edit, Eye, MapPin, Calendar, Users, Star, Trash2 } from "lucide-react";
import { FaStar } from "react-icons/fa6";
import Sidebar from "../Components/Sidebar";
import { FaCaretDown } from "react-icons/fa";
import { useNavigate } from "react-router";
function EventManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("All Events");
  const [selectedStatus, setSelectedStatus] = useState("All Types");
  const [selectedLocation, setSelectedLocation] = useState("All Status");
  const [activeMenuItem, setActiveMenuItem] = useState("Event Management");
  const sidebarRef = useRef();
  const navigate = useNavigate();

  const events = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=80&h=80&fit=crop",
      title: "Beach Volleyball Tournament",
      location: "Barcelona beach, Barcelona",
      date: "Today 6:00 PM",
      organizer: "Sofia Martinez (Local Partner)",
      attendees: 45,
      description: "Join us for a fun beach volleyball tournament on tall Luka! Swimming contest and activities. Professional courts provided.",
      status: "Active",
      featured: true,
      type: "Sports",
      tags: ["Active"],
      price: ["$20"]
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop",
      title: "DJ Flamenco Show at Patio",
      location: "Patio de la Música, Barcelona",
      date: "Tomorrow 8:00 PM",
      organizer: "Admin (Partner Event)",
      attendees: 32,
      description: "Experience authentic flamenco in Barcelona's most iconic hall. Professional dancers and musicians. Tickets available online.",
      status: "Active",
      featured: false,
      type: "Music",
      tags: ["Active"],
      price: ["$20"]
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=80&h=80&fit=crop",
      title: "Food Fair - Mercado Central",
      location: "Mercado Central, Barcelona",
      date: "Saturday 2:00 PM",
      organizer: "Barcelona Food Tours (Business Partner)",
      attendees: 18,
      description: "Discover the best local foods at Barcelona's historic central market. Guided tour with tastings included.",
      status: "Active",
      featured: false,
      type: "Food",
      tags: ["Active"],
      price: ["$20"]
    }
  ];

  const eventTypes = ["All Events", "Sports", "Music", "Food", "Art", "Technology"];
  const statusTypes = ["All Types", "Live", "Upcoming", "Completed"];
  const locationTypes = ["All Status", "Barcelona", "Madrid", "Valencia"];

  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
    console.log(`Navigating to: ${itemName}`);
  };

  const handleAddEvent = () => {
    console.log("Add new event clicked");
    // Navigate to add event page or open modal
    navigate("/events/add-event");
    // Add navigation logic here
  };

  const handleEditEvent = (eventId) => {
    console.log(`Edit event ${eventId}`);
    // Add edit logic here
  };

  const handleDeleteEvent = (eventId) => {
    console.log(`Delete event ${eventId}`);
    // Add delete logic here
  };

  const handleViewEvent = (eventId) => {
    console.log(`View event ${eventId}`);
    // Add view logic here
  };

  const openDrawer = () => {
    sidebarRef.current?.openDrawer();
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mobile Event Card Component
  const EventCard = ({ event }) => (
    <div className="bg-[#F8F9FA] border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex space-x-4 mb-3">
        <img
          src={event.image}
          alt={event.title}
          className="w-14 h-14 rounded-md object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold  text-lg leading-tight">{event.title}</h3>
            {event.featured && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full flex-shrink-0">
                <Star size={10} className="inline mr-1" />
                Featured
              </span>
            )}
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin size={12} className="mr-1" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={12} className="mr-1" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center">
              <Users size={12} className="mr-1" />
              <span>{event.attendees} attending</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
      
      {/* Status Tags */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {event.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditEvent(event.id)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => handleDeleteEvent(event.id)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 ">
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
            <h1 className="text-lg sm:text-xl font-bold text-black lg:hidden font-PlusJakartaSans">Event Management</h1>
          </div>
          <button
            onClick={handleAddEvent}
            className="lg:hidden flex items-center space-x-2 bg-primaryBlue text-white px-3 py-2 rounded-lg text-sm"
          >
            <Plus size={16} />
            <span>Add Event</span>
          </button>
        </div>
        
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full scrollbar-hide">
          {/* Header with Add Button - hidden on mobile since it's in the top bar */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-2xl font-bold font-PlusJakartaSans text-black">Event Management</h1>
            <button
              onClick={handleAddEvent}
              className="flex items-center space-x-2 bg-primaryBlue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              <span>Add New Event</span>
            </button>
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
                placeholder="Search events by name, location, or organizer"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 placeholder:text-grayModern bg-[#FAFAFB] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:grid-cols-5 lg:grid-cols-5 2xl:grid-cols-8">
              {/* Event Type Filter */}
              <div className="relative sm:max-w-[12.5rem] sm:w-full">
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="appearance-none bg-[#FAFAFB] border text-grayModern border-gray-300 rounded-lg px-4 py-2.5 sm:py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm sm:text-base"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <FaCaretDown
                  size={24}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primaryBlue pointer-events-none"
                />
              </div>

              {/* Status Filter */}
              <div className="relative sm:max-w-[12.5rem] sm:w-full">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none bg-[#FAFAFB] border text-grayModern border-gray-300 rounded-lg px-4 py-2.5 sm:py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm sm:text-base"
                >
                  {statusTypes.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <FaCaretDown
                  size={24}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primaryBlue pointer-events-none"
                />
              </div>

              {/* Location Filter */}
              <div className="relative sm:max-w-[12.5rem] sm:w-full">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="appearance-none bg-[#FAFAFB] border text-grayModern border-gray-300 rounded-lg px-4 py-2.5 sm:py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm sm:text-base"
                >
                  {locationTypes.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <FaCaretDown
                  size={24}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primaryBlue pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Desktop Event Cards - Hidden on Mobile */}
          <div className="hidden lg:block space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-[#4BADE61A] rounded-3xl shadow-sm border p-6">
                <div className="flex space-x-4">
                  {/* Event Image */}
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-24 h-34 rounded-l-3xl object-cover "
                  />
                  
                  {/* Event Details */}
                  <div className="flex-1">
                    {/* Title, Buttons, and Featured Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-[#212121] font-Urbanist">{event.title}</h3>
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditEvent(event.id)}
                            className="bg-primaryBlue text-white px-4 py-1  rounded text-sm "
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="bg-white border border-primaryBlue text-primaryBlue px-4 py-1  rounded text-sm "
                          >
                            Delete
                          </button>
                        </div>
                        {event.featured && (
                          <span className="px-2 py-2 bg-[#FDE0E0] text-black text-xs rounded flex items-center">
                            <FaStar size={10} className="mr-1" />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Location */}
                    <div className="flex items-center text-black font-WorkSansMedium mb-1">
                      <img src="/assets/location.svg" className="w-4 h-4" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center text-black font-WorkSansMedium mb-2">
                      <img src="/assets/event.svg" className="w-4 h-4 " />
                      <span className="text-sm">{event.date}</span>
                    </div>
                    
                    {/* Organizer */}
                    <div className="flex items-center space-x-1 text-sm text-black font-WorkSansMedium mb-3">
                      <img src="/assets/admin.svg" className="w-4 h-4" />
                      <span>Created by {event.organizer}</span>
                      <img src="/assets/users.svg" className="w-5 h-5" />
                      <span>• {event.attendees} attending</span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-black font-WorkSansMedium text-sm leading-relaxed mb-4">{event.description}</p>

                    {/* Status Tags */}
                    <div className="flex items-center space-x-2">
                      {event.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-primaryBlue text-white text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}


                      {event.price.map((prices, index) => (
                        
                        <span 
                          key={index}
                          className="px-2 py-1 flex gap-1 bg-white border border-primaryBlue text-primaryBlue text-xs rounded"
                        >
                            <img src="/assets/ticket.svg" className="w-4 h-4" />
                          {prices}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State - Desktop */}
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  No events found matching your search criteria.
                </p>
              </div>
            )}
          </div>

          {/* Mobile Event Cards - Visible only on Mobile/Tablet */}
          <div className="lg:hidden">
            {filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-base">
                  No events found matching your search criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>   
    </div>
  );
}

export default EventManagement;