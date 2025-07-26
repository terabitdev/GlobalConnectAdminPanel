import React, { useState, useRef, useEffect } from "react";
import { Camera, Menu, ArrowLeft, X, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Sidebar";
import { FaCaretDown } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
// Firebase imports
import { db, storage, auth } from "../../firebase"; // Adjust the path to your Firebase config
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";



const GOOGLE_MAPS_API_KEY = config.googleMapsApiKey;

function AddRestaurant() {
  const [activeMenuItem, setActiveMenuItem] = useState("Restaurant Management");
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sidebarRef = useRef();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { restaurantId } = useParams();
  const isEditMode = Boolean(restaurantId);

  // Google Places API states
  const [useGooglePlaces, setUseGooglePlaces] = useState(false);
  const [googleMapsLoading, setGoogleMapsLoading] = useState(true);
  const [apiLoadError, setApiLoadError] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState(null);
  const cityInputRef = useRef();
  const autocompleteSessionTokenRef = useRef(null);

  // Restaurant name autocomplete states
  const [restaurantSuggestions, setRestaurantSuggestions] = useState([]);
  const [showRestaurantSuggestions, setShowRestaurantSuggestions] = useState(false);
  const [restaurantSuggestionLoading, setRestaurantSuggestionLoading] = useState(false);
  const restaurantInputRef = useRef();
  const restaurantSessionTokenRef = useRef(null);

  const [formData, setFormData] = useState({
    restaurantName: '',
    city: '',
    cuisineType: '',
    featuredRestaurant: 'No',
    phoneNumber: '',
    address: '',
    description: '',
    priceRange: ''
  });

  // Fallback cities for when Google Places is not available
  const fallbackCities = ["Barcelona", "Madrid", "Valencia", "Seville", "Bilbao"];
  const cuisineTypes = ["Select Cuisine", "Traditional Catalan", "Mediterranean", "Italian", "French", "Asian", "Mexican", "American", "Seafood", "Vegetarian"];
  const priceRanges = ["$", "$$", "$$$", "$$$$"];

  const [error, setError] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  // Enhanced Google Maps loading useEffect
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
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&libraries=places&loading=async&callback=initGoogleMapsRestaurant`;
        script.async = true;
        script.defer = true;
        
        // Create global callback function
        window.initGoogleMapsRestaurant = () => {
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
                  restaurantSessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
                }
                setUseGooglePlaces(true);
                setApiKeyValid(true);
                console.log('Google Places API loaded successfully for restaurants');
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

  // Helper function for restaurant autocomplete legacy API fallback
  const fallbackToRestaurantLegacyAPI = (input) => {
    try {
      console.log('Using legacy AutocompleteService API for restaurants');
      
      const request = {
        input: input,
        types: ['establishment'],
        sessionToken: restaurantSessionTokenRef.current,
      };

      const service = new window.google.maps.places.AutocompleteService();
      
      service.getPlacePredictions(request, (predictions, status) => {
        setRestaurantSuggestionLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          // Filter for restaurants only
          const restaurantPredictions = predictions.filter(prediction => 
            prediction.types.includes('restaurant') || 
            prediction.types.includes('food') ||
            prediction.types.includes('meal_takeaway') ||
            prediction.types.includes('meal_delivery')
          );
          
          const suggestions = restaurantPredictions.map(prediction => ({
            placeId: prediction.place_id,
            mainText: prediction.structured_formatting.main_text,
            secondaryText: prediction.structured_formatting.secondary_text || '',
            description: prediction.description,
          }));
          setRestaurantSuggestions(suggestions);
          setApiKeyValid(true);
        } else if (status === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
          console.error('Restaurant AutocompleteService request denied - likely API key issue');
          setApiKeyValid(false);
          setApiLoadError("Google Places API request denied. Check your API key permissions.");
          setUseGooglePlaces(false);
          setRestaurantSuggestions([]);
        } else {
          console.error('Restaurant AutocompleteService error:', status);
          setRestaurantSuggestions([]);
        }
      });
    } catch (error) {
      console.error('Restaurant Legacy API fallback error:', error);
      setRestaurantSuggestionLoading(false);
      setRestaurantSuggestions([]);
    }
  };

  // Enhanced searchRestaurants function
  const searchRestaurants = async (input) => {
    if (!useGooglePlaces || !window.google || !input.trim()) {
      setRestaurantSuggestions([]);
      return;
    }

    setRestaurantSuggestionLoading(true);
    
    try {
      // Try to use the new AutocompleteSuggestion API first
      if (window.google.maps.places.AutocompleteSuggestion) {
        console.log('Using new AutocompleteSuggestion API for restaurants');
        
        const request = {
          input: input,
          includedPrimaryTypes: ['restaurant'],
          language: 'en',
          region: 'GLOBAL'
        };

        try {
          const { suggestions } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
          
          setRestaurantSuggestionLoading(false);
          
          if (suggestions && suggestions.length > 0) {
            const formattedSuggestions = suggestions.map(suggestion => ({
              placeId: suggestion.placePrediction.placeId,
              mainText: suggestion.placePrediction.structuredFormat.mainText.text,
              secondaryText: suggestion.placePrediction.structuredFormat.secondaryText?.text || '',
              description: suggestion.placePrediction.text.text,
            }));
            setRestaurantSuggestions(formattedSuggestions);
            setApiKeyValid(true);
          } else {
            setRestaurantSuggestions([]);
          }
        } catch (apiError) {
          console.error('Restaurant AutocompleteSuggestion API Error:', apiError);
          setRestaurantSuggestionLoading(false);
          
          // Check if it's an API key error
          if (apiError.message && apiError.message.includes('API key')) {
            setApiKeyValid(false);
            setApiLoadError(`API Key Error: ${apiError.message}`);
            setUseGooglePlaces(false);
          } else {
            // Try fallback to legacy API
            console.log('Falling back to legacy AutocompleteService API for restaurants due to error');
            fallbackToRestaurantLegacyAPI(input);
          }
        }
          
      } else if (window.google.maps.places.AutocompleteService) {
        fallbackToRestaurantLegacyAPI(input);
      } else {
        console.error('No available Google Places autocomplete service for restaurants');
        setRestaurantSuggestionLoading(false);
        setRestaurantSuggestions([]);
      }
      
    } catch (error) {
      console.error('Error in searchRestaurants:', error);
      setRestaurantSuggestionLoading(false);
      setRestaurantSuggestions([]);
      
      // Check if it's an API key error
      if (error.message && error.message.includes('API key')) {
        setApiKeyValid(false);
        setApiLoadError(`API Key Error: ${error.message}`);
        setUseGooglePlaces(false);
      }
    }
  };

  // Enhanced searchCities function
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

  // Debounce search for cities
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

  // Debounce search for restaurants
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.restaurantName && useGooglePlaces) {
        searchRestaurants(formData.restaurantName);
      } else {
        setRestaurantSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.restaurantName, useGooglePlaces]);

  // Enhanced retry function
  const retryGooglePlaces = async () => {
    setGoogleMapsLoading(true);
    setApiLoadError("");
    setUseGooglePlaces(false);
    setApiKeyValid(null);
    
    // Clear any existing loading flag
    window.googleMapsLoading = false;
    
    // Clean up existing callback
    if (window.initGoogleMapsRestaurant) {
      delete window.initGoogleMapsRestaurant;
    }
    
    // Remove existing script if any
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Wait a bit before reloading
    setTimeout(() => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&libraries=places&loading=async&callback=initGoogleMapsRestaurantRetry`;
      
      // Create a global callback function for retry
      window.initGoogleMapsRestaurantRetry = () => {
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
            console.log('Google Places API retry successful for restaurants');
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

  // Restaurant name handlers
  const handleRestaurantNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, restaurantName: value }));
    setShowRestaurantSuggestions(true);
  };

  // Handle restaurant suggestion selection
  const handleRestaurantSelect = (suggestion) => {
    setFormData(prev => ({ ...prev, restaurantName: suggestion.mainText }));
    setRestaurantSuggestions([]);
    setShowRestaurantSuggestions(false);
    
    // Create new session token for next search (legacy API)
    if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.AutocompleteSessionToken) {
      restaurantSessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  };

  // Hide restaurant suggestions when clicking outside
  const handleRestaurantInputBlur = () => {
    // Delay hiding to allow suggestion click
    setTimeout(() => {
      setShowRestaurantSuggestions(false);
    }, 200);
  };

  // Show restaurant suggestions when focusing input
  const handleRestaurantInputFocus = () => {
    if (restaurantSuggestions.length > 0) {
      setShowRestaurantSuggestions(true);
    }
  };

  // Render restaurant name input with Google Places integration
  const renderRestaurantNameInput = () => {
    if (googleMapsLoading) {
      return (
        <div className="relative">
          <input
            type="text"
            value={formData.restaurantName}
            disabled
            placeholder="Loading Google Places..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-100 font-PlusJakartaSans text-gray-500"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4BADE6]"></div>
          </div>
        </div>
      );
    }

    if (useGooglePlaces) {
      return (
        <div className="relative">
          <input
            ref={restaurantInputRef}
            type="text"
            value={formData.restaurantName}
            onChange={handleRestaurantNameChange}
            onFocus={handleRestaurantInputFocus}
            onBlur={handleRestaurantInputBlur}
            placeholder="Search for a restaurant or enter manually..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-black placeholder:text-grayModern"
            disabled={isSubmitting}
            required
          />
          <FaCaretDown
            size={20}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4BADE6] pointer-events-none"
          />
          
          {/* Restaurant suggestions dropdown */}
          {showRestaurantSuggestions && restaurantSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-56 overflow-y-auto">
              {restaurantSuggestionLoading && (
                <div className="px-4 py-2 text-gray-500 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4BADE6] mr-2"></div>
                  Loading restaurants...
                </div>
              )}
              {restaurantSuggestions.map((suggestion) => (
                <div
                  key={suggestion.placeId}
                  onClick={() => handleRestaurantSelect(suggestion)}
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

    // Fallback: regular input when Google Places is not available
    return (
      <input
        type="text"
        value={formData.restaurantName}
        onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
        placeholder="Enter restaurant name"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-black placeholder:text-grayModern"
        disabled={isSubmitting}
        required
      />
    );
  };

  // Render city input with Google Places integration
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
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4BADE6]"></div>
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
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-black placeholder:text-grayModern"
            disabled={isSubmitting}
          />
          <FaCaretDown
            size={20}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4BADE6] pointer-events-none"
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && citySuggestions.length > 0 && (
            <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-56 overflow-y-auto">
              {suggestionLoading && (
                <div className="px-4 py-2 text-gray-500 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4BADE6] mr-2"></div>
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

    // Fallback: dropdown with predefined cities
    return (
      <div className="relative">
        <select
          value={formData.city}
          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          className="appearance-none w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
          disabled={isSubmitting}
          required
        >
          <option value="">Select City</option>
          {fallbackCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <FaCaretDown
          size={20}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4BADE6] pointer-events-none"
        />
      </div>
    );
  };

  // Auto-hide success alert after 3 seconds
  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
        navigate('/restaurants');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert, navigate]);

  // Fetch restaurant data for editing
  useEffect(() => {
    if (isEditMode) {
      const fetchRestaurant = async () => {
        try {
          const docRef = doc(db, "restaurants", restaurantId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              restaurantName: data.restaurantName || "",
              city: data.city || "",
              cuisineType: data.cuisineType || "",
              featuredRestaurant: data.featuredRestaurant ? 'Yes' : 'No',
              phoneNumber: data.phoneNumber || "",
              address: data.address || "",
              description: data.description || "",
              priceRange: data.priceRange || ""
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
          console.error("Failed to fetch restaurant for editing:", error);
          setError("Failed to load restaurant data. Please try again.");
        }
      };
      fetchRestaurant();
    }
  }, [restaurantId, isEditMode]);

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

  const handleBackToRestaurants = () => {
    navigate('/restaurants');
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

  const handlePriceRangeSelect = (range) => {
    setFormData(prev => ({
      ...prev,
      priceRange: range
    }));
  };

  // Function to upload images to Firebase Storage
  const uploadImagesToStorage = async (images) => {
    const uploadPromises = images.map(async (imageObj, index) => {
      try {
        // Create a unique filename with timestamp
        const timestamp = Date.now();
        const filename = `restaurants/${timestamp}_${index}_${imageObj.file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, filename);
        
        console.log(`Uploading image ${index + 1} to: ${filename}`);
        
        // Upload the file with metadata
        const metadata = {
          contentType: imageObj.file.type,
          customMetadata: {
            originalName: imageObj.file.name,
            uploadedAt: new Date().toISOString()
          }
        };
        
        const snapshot = await uploadBytes(storageRef, imageObj.file, metadata);
        console.log(`Image ${index + 1} uploaded successfully`);
        
        // Get the download URL and return just the URL string
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL; // Return only the URL string
      } catch (error) {
        console.error(`Error uploading image ${index + 1}:`, error);
        
        // Handle specific Firebase errors
        if (error.code === 'storage/unauthorized') {
          throw new Error(`Upload failed: You don't have permission to upload files. Please check Firebase Storage rules.`);
        } else if (error.code === 'storage/invalid-format') {
          throw new Error(`Upload failed: Invalid file format for image ${index + 1}`);
        } else if (error.code === 'storage/object-not-found') {
          throw new Error(`Upload failed: Storage bucket not found`);
        } else {
          throw new Error(`Upload failed for image ${index + 1}: ${error.message}`);
        }
      }
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.restaurantName.trim()) {
        setError('Please enter restaurant name');
        setIsSubmitting(false);
        return;
      }

      if (!formData.city || formData.city === 'Select City') {
        setError('Please select a city');
        setIsSubmitting(false);
        return;
      }

      if (formData.cuisineType === 'Select Cuisine') {
        setError('Please select a cuisine type');
        setIsSubmitting(false);
        return;
      }

      let imageUrls = [];
      
      // Handle image uploads for new images
      const newImages = selectedImages.filter((img) => img.file);
      if (newImages.length > 0) {
        imageUrls = await uploadImagesToStorage(newImages);
      }

      if (isEditMode) {
        // Merge old and new images for edit mode
        const allImages = [
          ...selectedImages.filter((img) => !img.file).map((img) => img.url),
          ...imageUrls,
        ];
        
        const restaurantData = {
          restaurantName: formData.restaurantName.trim(),
          city: formData.city,
          cuisineType: formData.cuisineType,
          featuredRestaurant: formData.featuredRestaurant === 'Yes',
          phoneNumber: formData.phoneNumber.trim(),
          address: formData.address.trim(),
          description: formData.description.trim(),
          priceRange: formData.priceRange || '',
          images: allImages,
          updatedAt: serverTimestamp(),
        };

        await updateDoc(doc(db, "restaurants", restaurantId), restaurantData);
        setSuccessMessage('Restaurant updated successfully!');
      } else {
        // Create new restaurant
        const restaurantData = {
          restaurantName: formData.restaurantName.trim(),
          city: formData.city,
          cuisineType: formData.cuisineType,
          featuredRestaurant: formData.featuredRestaurant === 'Yes',
          phoneNumber: formData.phoneNumber.trim(),
          address: formData.address.trim(),
          description: formData.description.trim(),
          priceRange: formData.priceRange || '',
          images: imageUrls,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdByEmail: user?.email || '',
        };

        const docRef = await addDoc(collection(db, "restaurants"), restaurantData);
        setSuccessMessage('Restaurant created successfully!');
        
        // Reset form for create mode
        setFormData({
          restaurantName: '',
          city: '',
          cuisineType: '',
          featuredRestaurant: 'No',
          phoneNumber: '',
          address: '',
          description: '',
          priceRange: ''
        });
        setSelectedImages([]);
      }
      
      setShowSuccessAlert(true);
      setError("");
    } catch (error) {
      if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        setError('Upload failed: Please check Firebase Storage permissions. Contact your administrator.');
      } else if (error.message.includes('network')) {
        setError('Network error: Please check your internet connection and try again.');
      } else {
        setError(`Error ${isEditMode ? 'updating' : 'creating'} restaurant: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
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
              onClick={handleBackToRestaurants}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors mr-3"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 lg:hidden">
              {isEditMode ? 'Edit Restaurant' : 'Add Restaurant'}
            </h1>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full scrollbar-hide">
          {/* Header with Back Button - hidden on mobile since it's in the top bar */}
          <div className="hidden lg:flex items-center mb-6">
            <button
              onClick={handleBackToRestaurants}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Restaurants</span>
            </button>
          </div>

          {/* Main Content Container */}
          <div className="max-w-5xl 2xl:max-w-[100rem] mx-auto">
            <div className="bg-[#FAFAFB]">
              {/* Header */}
              <h2 className="text-xl lg:text-2xl font-bold text-black font-PlusJakartaSans mb-8 text-center lg:text-left">
                {isEditMode ? 'Edit Restaurant' : 'Add Restaurant'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Alert */}
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
                    <span>Google Places API not available. Using predefined city list.</span>
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
                            Redirecting to restaurants page...
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSuccessAlert(false);
                            navigate("/restaurants");
                          }}
                          className="ml-4 text-green-400 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-green-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
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
                        disabled={isSubmitting}
                      />
                      <div className="w-24 h-24 mx-auto bg-[#FAFAFB] rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-[#4BADE6]">
                        <Camera size={32} className="text-[#4BADE6] mb-2" />
                        <span className="text-xs text-[#4BADE6]">
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
                            alt="Restaurant preview"
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            disabled={isSubmitting}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-PlusJakartaSans">
                  {/* Restaurant Name */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      Restaurant Name *
                    </label>
                    {renderRestaurantNameInput()}
                  </div>

                  {/* City with Google Places Integration */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      City *
                    </label>
                    {renderCityInput()}
                  </div>

                  {/* Cuisine Type */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      Cuisine Type *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.cuisineType}
                        onChange={(e) =>
                          handleInputChange("cuisineType", e.target.value)
                        }
                        className="appearance-none w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-grayModern"
                        disabled={isSubmitting}
                        required
                      >
                        {cuisineTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <FaCaretDown
                        size={20}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4BADE6] pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Featured Restaurant */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-3">
                      Featured Restaurant
                    </label>
                    <div className="flex flex-col space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="featuredRestaurant"
                          value="Yes"
                          checked={formData.featuredRestaurant === "Yes"}
                          onChange={(e) =>
                            handleInputChange(
                              "featuredRestaurant",
                              e.target.value
                            )
                          }
                          className="mr-2 text-[#4BADE6] focus:ring-[#4BADE6]"
                          disabled={isSubmitting}
                        />
                        <span className="text-sm text-thirdBlack">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="featuredRestaurant"
                          value="No"
                          checked={formData.featuredRestaurant === "No"}
                          onChange={(e) =>
                            handleInputChange(
                              "featuredRestaurant",
                              e.target.value
                            )
                          }
                          className="mr-2 text-[#4BADE6] focus:ring-[#4BADE6]"
                          disabled={isSubmitting}
                        />
                        <span className="text-sm text-thirdBlack">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Price Range for Reservations */}
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <div className="w-full px-4 h-20 border border-gray-300 rounded-3xl bg-white font-PlusJakartaSans">
                        <h3 className="text-sm mt-3">Price Range (For Restaurants)</h3>
                        <div className="flex items-center gap-2 mt-2">
                          {priceRanges.map((range) => (
                            <button
                              key={range}
                              type="button"
                              onClick={() => handlePriceRangeSelect(range)}
                              className={`text-xs rounded-2xl px-4 py-1 transition-colors ${
                                formData.priceRange === range
                                  ? 'bg-[#4BADE6] text-white'
                                  : 'text-gray-500 bg-[#E2F2FB] hover:bg-[#4BADE6] hover:text-white'
                              }`}
                              disabled={isSubmitting}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans "
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Address */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-thirdBlack mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        placeholder="Enter Address"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans "
                        disabled={isSubmitting}
                      />
                    </div>
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
                      placeholder="Describe about your restaurant"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] resize-none font-PlusJakartaSans "
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#4BADE6] text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (isEditMode ? 'Updating Restaurant...' : 'Creating Restaurant...') : (isEditMode ? 'Update Restaurant' : 'Create Restaurant')}
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToRestaurants}
                    disabled={isSubmitting}
                    className="flex-1 bg-white border border-gray-300 text-primaryBlue py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AddRestaurant;