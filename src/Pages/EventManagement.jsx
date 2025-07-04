import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Plus, Menu, Edit, Eye, MapPin, Calendar, Users, Star, Trash2 } from "lucide-react";
import { FaStar } from "react-icons/fa6";
import Sidebar from "../Components/Sidebar";
import { FaCaretDown } from "react-icons/fa";
import { useNavigate, useParams } from "react-router";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

function EventManagement() {
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("All Events");
  const [selectedStatus, setSelectedStatus] = useState("All Types");
  const [selectedLocation, setSelectedLocation] = useState("All Status");
  const [activeMenuItem, setActiveMenuItem] = useState("Event Management");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sidebarRef = useRef();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const { eventId } = useParams();
  const isEditMode = Boolean(eventId);

  // Fetch events from Firebase
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Query events collection ordered by creation date
      const eventsQuery = query(
        collection(db, "events"),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(eventsQuery);
      const eventsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Format date and time for display
        let formattedDate = "Date not specified";
        let formattedTime = "Time not specified";
        
        if (data.date && data.time) {
          try {
            const eventDate = new Date(data.date + 'T' + data.time);
            formattedDate = eventDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });
            formattedTime = eventDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
          } catch (error) {
            console.error("Error formatting date:", error);
            formattedDate = data.date || "Date not specified";
            formattedTime = data.time || "Time not specified";
          }
        }
        
        const eventData = {
          id: doc.id,
          title: data.eventName || "Untitled Event",
          location: data.venue || "Location not specified",
          city: data.city || "City not specified",
          date: `${formattedDate} at ${formattedTime}`,
          time: data.time || "Time not specified",
          organizer: data.createdByEmail || "Unknown Organizer",
          description: data.description || "No description available",
          status: "Active", // Default status
          featured: data.featuredEvent === true,
          type: data.eventType || "General",
          image: data.images && data.images.length > 0 ? data.images[0] : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=200&fit=crop", // First image from array with fallback
          ticketLink: data.ticketLink || "",
          createdAt: data.createdAt,
          createdBy: data.createdBy
        };
        eventsData.push(eventData);
      });
      
      setEvents(eventsData);
      console.log("Events fetched:", eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch event data if editing
  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        const docRef = doc(db, "events", eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData({
            ...docSnap.data(),
            // If you need to convert any fields, do it here
          });
          // If you have images, setSelectedImages accordingly
        }
      };
      fetchEvent();
    }
  }, [eventId]);

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
    navigate(`/events/edit/${eventId}`);
  };

  const handleDeleteEvent = (eventId) => {
    setEventToDelete(eventId);
    setModalOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, "events", eventToDelete));
      setEvents(events.filter(event => event.id !== eventToDelete));
      setToast({ show: true, message: 'Event deleted successfully!', type: 'success' });
    } catch (error) {
      setToast({ show: true, message: 'Failed to delete event. Please try again.', type: 'error' });
    } finally {
      setDeleteLoading(false);
      setModalOpen(false);
      setEventToDelete(null);
    }
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

  // Auto-hide toast after 3s
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
              <span  className="w-max">Organizer: {event.organizer}</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
      
      {/* Status Tags */}
      <div className="flex items-center justify-between">
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

  const DeleteModal = () => (
    modalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Delete Event</h3>
          <p className="mb-4 text-gray-700">Are you sure you want to delete this event? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => { setModalOpen(false); setEventToDelete(null); }}
              className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteEvent}
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
    <div className="flex h-screen bg-gray-50 ">
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
            <div className="flex items-center space-x-3">
            <button
              onClick={handleAddEvent}
              className="flex items-center space-x-2 bg-primaryBlue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              <span>Add New Event</span>
            </button>
          </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryBlue"></div>
                <p className="mt-2 text-sm text-gray-600">Loading events...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <p>{error}</p>
                <button
                  onClick={fetchEvents}
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
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-4">
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
                          <span className="px-2 py-[5px] bg-[#FDE0E0] text-black text-sm rounded flex items-center">
                            <FaStar size={15} className="mr-1" />
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
                    <div className="flex items-center  text-black font-WorkSansMedium mb-2">
                      <img src="/assets/event.svg" className="w-4 h-4 mr-1" />
                      <span className="text-sm">{event.date}</span>
                    </div>
                    
                    {/* Organizer */}
                    <div className="flex items-center space-x-1 text-sm text-black font-WorkSansMedium mb-3">
                      <img src="/assets/admin.svg" className="w-4 h-4" />
                      <span>Created by {event.organizer}</span>                  
                    </div>
                    
                    {/* Description */}
                    <p className="text-black font-WorkSansMedium text-sm leading-relaxed mb-4">{event.description}</p>

                    {/* Status Tags */}
                    <div className="flex items-center space-x-2">
                      {/* {event.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-primaryBlue text-white text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))} */}
                      {/* 
                      {event.ticketLink ? (
                        <button
                          onClick={() => window.open(event.ticketLink, '_blank', 'noopener,noreferrer')}
                          className="px-3 py-1 flex gap-1 bg-white text-primaryBlue text-xs font-medium rounded border border-primaryBlue items-center"
                          title="Get Ticket"
                        >
                          <img src="/assets/ticket.svg" className="w-4 h-4" />
                          Get Ticket
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1 flex gap-1 bg-gray-200 text-gray-400 text-xs font-medium rounded items-center cursor-not-allowed"
                          title="No ticket link available"
                        >
                            <img src="/assets/ticket.svg" className="w-4 h-4" />
                          Get Ticket
                        </button>
                      )} */}
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
          )}
        </div>
      </div>   
    </div>
  );
}

export default EventManagement;