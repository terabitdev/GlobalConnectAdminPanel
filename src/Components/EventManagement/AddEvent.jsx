import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Menu,
  ArrowLeft,
  Clock,
  Calendar,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Sidebar";
import { FaCaretDown } from "react-icons/fa";
import { db, storage } from "../../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../../contexts/AuthContext";

function AddEvent() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeMenuItem, setActiveMenuItem] = useState("Event Management");
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const sidebarRef = useRef();
  const dateInputRef = useRef();
  const timeInputRef = useRef();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const isEditMode = Boolean(eventId);

  const [formData, setFormData] = useState({
    eventName: "",
    city: "",
    date: "",
    time: "",
    eventType: "",
    featuredEvent: false,
    venue: "",
    description: "",
    ticketLink: "",
  });

  const cities = [
    "Select City",
    "Barcelona",
    "Madrid",
    "Valencia",
    "Seville",
    "Bilbao",
  ];
  const eventTypes = [
    "Select Event Type",
    "Sports",
    "Music",
    "Food",
    "Art",
    "Technology",
    "Entertainment",
  ];

  // Auto-hide success alert after 4 seconds
  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
        // Navigate to events page after showing success message
        navigate("/events");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert, navigate]);

  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          const docRef = doc(db, "events", eventId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              eventName: data.eventName || "",
              city: data.city || "",
              date: data.date || "",
              time: data.time || "",
              eventType: data.eventType || "",
              featuredEvent: data.featuredEvent || false,
              venue: data.venue || "",
              description: data.description || "",
              ticketLink: data.ticketLink || "",
            });
            if (data.images && data.images.length > 0) {
              setSelectedImages(
                data.images.map((url, idx) => ({
                  id: idx,
                  url,
                  file: null,
                }))
              );
            } else {
              setSelectedImages([]);
            }
          }
        } catch (error) {
          console.error("Failed to fetch event for editing:", error);
        }
      };
      fetchEvent();
    }
    // eslint-disable-next-line
  }, [eventId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
    navigate("/events");
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      file: file,
    }));
    setSelectedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Function to upload images to Firebase Storage
  const uploadImages = async (images) => {
    const uploadPromises = images.map(async (image, index) => {
      const imageRef = ref(
        storage,
        `events/${Date.now()}_${index}_${image.file.name}`
      );
      const snapshot = await uploadBytes(imageRef, image.file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    });

    return Promise.all(uploadPromises);
  };

  // Function to save event to Firestore
  const saveEventToFirestore = async (eventData, imageUrls) => {
    try {
      const eventDocument = {
        ...eventData,
        images: imageUrls,
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log("Attempting to save event:", eventDocument);

      const docRef = await addDoc(collection(db, "events"), eventDocument);
      console.log("Event saved with ID: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error saving event: ", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let imageUrls = [];
      const newImages = selectedImages.filter((img) => img.file);
      if (newImages.length > 0) {
        imageUrls = await uploadImages(newImages);
      }
      if (isEditMode) {
        // Merge old and new images
        const allImages = [
          ...selectedImages.filter((img) => !img.file).map((img) => img.url),
          ...imageUrls,
        ];
        await updateDoc(doc(db, "events", eventId), {
          ...formData,
          images: allImages,
          updatedAt: serverTimestamp(),
        });
        setSuccessMessage("Event updated successfully!");
      } else {
        // Debug authentication state
        console.log("Authentication state:", {
          user: !!user,
          isAdmin,
          userUid: user?.uid,
        });

        // Check if user is authenticated
        if (!user || !isAdmin) {
          setError("You must be logged in as an admin to create events");
          setLoading(false);
          return;
        }

        // Validate required fields
        if (!formData.eventName || !formData.date || !formData.time) {
          setError("Please fill in all required fields");
          setLoading(false);
          return;
        }

        // Save event to Firestore
        const eventId = await saveEventToFirestore(formData, imageUrls);
        setSuccessMessage(
          `Event \"${formData.eventName}\" created successfully!`
        );
      }
      setShowSuccessAlert(true);
      setError("");
      setFormData({
        eventName: "",
        city: "",
        date: "",
        time: "",
        eventType: "",
        featuredEvent: false,
        venue: "",
        description: "",
        ticketLink: "",
      });
      setSelectedImages([]);
    } catch (error) {
      setError(
        isEditMode
          ? "Failed to update event. Please try again."
          : "Failed to create event. Please try again."
      );
    } finally {
      setLoading(false);
    }
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

  // Test function to verify Firestore permissions (for debugging)
  const testFirestorePermissions = async () => {
    try {
      console.log("Testing Firestore permissions...");
      console.log("Current user:", user);
      console.log("Is admin:", isAdmin);

      const testDoc = {
        testField: "test value",
        createdBy: user?.uid || "no-user",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "events"), testDoc);
      console.log("✅ Firestore write successful! Document ID:", docRef.id);
      return true;
    } catch (error) {
      console.error("❌ Firestore write failed:", error);
      return false;
    }
  };

  // Make test function available in window for console testing
  if (typeof window !== "undefined") {
    window.testFirestorePermissions = testFirestorePermissions;
  }

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryBlue"></div>
          <p className="mt-2 text-sm text-gray-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 lg:hidden">
              Add Event
            </h1>
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
          <div className="max-w-5xl 2xl:max-w-[100rem] mx-auto">
            <div className="bg-[#FAFAFB]">
              {/* Header */}
              <h2 className="text-xl lg:text-2xl font-bold text-black font-PlusJakartaSans mb-8 text-center lg:text-left">
                Add Event
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Success Alert */}
                {showSuccessAlert && (
                  <div className="fixed top-4 right-4 z-50 max-w-md animate-pulse">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out hover:shadow-xl">
                      <div className="flex items-center">
                        <CheckCircle className="h-6 w-6 text-green-400 mr-3 flex-shrink-0 animate-bounce" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-green-800">
                            Success!
                          </h3>
                          <p className="mt-1 text-sm text-green-700 font-medium">
                            {successMessage}
                          </p>
                          <p className="mt-1 text-xs text-green-600">
                            Redirecting to events page...
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSuccessAlert(false);
                            navigate("/events");
                          }}
                          className="ml-4 text-green-400 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-green-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading Alert */}
                {loading && (
                  <div className="fixed top-4 right-4 z-50 max-w-md">
                    <div className="bg-blue-50 border-l-4 border-primaryBlue p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primaryBlue mr-3"></div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-blue-800">
                            Creating Event...
                          </h3>
                          <p className="mt-1 text-sm text-blue-700">
                            Please wait while we save your event
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                        <span className="text-xs text-primaryBlue">
                          Tap to Add Photo
                        </span>
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
                      onChange={(e) =>
                        handleInputChange("eventName", e.target.value)
                      }
                      placeholder="Enter event name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-black placeholder:text-grayModern"
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
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
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
                            onChange={(e) =>
                              handleInputChange("date", e.target.value)
                            }
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
                            onChange={(e) =>
                              handleInputChange("time", e.target.value)
                            }
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
                        onChange={(e) =>
                          handleInputChange("eventType", e.target.value)
                        }
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
                          value="true"
                          checked={formData.featuredEvent === true}
                          onChange={(e) =>
                            handleInputChange("featuredEvent", true)
                          }
                          className="mr-2 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-thirdBlack">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="featuredEvent"
                          value="false"
                          checked={formData.featuredEvent === false}
                          onChange={(e) =>
                            handleInputChange("featuredEvent", false)
                          }
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
                      onChange={(e) =>
                        handleInputChange("venue", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleInputChange("ticketLink", e.target.value)
                      }
                      placeholder="https://example.com/tickets"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-Urbanist"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium ${
                      loading
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-primaryBlue text-white hover:bg-blue-700"
                    }`}
                  >
                    {loading
                      ? isEditMode
                        ? "Updating..."
                        : "Creating..."
                      : isEditMode
                      ? "Update Event"
                      : "Create Event"}
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToEvents}
                    disabled={loading}
                    className={`flex-1 border border-gray-300 py-3 px-6 rounded-lg font-medium ${
                      loading
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-primaryBlue hover:bg-gray-50"
                    }`}
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
