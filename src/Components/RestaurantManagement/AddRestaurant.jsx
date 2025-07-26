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
  const isSelectingRef = useRef(false);

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
  const priceRanges = [
    { symbol: "$", range: "$5-15", label: "$5-15" },
    { symbol: "$$", range: "$15-30", label: "$15-30" },
    { symbol: "$$$", range: "$30-60", label: "$30-60" },
    { symbol: "$$$$", range: "$60+", label: "$60+" }
  ];
  const [customPriceRange, setCustomPriceRange] = useState(false);

  const [error, setError] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [autoFillMessage, setAutoFillMessage] = useState("");
  const [showAutoFillAlert, setShowAutoFillAlert] = useState(false);

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
    // Only proceed if we have a restaurant name
    if (!formData.restaurantName) {
      setRestaurantSuggestions([]);
      return;
    }

    // Clear suggestions for short inputs
    if (formData.restaurantName.length < 2) {
      setRestaurantSuggestions([]);
      return;
    }

    // Only search if Google Places is available and we should show suggestions
    if (!useGooglePlaces || !showRestaurantSuggestions) {
      return;
    }

    const timer = setTimeout(() => {
      searchRestaurants(formData.restaurantName);
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.restaurantName, useGooglePlaces, showRestaurantSuggestions]);

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
              restaurantSessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
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
    e.persist(); // Ensure event object persists
    const value = e.target.value;
    
    // Update form data immediately without any conditions
    setFormData(prev => ({ ...prev, restaurantName: value }));
    
    // Handle suggestions separately with more stable logic
    if (value.length >= 2 && useGooglePlaces) {
      setShowRestaurantSuggestions(true);
    } else {
      setShowRestaurantSuggestions(false);
      if (value.length === 0) {
        setRestaurantSuggestions([]);
      }
    }
  };

  // Fetch place details using Place Details API
  const fetchPlaceDetails = async (placeId) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Places API not available');
      return null;
    }

    return new Promise((resolve, reject) => {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      const request = {
        placeId: placeId,
        fields: [
          'name',
          'formatted_address',
          'formatted_phone_number',
          'website',
          'types',
          'price_level',
          'rating',
          'user_ratings_total',
          'vicinity',
          'address_components',
          'editorial_summary',
          'reviews',
          'opening_hours',
          'serves_beer',
          'serves_wine',
          'serves_vegetarian_food',
          'serves_dinner',
          'serves_lunch',
          'serves_breakfast',
          'takeout',
          'delivery',
          'dine_in',
          'reservable',
          'wheelchair_accessible_entrance'
        ]
      };

      service.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          console.error('Place Details request failed:', status);
          reject(status);
        }
      });
    });
  };

  // Extract city from address components
  const extractCityFromPlace = (place) => {
    if (!place.address_components) return '';
    
    const cityComponent = place.address_components.find(component =>
      component.types.includes('locality') ||
      component.types.includes('administrative_area_level_1')
    );
    
    return cityComponent ? cityComponent.long_name : '';
  };

  // Determine cuisine type from place types and other data
  const determineCuisineFromTypes = (types, placeData) => {
    console.log('Determining cuisine from types:', types, 'and place data:', placeData);
    
    const cuisineMap = {
      'chinese_restaurant': 'Asian',
      'japanese_restaurant': 'Asian',
      'korean_restaurant': 'Asian',
      'thai_restaurant': 'Asian',
      'vietnamese_restaurant': 'Asian',
      'indian_restaurant': 'Asian',
      'italian_restaurant': 'Italian',
      'french_restaurant': 'French',
      'mexican_restaurant': 'Mexican',
      'spanish_restaurant': 'Mediterranean',
      'greek_restaurant': 'Mediterranean',
      'seafood_restaurant': 'Seafood',
      'vegetarian_restaurant': 'Vegetarian',
      'american_restaurant': 'American',
      'turkish_restaurant': 'Mediterranean',
      'lebanese_restaurant': 'Mediterranean',
      'pizza_restaurant': 'Italian',
      'sushi_restaurant': 'Asian',
      'barbecue_restaurant': 'American',
      'steak_house': 'American',
      'meal_takeaway': '', // Don't map this to any cuisine
      'meal_delivery': '', // Don't map this to any cuisine
      'restaurant': '', // Generic restaurant type, check name instead
      'food': '' // Generic food type, check name instead
    };

    // First check for specific restaurant types
    for (const type of types) {
      if (cuisineMap[type] && cuisineMap[type] !== '') {
        console.log('Found cuisine from type:', type, '-> ', cuisineMap[type]);
        return cuisineMap[type];
      }
    }
    
    // Check for vegetarian food serving
    if (placeData.serves_vegetarian_food) {
      console.log('Found vegetarian from serves_vegetarian_food');
      return 'Vegetarian';
    }
    
    // If it's a restaurant but no specific cuisine found, try to determine from name
    if (types.includes('restaurant') || types.includes('food')) {
      const name = placeData.name ? placeData.name.toLowerCase() : '';
      console.log('Analyzing restaurant name for cuisine:', name);
      
      // Look for cuisine keywords in the name
      if (name.includes('pizza') || name.includes('italian') || name.includes('italy')) return 'Italian';
      if (name.includes('chinese') || name.includes('asian') || name.includes('sushi') || name.includes('thai') || name.includes('japanese')) return 'Asian';
      if (name.includes('mexican') || name.includes('taco') || name.includes('burrito') || name.includes('tex-mex')) return 'Mexican';
      if (name.includes('french') || name.includes('bistro') || name.includes('brasserie')) return 'French';
      if (name.includes('mediterranean') || name.includes('greek') || name.includes('turkish')) return 'Mediterranean';
      if (name.includes('seafood') || name.includes('fish') || name.includes('lobster') || name.includes('crab')) return 'Seafood';
      if (name.includes('bbq') || name.includes('grill') || name.includes('steakhouse') || name.includes('burger')) return 'American';
      if (name.includes('indian') || name.includes('curry')) return 'Asian';
      if (name.includes('vegetarian') || name.includes('vegan')) return 'Vegetarian';
    }
    
    console.log('No cuisine found, returning empty');
    return ''; // Return empty if no specific cuisine found
  };

  // Extract actual price information from place data
  const extractPriceInformation = (placeData) => {
    console.log('Extracting price information from:', placeData);
    
    let priceInfo = {
      level: '',
      range: '',
      currency: '$',
      actualPrices: []
    };

    // First, handle the standard price level
    if (placeData.price_level) {
      const priceMap = {
        1: '$5-15',
        2: '$15-30', 
        3: '$30-60',
        4: '$60+'
      };
      priceInfo.level = priceMap[placeData.price_level] || '';
    }

    // Try to extract actual prices from reviews
    if (placeData.reviews && placeData.reviews.length > 0) {
      const priceRegexes = [
        /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, // $10, $15.99, $1,200.50
        /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?) ?dollars?/gi, // 10 dollars, 15.99 dollar
        /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?) ?USD/gi, // 10 USD, 15.99 USD
        /around \$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // around $15, around 20
        /about \$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // about $15, about 20
        /costs? \$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // costs $15, cost 20
        /price.{0,10}\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // price is $15, pricing around 20
        /meal.{0,10}\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // meal for $15, meal costs 20
        /dinner.{0,10}\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // dinner was $15, dinner cost 20
        /lunch.{0,10}\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // lunch for $15, lunch cost 20
        /total.{0,10}\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // total was $15, total cost 20
        /bill.{0,10}\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // bill was $15, bill came to 20
        /paid \$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // paid $15, paid 20
        /spent \$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // spent $15, spent 20
      ];

      const extractedPrices = [];
      
      placeData.reviews.forEach(review => {
        if (review.text) {
          priceRegexes.forEach(regex => {
            let match;
            while ((match = regex.exec(review.text)) !== null) {
              const price = parseFloat(match[1].replace(/,/g, ''));
              if (price > 0 && price < 1000) { // Reasonable price range
                extractedPrices.push(price);
              }
            }
          });
        }
      });

      // Remove duplicates and sort
      const uniquePrices = [...new Set(extractedPrices)].sort((a, b) => a - b);
      
      if (uniquePrices.length > 0) {
        priceInfo.actualPrices = uniquePrices;
        
        // Create a price range string based on the distribution
        if (uniquePrices.length === 1) {
          priceInfo.range = `$${uniquePrices[0]}`;
        } else if (uniquePrices.length <= 3) {
          // For few prices, show them all
          priceInfo.range = uniquePrices.map(p => `$${p}`).join(', ');
        } else {
          // For many prices, show range
          const min = Math.min(...uniquePrices);
          const max = Math.max(...uniquePrices);
          
          // If there's a big spread, show range; if close together, show average range
          const spread = max - min;
          if (spread > min * 0.5) { // If spread is more than 50% of min price
            priceInfo.range = `$${min} - $${max}`;
          } else {
            // Show a tighter range around the median
            const median = uniquePrices[Math.floor(uniquePrices.length / 2)];
            const avgLow = Math.round((min + median) / 2);
            const avgHigh = Math.round((median + max) / 2);
            priceInfo.range = `$${avgLow} - $${avgHigh}`;
          }
        }
      }
    }

    // If we have actual prices, use them; otherwise fallback to symbols
    const finalPrice = priceInfo.range || priceInfo.level;
    
    console.log('Extracted price info:', priceInfo);
    console.log('Final price result:', finalPrice);
    
    return finalPrice;
  };

  // Generate comprehensive description from available place data
  const generateDescription = (placeData) => {
    console.log('Generating description from place data:', placeData);
    let description = '';
    
    // Start with editorial summary if available
    if (placeData.editorial_summary && placeData.editorial_summary.overview) {
      description = placeData.editorial_summary.overview;
      console.log('Using editorial summary:', description);
      return description; // Use editorial summary as-is if available
    }
    
    console.log('No editorial summary available, generating comprehensive description');
    
    // Build a comprehensive description from multiple sources
    const descriptionParts = [];
    
    // 1. Start with restaurant type and basic info
    const types = placeData.types || [];
    const restaurantTypes = types.filter(type => 
      type.includes('restaurant') || type.includes('food') || type.includes('meal')
    );
    
    if (restaurantTypes.length > 0) {
      const typeNames = restaurantTypes.map(type => {
        return type.replace(/_/g, ' ').replace('restaurant', '').trim();
      }).filter(name => name.length > 0);
      
      if (typeNames.length > 0) {
        descriptionParts.push(`A ${typeNames.join(', ')} establishment`);
      }
    }
    
    // 2. Add rating and review count
    if (placeData.rating) {
      let ratingInfo = `Rated ${placeData.rating} stars`;
      if (placeData.user_ratings_total) {
        ratingInfo += ` based on ${placeData.user_ratings_total} reviews`;
      }
      descriptionParts.push(ratingInfo);
    }
    
    // 3. Add opening hours info
    if (placeData.opening_hours) {
      if (placeData.opening_hours.open_now === true) {
        descriptionParts.push('Currently open');
      } else if (placeData.opening_hours.open_now === false) {
        descriptionParts.push('Currently closed');
      }
    }
    
    // 4. Add service options
    const services = [];
    if (placeData.dine_in === true) services.push('dine-in');
    if (placeData.takeout === true) services.push('takeout');
    if (placeData.delivery === true) services.push('delivery');
    if (placeData.reservable === true) services.push('accepts reservations');
    
    if (services.length > 0) {
      descriptionParts.push(`Offers ${services.join(', ')}`);
    }
    
    // 5. Add meal service times
    const meals = [];
    if (placeData.serves_breakfast === true) meals.push('breakfast');
    if (placeData.serves_lunch === true) meals.push('lunch');
    if (placeData.serves_dinner === true) meals.push('dinner');
    
    if (meals.length > 0) {
      descriptionParts.push(`Serves ${meals.join(', ')}`);
    }
    
    // 6. Add dietary and beverage options
    const specialOptions = [];
    if (placeData.serves_vegetarian_food === true) specialOptions.push('vegetarian options');
    if (placeData.serves_beer === true) specialOptions.push('beer');
    if (placeData.serves_wine === true) specialOptions.push('wine');
    
    if (specialOptions.length > 0) {
      descriptionParts.push(`Features ${specialOptions.join(', ')}`);
    }
    
    // 7. Add accessibility features (only supported fields)
    const amenities = [];
    if (placeData.wheelchair_accessible_entrance === true) amenities.push('wheelchair accessible');
    
    if (amenities.length > 0) {
      descriptionParts.push(`Amenities include ${amenities.join(', ')}`);
    }
    
    // 8. Add website reference if available
    if (placeData.website) {
      descriptionParts.push('Check their website for menu and hours');
    }
    
    // 9. Extract highlights from reviews if available
    if (placeData.reviews && placeData.reviews.length > 0) {
      const reviewHighlights = extractReviewHighlights(placeData.reviews);
      if (reviewHighlights.length > 0) {
        descriptionParts.push(`Popular for: ${reviewHighlights.join(', ')}`);
      }
    }
    
    // 9. If we have some info, combine it
    if (descriptionParts.length > 0) {
      description = descriptionParts.join('. ') + '.';
    }
    
    // 10. Fallback to review excerpt if still no good description
    if (!description && placeData.reviews && placeData.reviews.length > 0) {
      console.log('Using review excerpt as fallback');
      const bestReview = findBestReview(placeData.reviews);
      if (bestReview) {
        description = bestReview;
      }
    }
    
    console.log('Final generated description:', description);
    return description;
  };

  // Extract highlights and popular items from reviews
  const extractReviewHighlights = (reviews) => {
    const highlights = new Set();
    const foodItems = new Set();
    
    // Keywords to look for in reviews
    const highlightKeywords = [
      'great', 'excellent', 'amazing', 'delicious', 'fantastic', 'wonderful',
      'best', 'favorite', 'love', 'perfect', 'outstanding', 'incredible'
    ];
    
    const foodKeywords = [
      'pizza', 'burger', 'pasta', 'chicken', 'beef', 'fish', 'salad', 'soup',
      'sandwich', 'steak', 'seafood', 'dessert', 'coffee', 'bread', 'cheese',
      'tacos', 'sushi', 'ramen', 'curry', 'noodles', 'rice', 'wings', 'fries',
      'nachos', 'quesadilla', 'burrito', 'pancakes', 'waffles', 'omelette',
      'lobster', 'shrimp', 'salmon', 'tuna', 'crab', 'oysters', 'mussels',
      'ribs', 'pork', 'lamb', 'duck', 'turkey', 'bacon', 'sausage',
      'cake', 'pie', 'ice cream', 'chocolate', 'cookies', 'donuts',
      'wine', 'beer', 'cocktails', 'smoothies', 'juice', 'tea'
    ];
    
    reviews.slice(0, 5).forEach(review => { // Check first 5 reviews
      if (review.text) {
        const text = review.text.toLowerCase();
        
        // Find highlighted aspects
        highlightKeywords.forEach(keyword => {
          const regex = new RegExp(`${keyword}\\s+(\\w+(?:\\s+\\w+){0,2})`, 'gi');
          const matches = text.match(regex);
          if (matches) {
            matches.forEach(match => {
              const cleaned = match.replace(keyword, '').trim();
              if (cleaned.length > 2 && cleaned.length < 20) {
                highlights.add(cleaned);
              }
            });
          }
        });
        
        // Find mentioned food items
        foodKeywords.forEach(food => {
          if (text.includes(food)) {
            foodItems.add(food);
          }
        });
      }
    });
    
    const result = [];
    
    // Add food highlights
    if (foodItems.size > 0) {
      result.push([...foodItems].slice(0, 3).join(', '));
    }
    
    // Add service highlights
    if (highlights.size > 0) {
      result.push([...highlights].slice(0, 2).join(', '));
    }
    
    return result;
  };

  // Find the best review excerpt to use as description
  const findBestReview = (reviews) => {
    let bestReview = '';
    
    // Look for reviews with good length and descriptive content
    for (const review of reviews.slice(0, 3)) {
      if (review.text && review.text.length > 100 && review.text.length < 300) {
        // Look for reviews that describe the restaurant rather than just rating
        const text = review.text.toLowerCase();
        if (text.includes('restaurant') || text.includes('food') || text.includes('service') || 
            text.includes('atmosphere') || text.includes('place')) {
          
          // Get first two sentences
          const sentences = review.text.split(/[.!?]+/);
          if (sentences.length >= 2) {
            bestReview = sentences.slice(0, 2).join('. ').trim() + '.';
            break;
          }
        }
      }
    }
    
    // Fallback to first decent length review
    if (!bestReview) {
      for (const review of reviews.slice(0, 3)) {
        if (review.text && review.text.length > 50) {
          const firstSentence = review.text.split(/[.!?]/)[0];
          if (firstSentence.length > 20 && firstSentence.length < 200) {
            bestReview = firstSentence + '.';
            break;
          }
        }
      }
    }
    
    return bestReview;
  };

  // Handle restaurant suggestion selection with auto-fill
  const handleRestaurantSelect = async (suggestion) => {
    try {
      isSelectingRef.current = true;
      
      // Immediately hide suggestions and clear the list
      setShowRestaurantSuggestions(false);
      setRestaurantSuggestions([]);
      
      // Set the restaurant name immediately and ensure it's stable
      setFormData(prev => ({ 
        ...prev, 
        restaurantName: suggestion.mainText || suggestion.description 
      }));
      
      // Show loading state
      setRestaurantSuggestionLoading(true);
      
      // Restore focus to input after a small delay to ensure stability
      setTimeout(() => {
        if (restaurantInputRef.current && !isSubmitting) {
          restaurantInputRef.current.focus();
          // Ensure cursor is at the end
          const input = restaurantInputRef.current;
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }, 150);
      
      // Fetch place details
      console.log('Starting to fetch place details for:', suggestion.placeId);
      const placeDetails = await fetchPlaceDetails(suggestion.placeId);
      
      if (placeDetails) {
        console.log('✅ Place details successfully received:', placeDetails);
        
        try {
          // Extract and set additional details with error handling
          let city = '';
          let cuisine = '';
          let priceRange = '';
          let description = '';

          try {
            city = extractCityFromPlace(placeDetails);
            console.log('City extracted:', city);
          } catch (error) {
            console.error('Error extracting city:', error);
          }

          try {
            cuisine = determineCuisineFromTypes(placeDetails.types || [], placeDetails);
            console.log('Cuisine extracted:', cuisine);
          } catch (error) {
            console.error('Error extracting cuisine:', error);
          }

          try {
            priceRange = extractPriceInformation(placeDetails);
            console.log('Price range extracted:', priceRange);
          } catch (error) {
            console.error('Error extracting price range:', error);
          }

          try {
            description = generateDescription(placeDetails);
            console.log('Description extracted:', description);
          } catch (error) {
            console.error('Error generating description:', error);
          }
          
          console.log('All extracted data:', { city, cuisine, priceRange, description });
        
          setFormData(prev => {
            const newData = {
              ...prev,
              restaurantName: placeDetails.name || suggestion.mainText,
              address: placeDetails.formatted_address || placeDetails.vicinity || prev.address,
              phoneNumber: placeDetails.formatted_phone_number || prev.phoneNumber,
              // Auto-fill these fields even if current form has values, but only if API provides data
              city: city ? city : prev.city,
              cuisineType: cuisine ? cuisine : prev.cuisineType,
              priceRange: priceRange ? priceRange : prev.priceRange,
              description: description ? description : prev.description,
            };
            console.log('Updated form data:', newData);
            return newData;
          });

          // If we got a custom price range (actual prices), enable custom mode
          try {
            const standardRanges = priceRanges.map(p => p.range);
            if (priceRange && !standardRanges.includes(priceRange)) {
              setCustomPriceRange(true);
            } else if (priceRange && standardRanges.includes(priceRange)) {
              setCustomPriceRange(false);
            }
          } catch (error) {
            console.error('Error setting custom price range:', error);
          }
        } catch (error) {
          console.error('Error in data extraction process:', error);
          // Fallback: at least set the restaurant name
          setFormData(prev => ({
            ...prev,
            restaurantName: placeDetails.name || suggestion.mainText,
            address: placeDetails.formatted_address || placeDetails.vicinity || prev.address,
            phoneNumber: placeDetails.formatted_phone_number || prev.phoneNumber,
          }));
        }
        
        console.log('Auto-filled restaurant details:', {
          name: placeDetails.name,
          address: placeDetails.formatted_address,
          phone: placeDetails.formatted_phone_number,
          city: city,
          cuisine: cuisine,
          priceRange: priceRange,
          description: description,
          rating: placeDetails.rating,
          priceLevel: placeDetails.price_level,
          types: placeDetails.types,
          services: {
            dineIn: placeDetails.dine_in,
            takeout: placeDetails.takeout,
            delivery: placeDetails.delivery,
            reservable: placeDetails.reservable
          }
        });

        // Show auto-fill success message
        try {
          const filledFields = [];
          if (placeDetails.formatted_address || placeDetails.vicinity) filledFields.push('address');
          if (placeDetails.formatted_phone_number) filledFields.push('phone');
          if (city) filledFields.push('city');
          if (cuisine) filledFields.push('cuisine type');
          if (priceRange) filledFields.push('price range');
          if (description) filledFields.push('description');

          console.log('Fields that were filled:', filledFields);

          if (filledFields.length > 0) {
            console.log('Showing auto-fill success message');
            const message = `Auto-filled: ${filledFields.join(', ')}`;
            console.log('Setting autoFillMessage to:', message);
            console.log('Setting showAutoFillAlert to: true');
            
            // Use setTimeout to ensure state updates are processed
            setTimeout(() => {
              setAutoFillMessage(message);
              setShowAutoFillAlert(true);
            }, 100);
            
            // Auto-hide after 4 seconds (longer to see it)
            setTimeout(() => {
              console.log('Hiding auto-fill alert');
              setShowAutoFillAlert(false);
            }, 4000);
          } else {
            console.log('No fields were auto-filled');
          }
        } catch (error) {
          console.error('Error showing auto-fill success message:', error);
        }
      } else {
        console.error('❌ No place details received from API');
        // Fallback: just set the restaurant name from suggestion
        setFormData(prev => ({
          ...prev,
          restaurantName: suggestion.mainText || suggestion.description
        }));
      }
      
      // Create new session token for next search (legacy API)
      if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.AutocompleteSessionToken) {
        restaurantSessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      }
      
    } catch (error) {
      console.error('Error fetching place details:', error);
      // Still proceed with basic name setting even if details fetch fails
    } finally {
      setRestaurantSuggestionLoading(false);
      isSelectingRef.current = false;
    }
  };

  // Hide restaurant suggestions when clicking outside
  const handleRestaurantInputBlur = (e) => {
    // Don't hide if we're in the middle of selecting
    if (isSelectingRef.current) {
      return;
    }
    
    // Use a longer delay to prevent premature hiding
    setTimeout(() => {
      // Check if we're still in selection process
      if (isSelectingRef.current) {
        return;
      }
      
      const activeElement = document.activeElement;
      const isClickingDropdown = activeElement && activeElement.closest('.restaurant-suggestions-dropdown');
      
      if (!isClickingDropdown) {
        setShowRestaurantSuggestions(false);
      }
    }, 200);
  };

  // Show restaurant suggestions when focusing input
  const handleRestaurantInputFocus = (e) => {
    // Only show suggestions if we have enough characters and existing suggestions
    if (formData.restaurantName.length >= 2 && restaurantSuggestions.length > 0 && useGooglePlaces) {
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
            value={formData.restaurantName || ''} // Ensure controlled input
            onChange={handleRestaurantNameChange}
            onFocus={handleRestaurantInputFocus}
            onBlur={handleRestaurantInputBlur}
            placeholder="Search for a restaurant or enter manually..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-black placeholder:text-grayModern"
            disabled={isSubmitting}
            required
            autoComplete="off"
          />
          {restaurantSuggestionLoading ? (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4BADE6]"></div>
            </div>
          ) : (
            <FaCaretDown
              size={20}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4BADE6] pointer-events-none"
            />
          )}
          
          {/* Restaurant suggestions dropdown */}
          {showRestaurantSuggestions && restaurantSuggestions.length > 0 && (
            <div className="restaurant-suggestions-dropdown absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-56 overflow-y-auto">
              {restaurantSuggestionLoading && (
                <div className="px-4 py-2 text-gray-500 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4BADE6] mr-2"></div>
                  Loading restaurants...
                </div>
              )}
              {!restaurantSuggestionLoading && restaurantSuggestions.map((suggestion) => (
                <div
                  key={suggestion.placeId}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestaurantSelect(suggestion);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input from losing focus
                  }}
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
        value={formData.restaurantName || ''} // Ensure controlled input
        onChange={handleRestaurantNameChange}
        placeholder="Enter restaurant name"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent bg-[#FAFAFB] font-PlusJakartaSans text-black placeholder:text-grayModern"
        disabled={isSubmitting}
        required
        autoComplete="off"
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

  // Auto-hide auto-fill alert is handled manually in the auto-fill function

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
    if (range === 'custom') {
      setCustomPriceRange(true);
    } else {
      setCustomPriceRange(false);
      setFormData(prev => ({
        ...prev,
        priceRange: range
      }));
    }
  };

  const handleCustomPriceChange = (e) => {
    setFormData(prev => ({
      ...prev,
      priceRange: e.target.value
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

                {/* Auto-fill Alert */}
                {showAutoFillAlert && (
                  <div className="fixed top-20 right-4 z-50 max-w-md">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-blue-800">
                            Auto-filled!
                          </h3>
                          <p className="mt-1 text-sm text-blue-700">
                            {autoFillMessage || 'Fields have been auto-filled'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Auto-fill alert close button clicked');
                            setShowAutoFillAlert(false);
                          }}
                          className="ml-4 text-blue-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-100"
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
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-3xl bg-white font-PlusJakartaSans">
                        <h3 className="text-sm mb-3">Price Range (For Restaurants)</h3>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          {priceRanges.map((priceObj) => (
                            <button
                              key={priceObj.symbol}
                              type="button"
                              onClick={() => handlePriceRangeSelect(priceObj.range)}
                              className={`text-xs rounded-2xl px-3 py-1 transition-colors ${
                                formData.priceRange === priceObj.range && !customPriceRange
                                  ? 'bg-[#4BADE6] text-white'
                                  : 'text-gray-500 bg-[#E2F2FB] hover:bg-[#4BADE6] hover:text-white'
                              }`}
                              disabled={isSubmitting}
                            >
                              {priceObj.label}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => handlePriceRangeSelect('custom')}
                            className={`text-xs rounded-2xl px-4 py-1 transition-colors ${
                              customPriceRange
                                ? 'bg-[#4BADE6] text-white'
                                : 'text-gray-500 bg-[#E2F2FB] hover:bg-[#4BADE6] hover:text-white'
                            }`}
                            disabled={isSubmitting}
                          >
                            Custom
                          </button>
                        </div>
                        {customPriceRange && (
                          <input
                            type="text"
                            value={formData.priceRange}
                            onChange={handleCustomPriceChange}
                            placeholder="e.g., $8-18, $25-40, $12"
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BADE6] focus:border-transparent"
                            disabled={isSubmitting}
                          />
                        )}
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