

import React, { useState, useRef } from "react";
import { Camera, Menu, ArrowLeft, Clock, Calendar, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import { FaCaretDown } from "react-icons/fa";

function AddEvent() {
  const [activeMenuItem, setActiveMenuItem] = useState("Event Management");
  const [selectedImages, setSelectedImages] = useState([]);
  const sidebarRef = useRef();
  const dateInputRef = useRef();
  const timeInputRef = useRef();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    eventName: '',
    city: '',
    date: '',
    time: '',
    eventType: '',
    featuredEvent: 'No',
    venue: '',
    description: '',
    ticketLink: ''
  });

  const cities = ["Select City", "Barcelona", "Madrid", "Valencia", "Seville", "Bilbao"];
  const eventTypes = ["Select Event Type", "Sports", "Music", "Food", "Art", "Technology", "Entertainment"];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
    console.log(`Navigating to: ${itemName}`);
  };

  const openDrawer = () => {
    sidebarRef.current?.openDrawer();
  };

  const handleBackToEvents = () => {
    navigate('/events');
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      file: file
    }));
    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    console.log('Selected images:', selectedImages);
    // Add form submission logic here
  };

  // Click handlers for custom icons
  const handleDateIconClick = () => {
    dateInputRef.current?.focus();
    dateInputRef.current?.showPicker && dateInputRef.current.showPicker();
  };

  const handleTimeIconClick = () => {
    timeInputRef.current?.focus();
    timeInputRef.current?.showPicker && timeInputRef.current.showPicker();
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
        <div className="w-full h-16 shadow-custom bg-[#FAFAFB] flex items-center px-4 lg:px-6">
          <button
            onClick={openDrawer}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors mr-3"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <div className="flex items-center">
            <button
              onClick={handleBackToEvents}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors mr-3"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 lg:hidden">Add Event</h1>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full scrollbar-hide">
          {/* Header with Back Button - hidden on mobile since it's in the top bar */}
          <div className="hidden lg:flex items-center mb-6">
            <button
              onClick={handleBackToEvents}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Events</span>
            </button>
          </div>

          {/* Main Content Container */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6 lg:p-8">
              {/* Header */}
              <h2 className="text-xl lg:text-2xl font-bold text-black font-PlusJakartaSans mb-8 text-center lg:text-left">Add Event</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload Section */}
                <div className="text-center">
                  <div className="mb-4">
                    <label className="relative inline-block cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="w-24 h-24 mx-auto bg-[#FAFAFB] rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-primaryBlue ">
                        <Camera size={32} className="text-primaryBlue mb-2" />
                        <span className="text-xs text-primaryBlue">Tap to Add Photo</span>
                      </div>
                    </label>
                  </div>
                  
                  {/* Image Thumbnails */}
                  {selectedImages.length > 0 && (
                    <div className="flex justify-center space-x-2 mb-4">
                      {selectedImages.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.url}
                            alt="Event preview"
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-PlusJakartaSans">
                  {/* Event Name */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={formData.eventName}
                      onChange={(e) => handleInputChange('eventName', e.target.value)}
                      placeholder="Enter event name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                    />
                  </div>

                  {/* City */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      City
                    </label>
                    <div className="relative">
                      <select
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="appearance-none w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                      >
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <FaCaretDown
                        size={20}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primaryBlue pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Date and Time - Single Line */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Date */}
                      <div>
                        <label className="block text-sm font-medium text-thirdBlack mb-2">
                          Date *
                        </label>
                        <div className="relative">
                          <input
                            ref={dateInputRef}
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            className="date-input w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                          />
                          <Calendar 
                            size={18} 
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={handleDateIconClick}
                          />
                        </div>
                      </div>

                      {/* Time */}
                      <div>
                        <label className="block text-sm font-medium text-thirdBlack mb-2">
                          Time *
                        </label>
                        <div className="relative">
                          <input
                            ref={timeInputRef}
                            type="time"
                            value={formData.time}
                            onChange={(e) => handleInputChange('time', e.target.value)}
                            placeholder="Enter event time"
                            className="time-input w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                          />
                          <Clock 
                            size={18} 
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={handleTimeIconClick}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Type */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      Event Type
                    </label>
                    <div className="relative">
                      <select
                        value={formData.eventType}
                        onChange={(e) => handleInputChange('eventType', e.target.value)}
                        className="appearance-none w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                      >
                        {eventTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <FaCaretDown
                        size={20}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primaryBlue pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Featured Event */}
                  <div>
                    <label className="block text-sm font-medium text-thirdBlack mb-3">
                      Featured Event
                    </label>
                    <div className="flex space-x-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="featuredEvent"
                          value="Yes"
                          checked={formData.featuredEvent === 'Yes'}
                          onChange={(e) => handleInputChange('featuredEvent', e.target.value)}
                          className="mr-2 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-thirdBlack">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="featuredEvent"
                          value="No"
                          checked={formData.featuredEvent === 'No'}
                          onChange={(e) => handleInputChange('featuredEvent', e.target.value)}
                          className="mr-2 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-thirdBlack">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      Venue
                    </label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => handleInputChange('venue', e.target.value)}
                      placeholder="Enter venue location"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans"
                    />
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe about the event"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] resize-none font-PlusJakartaSans"
                    />
                  </div>

                  {/* Ticket/Report Link */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      Ticket/report Link
                    </label>
                    <input
                      type="url"
                      value={formData.ticketLink}
                      onChange={(e) => handleInputChange('ticketLink', e.target.value)}
                      placeholder="https://example.com/tickets"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-Urbanist"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-primaryBlue  text-white py-3 px-6 rounded-lg  font-medium"
                  >
                    Create Event
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToEvents}
                    className="flex-1 bg-white border border-gray-300 text-thirdBlack  py-3 px-6 rounded-lg  font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>   


    </div>
  );
}

export default AddEvent;