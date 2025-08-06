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
import config from "../../config";


const GOOGLE_MAPS_API_KEY = config.googleMapsApiKey;

function AddEvent() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeMenuItem, setActiveMenuItem] = useState("Event Management");
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [useGooglePlaces, setUseGooglePlaces] = useState(false);
  const [googleMapsLoading, setGoogleMapsLoading] = useState(true);
  const [apiLoadError, setApiLoadError] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState(null); // null = unknown, true = valid, false = invalid
  
  const sidebarRef = useRef();
  const dateInputRef = useRef();
  const timeInputRef = useRef();
  const cityInputRef = useRef();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const isEditMode = Boolean(eventId);

  // Global reference to prevent multiple loads
  const placesServiceRef = useRef(null);
  const autocompleteSessionTokenRef = useRef(null);



  const [formData, setFormData] = useState({
    eventName: "",
    city: "",
    date: "",
    time: "",
    timePeriod: "AM", // Add time period (AM/PM)
    eventType: "",
    featuredEvent: false,
    venue: "",
    description: "",
    ticketLink: "",
  });

  const eventTypes = [
    "Concert",
    "Festival",
    "Tour/guide",
    "Comedy Show",
    "Sporting Event",
  ];

  // Helper function for legacy API fallback
  const fallbackToLegacyAPI = (input) => {
    try {
      console.log('Using legacy AutocompleteService API');
      
      const request = {
        input: input,
        types: ['(cities)'],
        sessionToken: autocompleteSessionTokenRef.current,
      };

      const service = new window.google.maps.places.AutocompleteService();
      
      service.getPlacePredictions(request, (predictions, status) => {
        setSuggestionLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const suggestions = predictions.map(prediction => ({
            placeId: prediction.place_id,
            mainText: prediction.structured_formatting.main_text,
            secondaryText: prediction.structured_formatting.secondary_text || '',
            description: prediction.description,
          }));
          setCitySuggestions(suggestions);
          setApiKeyValid(true);
        } else if (status === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
          console.error('AutocompleteService request denied - likely API key issue');
          setApiKeyValid(false);
          setApiLoadError("Google Places API request denied. Check your API key permissions.");
          setUseGooglePlaces(false);
          setCitySuggestions([]);
        } else {
          console.error('AutocompleteService error:', status);
          setCitySuggestions([]);
        }
      });
    } catch (error) {
      console.error('Legacy API fallback error:', error);
      setSuggestionLoading(false);
      setCitySuggestions([]);
    }
  };

  // Enhanced Google Maps loading useEffect with API key validation
  useEffect(() => {
    const loadGoogleMapsScript = async () => {
      try {
        // First, validate the API key
        if (!GOOGLE_MAPS_API_KEY) {
          setApiLoadError("Google Maps API key is missing. Please check your environment variables.");
          setUseGooglePlaces(false);
          setGoogleMapsLoading(false);
          setApiKeyValid(false);
          return;
        }

        if (GOOGLE_MAPS_API_KEY.length < 30) {
          setApiLoadError("Google Maps API key appears to be invalid (too short).");
          setUseGooglePlaces(false);
          setGoogleMapsLoading(false);
          setApiKeyValid(false);
          return;
        }

        // Check if already loading or loaded
        if (window.googleMapsLoading) {
          const checkInterval = setInterval(() => {
            if (!window.googleMapsLoading) {
              clearInterval(checkInterval);
              if (window.google && 
                  window.google.maps && 
                  window.google.maps.places &&
                  (window.google.maps.places.AutocompleteSuggestion || window.google.maps.places.AutocompleteService)) {
                setUseGooglePlaces(true);
                setApiKeyValid(true);
              } else {
                setApiLoadError("Google Maps loaded but Places library not available");
                setUseGooglePlaces(false);
                setApiKeyValid(false);
              }
              setGoogleMapsLoading(false);
            }
          }, 100);
          return;
        }
        
        if (window.google && window.google.maps) {
          if (window.google.maps.places && 
              (window.google.maps.places.AutocompleteSuggestion || window.google.maps.places.AutocompleteService)) {
            setUseGooglePlaces(true);
            setApiKeyValid(true);
            setGoogleMapsLoading(false);
            return;
          } else {
            setApiLoadError("Google Maps loaded but Places library missing");
            setUseGooglePlaces(false);
            setApiKeyValid(false);
            setGoogleMapsLoading(false);
            return;
          }
        }

        // Prevent multiple script loads
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          if (!window.google || !window.google.maps) {
            existingScript.onload = () => {
              setUseGooglePlaces(true);
              setApiKeyValid(true);
              setGoogleMapsLoading(false);
            };
          } else {
            setUseGooglePlaces(true);
            setApiKeyValid(true);
            setGoogleMapsLoading(false);
          }
          return;
        }

        // Mark as loading to prevent multiple attempts
        window.googleMapsLoading = true;

        const script = document.createElement('script');
        
        // Enhanced script URL with better error handling
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&libraries=places&loading=async&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        
        // Create global callback function
        window.initGoogleMaps = () => {
          window.googleMapsLoading = false;
          
          setTimeout(() => {
            if (window.google && 
                window.google.maps && 
                window.google.maps.places &&
                (window.google.maps.places.AutocompleteSuggestion || window.google.maps.places.AutocompleteService)) {
              
              try {
                // Initialize autocomplete session token for legacy API if available
                if (window.google.maps.places.AutocompleteSessionToken) {
                  autocompleteSessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
                }
                setUseGooglePlaces(true);
                setApiKeyValid(true);
                console.log('Google Places API loaded successfully');
              } catch (error) {
                console.error('Failed to initialize Google Places:', error);
                setApiLoadError(`Failed to initialize Google Places: ${error.message}`);
                setUseGooglePlaces(false);
                setApiKeyValid(false);
              }
            } else {
              console.error('Google Maps Places library not fully loaded');
              setApiLoadError("Google Maps Places library not fully loaded");
              setUseGooglePlaces(false);
              setApiKeyValid(false);
            }
            setGoogleMapsLoading(false);
          }, 500);
        };
        
        script.onerror = (error) => {
          console.error('Failed to load Google Maps API:', error);
          window.googleMapsLoading = false;
          setApiLoadError("Failed to load Google Maps API. Check your API key and billing settings.");
          setUseGooglePlaces(false);
          setApiKeyValid(false);
          setGoogleMapsLoading(false);
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Unexpected error loading Google Maps:', error);
        window.googleMapsLoading = false;
        setApiLoadError(`Unexpected error: ${error.message}`);
        setUseGooglePlaces(false);
        setApiKeyValid(false);
        setGoogleMapsLoading(false);
      }
    };

    loadGoogleMapsScript();
  }, []);

  // Enhanced searchCities function with better error handling
  const searchCities = async (input) => {
    if (!useGooglePlaces || !window.google || !input.trim()) {
      setCitySuggestions([]);
      return;
    }

    setSuggestionLoading(true);
    
    try {
      // Try to use the new AutocompleteSuggestion API first
      if (window.google.maps.places.AutocompleteSuggestion) {
        console.log('Using new AutocompleteSuggestion API');
        
        const request = {
          input: input,
          includedPrimaryTypes: ['locality', 'administrative_area_level_1'],
          language: 'en',
          region: 'GLOBAL'
        };

        try {
          const { suggestions } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
          
          setSuggestionLoading(false);
          
          if (suggestions && suggestions.length > 0) {
            const formattedSuggestions = suggestions.map(suggestion => ({
              placeId: suggestion.placePrediction.placeId,
              mainText: suggestion.placePrediction.structuredFormat.mainText.text,
              secondaryText: suggestion.placePrediction.structuredFormat.secondaryText?.text || '',
              description: suggestion.placePrediction.text.text,
            }));
            setCitySuggestions(formattedSuggestions);
            setApiKeyValid(true);
          } else {
            setCitySuggestions([]);
          }
        } catch (apiError) {
          console.error('AutocompleteSuggestion API Error:', apiError);
          setSuggestionLoading(false);
          
          // Check if it's an API key error
          if (apiError.message && apiError.message.includes('API key')) {
            setApiKeyValid(false);
            setApiLoadError(`API Key Error: ${apiError.message}`);
            setUseGooglePlaces(false);
          } else {
            // Try fallback to legacy API
            console.log('Falling back to legacy AutocompleteService API due to error');
            fallbackToLegacyAPI(input);
          }
        }
          
      } else if (window.google.maps.places.AutocompleteService) {
        fallbackToLegacyAPI(input);
      } else {
        console.error('No available Google Places autocomplete service');
        setSuggestionLoading(false);
        setCitySuggestions([]);
      }
      
    } catch (error) {
      console.error('Error in searchCities:', error);
      setSuggestionLoading(false);
      setCitySuggestions([]);
      
      // Check if it's an API key error
      if (error.message && error.message.includes('API key')) {
        setApiKeyValid(false);
        setApiLoadError(`API Key Error: ${error.message}`);
        setUseGooglePlaces(false);
      }
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.city && useGooglePlaces) {
        searchCities(formData.city);
      } else {
        setCitySuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.city, useGooglePlaces]);

  // Auto-hide success alert after 4 seconds
  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
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
               timePeriod: data.timePeriod || "AM",
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
  }, [eventId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
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

  // Upload images to Firebase Storage
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



    // Create notification for event
  const createEventNotification = async (eventData, eventId) => {
    try {
      // Format time with AM/PM
      const formattedTime = `${eventData.time} ${eventData.timePeriod}`;
      
      const docRef = await addDoc(collection(db, "notifications"), {
        title: "New Event Added!",
        message: `${eventData.eventName}`,
        eventId: eventId,
        eventName: eventData.eventName,
        eventCity: eventData.city || "",
        eventDate: eventData.date,
        eventTime: formattedTime,
        createdAt: serverTimestamp(),
        type: "event_created",
        targetAudience: "user", // Only for non-admin users
        isRead: false,
      });
             
      // Update the notification document to replace eventId with notification document ID
      await updateDoc(doc(db, "notifications", docRef.id), {
        eventId: docRef.id
      });
      
      console.log("Updated notification with notification document ID as eventId");
    } catch (error) {
      console.error("Error creating event notification: ", error);
      // Don't throw error to prevent blocking event creation
    }
  };

  // Save event to Firestore
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

      const docRef = await addDoc(collection(db, "events"), eventDocument);
      
      // Create notification after event is successfully created
      await createEventNotification(eventData, docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error("Error saving event: ", error);
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
        if (!user || !isAdmin) {
          setError("You must be logged in as an admin to create events");
          setLoading(false);
          return;
        }

        if (!formData.eventName || !formData.date || !formData.time) {
          setError("Please fill in all required fields");
          setLoading(false);
          return;
        }

        await saveEventToFirestore(formData, imageUrls);
        setSuccessMessage(`Event "${formData.eventName}" created successfully!`);
      }
      
      setShowSuccessAlert(true);
      setError("");
             setFormData({
         eventName: "",
         city: "",
         date: "",
         time: "",
         timePeriod: "AM",
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

  // Enhanced retry function
  const retryGooglePlaces = async () => {
    setGoogleMapsLoading(true);
    setApiLoadError("");
    setUseGooglePlaces(false);
    setApiKeyValid(null);
    
    // Clear any existing loading flag
    window.googleMapsLoading = false;
    
    // Clean up existing callback
    if (window.initGoogleMaps) {
      delete window.initGoogleMaps;
    }
    
    // Remove existing script if any
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Wait a bit before reloading
    setTimeout(() => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&libraries=places&loading=async&callback=initGoogleMapsRetry`;
      
      // Create a global callback function for retry
      window.initGoogleMapsRetry = () => {
        setTimeout(() => {
          if (window.google && 
              window.google.maps && 
              window.google.maps.places &&
              (window.google.maps.places.AutocompleteSuggestion || window.google.maps.places.AutocompleteService)) {
            // Initialize session token if available
            if (window.google.maps.places.AutocompleteSessionToken) {
              autocompleteSessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
            }
            setUseGooglePlaces(true);
            setApiKeyValid(true);
            console.log('Google Places API retry successful');
          } else {
            setApiLoadError("Manual retry failed - Places library still not available");
            setApiKeyValid(false);
          }
          setGoogleMapsLoading(false);
        }, 100);
      };
      
      script.onerror = () => {
        setApiLoadError("Failed to load Google Maps script on manual retry");
        setApiKeyValid(false);
        setGoogleMapsLoading(false);
      };
      
      document.head.appendChild(script);
    }, 1000);
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, city: value }));
    setShowSuggestions(true);
  };

  // Handle city suggestion selection
  const handleCitySelect = (suggestion) => {
    setFormData(prev => ({ ...prev, city: suggestion.description }));
    setCitySuggestions([]);
    setShowSuggestions(false);
    
    // Create new session token for next search (legacy API)
    if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.AutocompleteSessionToken) {
      autocompleteSessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  };

  // Hide suggestions when clicking outside
  const handleCityInputBlur = () => {
    // Delay hiding to allow suggestion click
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Show suggestions when focusing input
  const handleCityInputFocus = () => {
    if (citySuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

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

  // Render city input
  const renderCityInput = () => {
    if (googleMapsLoading) {
      return (
        <div className="relative">
          <input
            type="text"
            value={formData.city}
            disabled
            placeholder="Loading Google Places..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-100 font-PlusJakartaSans text-gray-500"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primaryBlue"></div>
          </div>
        </div>
      );
    }

    if (useGooglePlaces) {
      return (
        <div className="relative">
          <input
            ref={cityInputRef}
            type="text"
            value={formData.city}
            onChange={handleCityChange}
            onFocus={handleCityInputFocus}
            onBlur={handleCityInputBlur}
            placeholder="Search for a city..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-black placeholder:text-grayModern"
          />
          <FaCaretDown
            size={20}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primaryBlue pointer-events-none"
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && citySuggestions.length > 0 && (
            <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-56 overflow-y-auto">
              {suggestionLoading && (
                <div className="px-4 py-2 text-gray-500 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primaryBlue mr-2"></div>
                  Loading...
                </div>
              )}
              {citySuggestions.map((suggestion) => (
                <div
                  key={suggestion.placeId}
                  onClick={() => handleCitySelect(suggestion)}
                  className="px-4 py-2 cursor-pointer text-gray-800 hover:bg-blue-50"
                >
                  <div className="font-medium">{suggestion.mainText}</div>
                  <div className="text-sm text-gray-500">{suggestion.secondaryText}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Fallback: Simple text input when Google Places is not available
    return (
      <div className="relative">
        <input
          type="text"
          value={formData.city}
          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          placeholder="Enter city name..."
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-black placeholder:text-grayModern"
        />
        <FaCaretDown
          size={20}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primaryBlue pointer-events-none"
        />
      </div>
    );
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
        {/* Header */}
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
              {isEditMode ? "Edit Event" : "Add Event"}
            </h1>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full scrollbar-hide">
          {/* Header with Back Button */}
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
                {isEditMode ? "Edit Event" : "Add Event"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Messages */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Enhanced API key validation alert */}
                {!googleMapsLoading && apiKeyValid === false && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Google Maps API Key Issue</div>
                        <div className="text-sm mt-1">
                          Please check:
                          <ul className="list-disc list-inside mt-1 text-xs">
                            <li>API key is set in environment variables (REACT_APP_GOOGLE_MAPS_API_KEY)</li>
                            <li>API key has Places API enabled</li>
                            <li>Billing is enabled for your Google Cloud project</li>
                            <li>API key restrictions allow your domain</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={retryGooglePlaces}
                      className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {apiLoadError && apiKeyValid !== false && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <div>
                        <div>{apiLoadError}</div>
                        <div className="text-xs mt-1">
                          Check console for detailed debugging information.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={retryGooglePlaces}
                      className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Status Messages */}
                {googleMapsLoading && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    <span>Loading Google Places API...</span>
                  </div>
                )}

                {!googleMapsLoading && !useGooglePlaces && !apiLoadError && apiKeyValid !== false && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>Google Places API not available. Using manual city input.</span>
                  </div>
                )}

                {/* Success Alert */}
                {showSuccessAlert && (
                  <div className="fixed top-4 right-4 z-50 max-w-md animate-pulse">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-6 w-6 text-green-400 mr-3 flex-shrink-0 animate-bounce" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-green-800">Success!</h3>
                          <p className="mt-1 text-sm text-green-700 font-medium">{successMessage}</p>
                          <p className="mt-1 text-xs text-green-600">Redirecting to events page...</p>
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
                    <div className="bg-blue-50 border-l-4 border-primaryBlue p-4 rounded-lg shadow-lg">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primaryBlue mr-3"></div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-blue-800">
                            {isEditMode ? "Updating Event..." : "Creating Event..."}
                          </h3>
                          <p className="mt-1 text-sm text-blue-700">Please wait while we save your event</p>
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
                      <div className="w-24 h-24 mx-auto bg-[#FAFAFB] rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-primaryBlue">
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
                      Event Name *
                    </label>
                    <input
                      type="text"
                      value={formData.eventName}
                      onChange={(e) => handleInputChange("eventName", e.target.value)}
                      placeholder="Enter event name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-black placeholder:text-grayModern"
                      required
                    />
                  </div>

                  {/* City */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      City
                    </label>
                    {renderCityInput()}
                  </div>

                  {/* Date and Time */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-thirdBlack mb-2">Date *</label>
                        <div className="relative">
                          <input
                            ref={dateInputRef}
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange("date", e.target.value)}
                            className="date-input w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                            required
                          />
                          <Calendar
                            size={18}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={handleDateIconClick}
                          />
                        </div>
                      </div>

                                             <div>
                         <label className="block text-sm font-medium text-thirdBlack mb-2">Time *</label>
                         <div className="flex gap-2">
                           <div className="relative flex-1">
                             <input
                               ref={timeInputRef}
                               type="time"
                               value={formData.time}
                               onChange={(e) => handleInputChange("time", e.target.value)}
                               className="time-input w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                               required
                             />
                             <Clock
                               size={18}
                               className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 cursor-pointer hover:text-blue-600 transition-colors"
                               onClick={handleTimeIconClick}
                             />
                           </div>
                           <select
                             value={formData.timePeriod}
                             onChange={(e) => handleInputChange("timePeriod", e.target.value)}
                             className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                           >
                             <option value="AM">AM</option>
                             <option value="PM">PM</option>
                           </select>
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Event Type */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">Event Type</label>
                    <div className="relative">
                      <select
                        value={formData.eventType}
                        onChange={(e) => handleInputChange("eventType", e.target.value)}
                        className="appearance-none w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                      >
                        <option value="">Select Event Type</option>
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
                    <label className="block text-sm font-medium text-thirdBlack mb-3">Featured Event</label>
                    <div className="flex space-x-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="featuredEvent"
                          checked={formData.featuredEvent === true}
                          onChange={() => handleInputChange("featuredEvent", true)}
                          className="mr-2 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-thirdBlack">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="featuredEvent"
                          checked={formData.featuredEvent === false}
                          onChange={() => handleInputChange("featuredEvent", false)}
                          className="mr-2 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-thirdBlack">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">Venue</label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => handleInputChange("venue", e.target.value)}
                      placeholder="Enter venue location"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans"
                    />
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe about the event"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#FAFAFB] resize-none font-PlusJakartaSans"
                    />
                  </div>

                  {/* Ticket/Report Link */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">Ticket/report Link</label>
                    <input
                      type="url"
                      value={formData.ticketLink}
                      onChange={(e) => handleInputChange("ticketLink", e.target.value)}
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