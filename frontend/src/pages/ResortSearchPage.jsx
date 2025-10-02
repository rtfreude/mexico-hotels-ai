import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Bot, ExternalLink, Palmtree, Star, Waves, Utensils, Dumbbell, MapPin, Sun } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import HotelGrid from '../components/HotelGrid';
import ResortGrid from '../components/ResortGrid';
import Header from '../components/Header';
import SuggestedSearches from '../components/SuggestedSearches';
import GoogleMap from '../components/GoogleMap';
import CategorizedResults from '../components/CategorizedResults';
import { usePublishedHotels } from '../lib/usePublishedHotelsHook';
import { fetchSiteSettings } from '../lib/useSanitySiteSettings';

function ResortSearchPage() {
  const { hotels, setHotels } = usePublishedHotels({ autoLoad: true });
  const [resorts, setResorts] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Add initial loading state
  const [aiResponse, setAiResponse] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const location = useLocation();
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchSiteSettings().then(s => { if (mounted && s) setSiteSettings(s); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Sample resort data for immediate display while API loads
  const getSampleResortData = (destination, type) => {
    const resortsByDestination = {
      'riviera-maya': [
        {
          id: 'resort-001',
          name: 'Grand Velas Riviera Maya',
          type: 'Ultra-Luxury All-Inclusive',
          city: 'Playa del Carmen',
          state: 'Quintana Roo',
          location: 'Riviera Maya',
          rating: 4.8,
          priceRange: '$$$$$',
          description: 'Ultra-luxury all-inclusive resort featuring three distinct ambiances: adults-only Grand Class, family-friendly Ambassador, and intimate Kids\' Club suites.',
          amenities: ['All-Inclusive', 'Beach Access', 'Spa', 'Pool', 'Kids Club', 'Adults Only Areas', 'Golf Course', 'WiFi'],
          nearbyAttractions: ['Xcaret Park', 'Xel-Há', 'Cenote Azul', 'Tulum Ruins'],
          imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
          affiliateLink: 'https://www.grandvelas.com/riviera-maya/'
        },
        {
          id: 'resort-002', 
          name: 'Rosewood Mayakoba',
          type: 'Ultra-Luxury Eco-Resort',
          city: 'Playa del Carmen',
          state: 'Quintana Roo',
          location: 'Riviera Maya',
          rating: 4.9,
          priceRange: '$$$$$',
          description: 'Intimate luxury resort nestled along a mile-long arc of Caribbean coastline with overwater lagoon suites and beachfront villas.',
          amenities: ['Beach Access', 'Spa', 'Pool', 'Restaurant', 'Bar', 'WiFi', 'Fitness Center'],
          nearbyAttractions: ['Cenotes', 'Mayan Ruins', 'Jungle Tours', 'Snorkeling'],
          imageUrl: 'https://images.unsplash.com/photo-1570792328831-0c9ce06bf824?w=800&q=80',
          affiliateLink: 'https://www.rosewoodhotels.com/mayakoba'
        },
        {
          id: 'resort-003',
          name: 'Andaz Mayakoba',
          type: 'Luxury Eco-Resort',
          city: 'Playa del Carmen', 
          state: 'Quintana Roo',
          location: 'Riviera Maya',
          rating: 4.7,
          priceRange: '$$$$',
          description: 'Contemporary luxury resort surrounded by lagoons, cenotes, and jungle, offering authentic Mexican experiences with modern sophistication.',
          amenities: ['Beach Access', 'Spa', 'Pool', 'All-Inclusive', 'Kids Club', 'Restaurant', 'Bar', 'WiFi'],
          nearbyAttractions: ['El Rey Ruins', 'Cenote Dos Ojos', 'Aktun Chen', 'Xcaret'],
          imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
          affiliateLink: 'https://www.hyatt.com/andaz/mayakoba'
        }
      ],
      'los-cabos': [
        {
          id: 'resort-004',
          name: 'Montage Los Cabos',
          type: 'Ultra-Luxury Desert Resort',
          city: 'Los Cabos',
          state: 'Baja California Sur',
          location: 'Los Cabos',
          rating: 4.8,
          priceRange: '$$$$$',
          description: 'Sophisticated beachfront resort where desert meets sea, featuring panoramic ocean views and world-class amenities.',
          amenities: ['Beach Access', 'Spa', 'Pool', 'Golf Course', 'Restaurant', 'Bar', 'WiFi', 'Fitness Center'],
          nearbyAttractions: ['El Arco', 'Marina', 'Golf Courses', 'Deep Sea Fishing'],
          imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=800&q=80',
          affiliateLink: 'https://www.montagehotels.com/loscabos'
        },
        {
          id: 'resort-005',
          name: 'One&Only Palmilla',
          type: 'Ultra-Luxury Beach Resort',
          city: 'Los Cabos',
          state: 'Baja California Sur', 
          location: 'Los Cabos',
          rating: 4.9,
          priceRange: '$$$$$',
          description: 'Legendary ultra-luxury resort offering unparalleled service and breathtaking views of the Sea of Cortez.',
          amenities: ['Beach Access', 'Spa', 'Pool', 'Golf Course', 'Adults Only', 'Restaurant', 'Bar', 'WiFi'],
          nearbyAttractions: ['Arch of Cabo San Lucas', 'Lover\'s Beach', 'Marina Cabo San Lucas', 'Golf Del Sol'],
          imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
          affiliateLink: 'https://www.oneandonlyresorts.com/palmilla'
        }
      ],
      'tulum': [
        {
          id: 'resort-006',
          name: 'Azulik Tulum',
          type: 'Eco-Luxury Wellness Resort',
          city: 'Tulum',
          state: 'Quintana Roo',
          location: 'Tulum',
          rating: 4.6,
          priceRange: '$$$$',
          description: 'Adults-only eco-resort featuring treehouse-style villas with stunning ocean views and no electricity for a true digital detox.',
          amenities: ['Beach Access', 'Spa', 'Adults Only', 'Restaurant', 'Bar', 'Wellness Center'],
          nearbyAttractions: ['Tulum Ruins', 'Cenote Dos Ojos', 'Sian Ka\'an Biosphere', 'Beach Clubs'],
          imageUrl: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80',
          affiliateLink: 'https://www.azulik.com'
        }
      ],
      'puerto-vallarta': [
        {
          id: 'resort-007',
          name: 'Four Seasons Punta Mita',
          type: 'Ultra-Luxury Beach Resort',
          city: 'Puerto Vallarta',
          state: 'Nayarit',
          location: 'Puerto Vallarta',
          rating: 4.8,
          priceRange: '$$$$$',
          description: 'Exclusive beachfront resort on a private peninsula offering championship golf, world-class spa, and authentic Mexican hospitality.',
          amenities: ['Beach Access', 'Spa', 'Pool', 'Golf Course', 'Kids Club', 'Restaurant', 'Bar', 'WiFi'],
          nearbyAttractions: ['Marieta Islands', 'Puerto Vallarta Marina', 'Malecón Boardwalk', 'Vallarta Botanical Gardens'],
          imageUrl: 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&q=80',
          affiliateLink: 'https://www.fourseasons.com/puntamita'
        }
      ],
      'cancun': [
        {
          id: 'resort-008',
          name: 'Ritz-Carlton Cancun',
          type: 'Ultra-Luxury Beach Resort',
          city: 'Cancun',
          state: 'Quintana Roo',
          location: 'Cancun',
          rating: 4.7,
          priceRange: '$$$$$',
          description: 'Iconic luxury resort in the heart of Cancun\'s Hotel Zone, offering refined elegance and world-class service.',
          amenities: ['Beach Access', 'Spa', 'Pool', 'All-Inclusive', 'Kids Club', 'Restaurant', 'Bar', 'WiFi'],
          nearbyAttractions: ['Chichen Itza', 'Isla Mujeres', 'Xcaret', 'Cozumel'],
          imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
          affiliateLink: 'https://www.ritzcarlton.com/cancun'
        },
        {
          id: 'resort-009',
          name: 'Live Aqua Beach Resort Cancun',
          type: 'Adults-Only Ultra-Luxury',
          city: 'Cancun',
          state: 'Quintana Roo',
          location: 'Cancun',
          rating: 4.5,
          priceRange: '$$$$',
          description: 'Adults-only all-inclusive resort with sophisticated design, world-class spa, and gourmet dining experiences.',
          amenities: ['Adults Only', 'Beach Access', 'Spa', 'Pool', 'All-Inclusive', 'Fine Dining', 'Bar', 'WiFi'],
          nearbyAttractions: ['Underwater Museum', 'Isla Mujeres', 'Downtown Cancun', 'Mayan Museum'],
          imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
          affiliateLink: 'https://www.liveaqua.com/cancun'
        },
        {
          id: 'resort-010',
          name: 'Secrets The Vine Cancun',
          type: 'Adults-Only Luxury Resort',
          city: 'Cancun',
          state: 'Quintana Roo',
          location: 'Cancun',
          rating: 4.4,
          priceRange: '$$$$',
          description: 'Elegant adults-only resort featuring stunning ocean views, premium suites, and exceptional dining.',
          amenities: ['Adults Only', 'Beach Access', 'Spa', 'Pool', 'All-Inclusive', 'Suites', 'Restaurant', 'Bar', 'WiFi'],
          nearbyAttractions: ['Interactive Aquarium', 'La Isla Shopping Village', 'Golf Courses', 'Xcaret Park'],
          imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
          affiliateLink: 'https://www.secretsresorts.com/secrets-the-vine-cancun'
        },
        {
          id: 'resort-011',
          name: 'Hyatt Zilara Cancun',
          type: 'Adults-Only All-Inclusive',
          city: 'Cancun',
          state: 'Quintana Roo',
          location: 'Cancun',
          rating: 4.6,
          priceRange: '$$$$',
          description: 'Adults-only oceanfront resort with luxurious suites, multiple pools, and world-class amenities.',
          amenities: ['Adults Only', 'Beach Access', 'Spa', 'Pool', 'All-Inclusive', 'Suites', 'Multiple Restaurants', 'Bar', 'WiFi'],
          nearbyAttractions: ['El Rey Ruins', 'Cancun Underwater Museum', 'Isla Mujeres Ferry', 'Nichupté Lagoon'],
          imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
          affiliateLink: 'https://www.hyatt.com/hyatt-zilara/cnczr-hyatt-zilara-cancun'
        },
        {
          id: 'resort-012',
          name: 'Moon Palace Cancun',
          type: 'Family-Friendly All-Inclusive',
          city: 'Cancun',
          state: 'Quintana Roo',
          location: 'Cancun',
          rating: 4.3,
          priceRange: '$$$',
          description: 'Expansive family resort featuring water parks, kids clubs, championship golf, and endless activities.',
          amenities: ['Family-Friendly', 'Beach Access', 'Water Park', 'Kids Club', 'Pool', 'All-Inclusive', 'Golf Course', 'Restaurant', 'Bar', 'WiFi'],
          nearbyAttractions: ['Xcaret Park', 'Xel-Há', 'Chichen Itza Tours', 'Tulum Day Trips'],
          imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
          affiliateLink: 'https://www.palaceresorts.com/moon-palace-cancun'
        },
        {
          id: 'resort-013',
          name: 'Grand Fiesta Americana Coral Beach',
          type: 'Luxury Family Resort',
          city: 'Cancun',
          state: 'Quintana Roo',
          location: 'Cancun',
          rating: 4.5,
          priceRange: '$$$$',
          description: 'Prime beachfront location with spacious suites, multiple pools, and award-winning spa facilities.',
          amenities: ['Family-Friendly', 'Beach Access', 'Spa', 'Pool', 'Kids Club', 'Restaurant', 'Bar', 'WiFi', 'Suites'],
          nearbyAttractions: ['Interactive Aquarium', 'Mercado 28', 'Coco Bongo', 'Dolphin Beach'],
          imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
          affiliateLink: 'https://www.grandfiestamericana.com/coral-beach-cancun'
        }
      ]
    };

    const sampleRestaurants = [
      {
        id: 'rest-001',
        name: 'Hartwood',
        location: destination === 'tulum' ? 'Tulum Beach Road' : 'Coastal Area',
        cuisine: 'Wood-fired Mexican',
        rating: 4.6,
        priceRange: '$$$',
        description: 'Renowned farm-to-table restaurant featuring wood-fired cooking and locally sourced ingredients.'
      },
      {
        id: 'rest-002', 
        name: 'Pujol',
        location: destination.includes('maya') ? 'Playa del Carmen' : 'Resort Area',
        cuisine: 'Modern Mexican',
        rating: 4.8,
        priceRange: '$$$$',
        description: 'Acclaimed restaurant offering innovative Mexican cuisine with contemporary presentation.'
      }
    ];

    const sampleActivities = [
      {
        id: 'act-001',
        name: 'Cenote Diving',
        location: destination,
        type: 'Adventure',
        rating: 4.7,
        duration: 'Half Day',
        description: 'Explore stunning underwater caves and crystal-clear cenotes.'
      },
      {
        id: 'act-002',
        name: 'Mayan Ruins Tour', 
        location: destination,
        type: 'Cultural',
        rating: 4.8,
        duration: 'Full Day',
        description: 'Discover ancient Mayan civilization at archaeological sites.'
      }
    ];

    let filteredResorts = resortsByDestination[destination] || [];
    
    // Debug logging to see what's happening
    console.log('Debug - getSampleResortData called with:', { destination, type });
    console.log('Debug - Available resorts for destination:', filteredResorts.length);
    console.log('Debug - Resort names:', filteredResorts.map(r => r.name));
    
    // Filter by type if specified
    if (type) {
      const typeFilters = {
        'luxury': ['Ultra-Luxury', 'Luxury'],
        'family-friendly': ['Family-Friendly', 'Family', 'All-Inclusive'],
        'adults-only': ['Adults-Only', 'Adults Only', 'Adults-Only Ultra-Luxury', 'Adults-Only Luxury Resort', 'Adults-Only All-Inclusive'],
        'eco-luxury': ['Eco-Luxury', 'Eco-Resort']
      };
      
      const matchingTypes = typeFilters[type] || [];
      console.log('Debug - Filtering by type:', type);
      console.log('Debug - Matching type patterns:', matchingTypes);
      
      const beforeFilterCount = filteredResorts.length;
      filteredResorts = filteredResorts.filter(resort => 
        matchingTypes.some(filterType => resort.type.includes(filterType)) ||
        (type === 'adults-only' && resort.amenities && resort.amenities.includes('Adults Only'))
      );
      
      console.log('Debug - Resorts before filtering:', beforeFilterCount);
      console.log('Debug - Resorts after filtering:', filteredResorts.length);
      console.log('Debug - Filtered resort names:', filteredResorts.map(r => r.name));
      console.log('Debug - Filtered resort types:', filteredResorts.map(r => r.type));
    }

    return {
      resorts: filteredResorts,
      restaurants: sampleRestaurants,
      activities: sampleActivities
    };
  };

  // Resort affiliate configurations by parent company
  const RESORT_AFFILIATES = {
    marriott: {
      code: 'marriott-affiliate-id',
      baseUrl: 'https://www.marriott.com/search/submitSearch.mi',
      name: 'Marriott International'
    },
    hilton: {
      code: 'hilton-affiliate-id', 
      baseUrl: 'https://www.hilton.com/en/book/',
      name: 'Hilton Worldwide'
    },
    hyatt: {
      code: 'hyatt-affiliate-id',
      baseUrl: 'https://www.hyatt.com/search/',
      name: 'Hyatt Hotels'
    },
    iberostar: {
      code: 'iberostar-affiliate-id',
      baseUrl: 'https://www.iberostar.com/en/hotels/',
      name: 'Iberostar Hotels & Resorts'
    },
    palace: {
      code: 'palace-affiliate-id',
      baseUrl: 'https://www.palaceresorts.com/book/',
      name: 'Palace Resorts'
    },
    excellence: {
      code: 'excellence-affiliate-id',
      baseUrl: 'https://www.excellenceresorts.com/book/',
      name: 'Excellence Group'
    },
    secrets: {
      code: 'secrets-affiliate-id',
      baseUrl: 'https://www.secretsresorts.com/book/',
      name: 'Secrets Resorts'
    },
    breathless: {
      code: 'breathless-affiliate-id',
      baseUrl: 'https://www.breathlessresorts.com/book/',
      name: 'Breathless Resorts'
    },
    dreams: {
      code: 'dreams-affiliate-id',
      baseUrl: 'https://www.dreamsresorts.com/book/',
      name: 'Dreams Resorts'
    },
    now: {
      code: 'now-affiliate-id',
      baseUrl: 'https://www.nowresorts.com/book/',
      name: 'Now Resorts'
    }
  };

  // Generate resort-specific affiliate link
  // const generateResortLink = (resortBrand, destination, checkin, checkout, guests = 2) => {
  //   const affiliate = RESORT_AFFILIATES[resortBrand] || RESORT_AFFILIATES.marriott;
  //   const params = new URLSearchParams({
  //     destination: destination || 'Mexico',
  //     startDate: checkin || '',
  //     endDate: checkout || '',
  //     rooms: '1',
  //     adults: guests.toString(),
  //     affiliateId: affiliate.code
  //   });
  //   return `${affiliate.baseUrl}?${params.toString()}`;
  // };

  // Auto-search with AI when destination and type are provided
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const destination = urlParams.get('destination');
    const type = urlParams.get('type');
    
    if (destination) {
      setSelectedDestination(destination);
      setSelectedType(type || '');
      
      // Auto-trigger AI search with the selected criteria
      const destinationDisplayName = getDestinationDisplayName(destination);
      const typeDisplayName = getTypeDisplayName(type);
      
      let aiQuery = `Show me ${typeDisplayName || ''} resorts in ${destinationDisplayName}`;
      if (type === 'family-friendly') {
        aiQuery += ' with kids clubs, family suites, and activities for children';
      } else if (type === 'adults-only') {
        aiQuery += ' with spa facilities, fine dining, and peaceful atmosphere';
      }
      
      // Trigger the AI search automatically with destination override
      handleAISearch(aiQuery, true, destination); // Pass destination directly to fix timing issue
    }
    
    // Handle legacy parameters from wizard
    const city = urlParams.get('city');
    // const region = urlParams.get('region');
    const checkin = urlParams.get('checkin');
    const checkout = urlParams.get('checkout');
    const guests = urlParams.get('guests');
    const budget = urlParams.get('budget');

    if (city && !destination) {
      const cityDisplayName = city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      let query = `Show me all-inclusive resorts in ${cityDisplayName}`;
      
      if (budget && budget !== 'mid-range') {
        query += ` with ${budget} pricing`;
      }
      
      if (checkin && checkout) {
        query += ` from ${checkin} to ${checkout}`;
      }
      
      if (guests && guests !== '2') {
        query += ` for ${guests} guests`;
      }

      console.log('Auto-searching resorts from wizard:', query);
      handleAISearch(query, true);
    }
  }, [location.search]);

  // Use the hotels loaded via the hook to populate resorts list and fall back to sample data when empty
  useEffect(() => {
    if (hotels && hotels.length > 0) {
      setResorts(hotels.filter(h => (h.type || '').toLowerCase().includes('resort')));
    } else {
      const urlParams = new URLSearchParams(location.search);
      const dest = urlParams.get('destination') || 'riviera-maya';
      const { resorts: sampleResorts, restaurants: sampleRestaurants, activities: sampleActivities } = getSampleResortData(dest, '');
      setResorts(sampleResorts);
      setRestaurants(sampleRestaurants);
      setActivities(sampleActivities);
    }
    setInitialLoading(false);
  }, [hotels, location.search]);

  // AI search handler
  const handleAISearch = async (query, isAutoSearch = false, destinationOverride = null) => {
    try {
      setLoading(true);
      
      if (!isAutoSearch) {
        // Only show immediate message for manual searches
        setAiResponse('Let me find the perfect resorts for you...');
      }
      
      // Use consistent API endpoint with ChatInterface
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const response = await fetch(`${base}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          sessionId: `resort-search-${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update the results with AI response
      if (data.hotels && data.hotels.length > 0) {
        console.log('Debug - AI returned hotels:', data.hotels.map(h => ({ name: h.name, location: h.location || h.city })));
        
        // Use destinationOverride if provided, otherwise use selectedDestination
        const filterDestination = destinationOverride || selectedDestination;
        console.log('Debug - Current selectedDestination:', selectedDestination);
        console.log('Debug - Using filterDestination:', filterDestination);
        
        // Filter hotels to only include those in the selected destination
        let filteredHotels = data.hotels;
        if (filterDestination) {
          console.log('Debug - Starting location filtering...');
          filteredHotels = data.hotels.filter(hotel => {
            const location = (hotel.location || hotel.city || '').toLowerCase();
            const destination = filterDestination.toLowerCase();
            
            console.log('Debug - Checking hotel:', hotel.name, 'Location:', location, 'Against destination:', destination);
            
            // Define location keywords for each destination with more precise matching
            const locationKeywords = {
              'cancun': ['cancun', 'cancún', 'hotel zone', 'playa mujeres'],
              'riviera-maya': ['riviera maya', 'playa del carmen', 'mayakoba', 'puerto morelos', 'maroma'],
              'tulum': ['tulum'],
              'los-cabos': ['los cabos', 'cabo san lucas', 'san jose del cabo'],
              'puerto-vallarta': ['puerto vallarta', 'vallarta', 'punta mita'],
              'playa-del-carmen': ['playa del carmen']
            };
            
            const keywords = locationKeywords[destination] || [destination.replace(/-/g, ' ')];
            console.log('Debug - Keywords for destination:', keywords);
            
            // Simplified matching logic - just check if any keyword is in the location
            const matches = keywords.some(keyword => location.includes(keyword));
            console.log('Debug - Hotel matches destination?', matches, 'for hotel:', hotel.name);
            return matches;
          });
          
          console.log('Debug - Filtered hotels by destination:', filteredHotels.map(h => ({ name: h.name, location: h.location || h.city })));
          console.log(`Debug - Hotels before filtering: ${data.hotels.length}, after filtering: ${filteredHotels.length}`);
        } else {
          console.log('Debug - No filterDestination, skipping location filtering');
        }
        
        setResorts(filteredHotels);
        setHotels(filteredHotels); // For compatibility
      }
      
      if (data.restaurants && data.restaurants.length > 0) {
        setRestaurants(data.restaurants);
      }
      
      if (data.activities && data.activities.length > 0) {
        setActivities(data.activities);
      }
      
      // Store session data for the chat interface
      if (data.sessionData) {
        setSessionData(data.sessionData);
      }
      
      console.log('AI search successful:', {
        hotels: data.hotels?.length || 0,
        restaurants: data.restaurants?.length || 0,
        activities: data.activities?.length || 0
      });
      
    } catch (error) {
      console.error('Error with AI search:', error);
      
      // Always show sample data as fallback
      const sampleData = getSampleResortData(destinationOverride || selectedDestination, selectedType);
      setResorts(sampleData.resorts);
      setRestaurants(sampleData.restaurants);
      setActivities(sampleData.activities);
      setHotels(sampleData.resorts);
      
      // Set a helpful AI response for the fallback
      const destinationName = getDestinationDisplayName(destinationOverride || selectedDestination);
      const typeName = getTypeDisplayName(selectedType);
      setAiResponse(`Welcome to ${destinationName}! I've found ${sampleData.resorts.length} ${typeName || 'luxury'} resorts for you. Each property offers unique experiences - from beachfront luxury to cultural immersion. Click on any resort card to view details and book directly.`);
      
      console.log('Using fallback sample data:', {
        resorts: sampleData.resorts.length,
        restaurants: sampleData.restaurants.length,
        activities: sampleData.activities.length
      });
      
    } finally {
      setLoading(false);
      setInitialLoading(false); // Hide initial loading screen when done
      
      // Ensure we stay at the top of the page when loading completes
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  // Get destination display name
  const getDestinationDisplayName = (dest) => {
    const names = {
      'riviera-maya': 'Riviera Maya',
      'los-cabos': 'Los Cabos',
      'puerto-vallarta': 'Puerto Vallarta', 
      'tulum': 'Tulum',
      'cancun': 'Cancún',
      'playa-del-carmen': 'Playa del Carmen'
    };
    return names[dest] || dest.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get type display name
  const getTypeDisplayName = (type) => {
    const types = {
      'luxury': 'Ultra-Luxury',
      'family': 'Family-Friendly',
      'adults-only': 'Adults-Only',
      'eco-luxury': 'Eco-Luxury'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Tropical Loading Screen */}
      <AnimatePresence>
        {initialLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-blue-900 via-teal-800 to-green-900 z-50 flex items-center justify-center"
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Floating Palm Trees */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute top-20 left-20"
              >
                <Palmtree className="w-16 h-16 text-green-400 opacity-20" />
              </motion.div>
              
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, -3, 3, 0]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute top-40 right-32"
              >
                <Palmtree className="w-12 h-12 text-green-300 opacity-15" />
              </motion.div>

              {/* Floating Waves */}
              <motion.div
                animate={{ 
                  x: [0, 30, 0],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute bottom-20 left-40"
              >
                <Waves className="w-20 h-20 text-blue-400 opacity-20" />
              </motion.div>

              <motion.div
                animate={{ 
                  x: [0, -25, 0],
                  opacity: [0.15, 0.35, 0.15]
                }}
                transition={{ 
                  duration: 7, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 2
                }}
                className="absolute bottom-32 right-20"
              >
                <Waves className="w-16 h-16 text-cyan-400 opacity-25" />
              </motion.div>

              {/* Sun */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute top-16 right-16"
              >
                <Sun className="w-24 h-24 text-yellow-400 opacity-30" />
              </motion.div>
            </div>

            {/* Main Loading Content */}
            <div className="text-center z-10 px-6">
              {/* Animated Resort Icon */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="mb-8"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Palmtree className="w-16 h-16 text-black" />
                </div>
              </motion.div>

              {/* Loading Text */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl md:text-6xl font-thin mb-6 text-white"
              >
                Finding Your Perfect Resort
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-xl md:text-2xl text-cyan-200 font-light mb-8"
              >
                We're on island time... ⏰ 🏝️
              </motion.p>

              {/* Loading Messages */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="space-y-3 mb-8"
              >
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-gray-300 text-lg"
                >
                  Curating luxury experiences just for you...
                </motion.p>
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                  className="text-gray-400"
                >
                  Searching pristine beaches and world-class amenities
                </motion.p>
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
                  className="text-gray-500"
                >
                  Almost ready to show you paradise...
                </motion.p>
              </motion.div>

              {/* Animated Loading Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="w-full max-w-md mx-auto"
              >
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    animate={{ 
                      x: ['-100%', '100%'],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-600 rounded-full"
                    style={{ width: '50%' }}
                  />
                </div>
                <p className="text-center text-gray-400 text-sm mt-3">
                  Patience is a virtue... especially in paradise 🌺
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Only show when not loading */}
      {!initialLoading && (
        <>
          {/* Elegant Navigation */}
          <nav className="bg-black/95 backdrop-blur-sm border-b border-amber-400/20 sticky top-0 z-40">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-300">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-light">Back to Home</span>
                </Link>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <Sun className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xl font-light tracking-wide text-white">{siteSettings && siteSettings.siteTitle ? siteSettings.siteTitle : null}</span>
                  </div>
                  
                  {selectedDestination && (
                    <div className="flex items-center space-x-3 text-sm text-gray-400 border-l border-gray-700 pl-4">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-light">{getDestinationDisplayName(selectedDestination)}</span>
                      {selectedType && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-amber-400">{getTypeDisplayName(selectedType)}</span>
                        </>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>AI-Assisted</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <main className="container mx-auto px-6 py-12 max-w-7xl">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-thin mb-6 leading-tight"
              >
                {selectedDestination 
                  ? <>
                      <span className="text-white">{getTypeDisplayName(selectedType) || 'Luxury'} Resorts in</span>
                      <span className="block font-light bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
                        {getDestinationDisplayName(selectedDestination)}
                      </span>
                    </>
                  : 'Discover Paradise in Mexico'
                }
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-400 font-light max-w-4xl mx-auto mb-8 leading-relaxed"
              >
                {selectedDestination
                  ? `Explore ${resorts.length} carefully curated resort experiences in ${getDestinationDisplayName(selectedDestination)}. From pristine beaches to cultural treasures, discover your perfect luxury escape.`
                  : 'Handpicked luxury resorts offering the finest Mexican hospitality and world-class amenities.'
                }
              </motion.p>
              
              {/* Elegant Stats */}
              {selectedDestination && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap justify-center items-center gap-12 text-sm font-light tracking-wide"
                >
                  <div className="text-center">
                    <div className="text-2xl font-thin text-amber-400 mb-1">{resorts.length}</div>
                    <div className="text-gray-500">Luxury Resorts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-thin text-amber-400 mb-1">{restaurants.length}</div>
                    <div className="text-gray-500">Fine Restaurants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-thin text-amber-400 mb-1">{activities.length}</div>
                    <div className="text-gray-500">Exclusive Experiences</div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Resort Results */}
            {resorts.length > 0 && (
              <div className="mb-16">
                <ResortGrid 
                  resorts={resorts} 
                  title=""
                  showFilters={true}
                />
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Interactive Map */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                  <h2 className="text-2xl font-light text-white mb-2">Explore the Area</h2>
                  <p className="text-gray-400 text-sm">
                    Interactive map showing resorts, restaurants, and activities in {getDestinationDisplayName(selectedDestination)}
                  </p>
                </div>
                <div className="p-6">
                  <GoogleMap 
                    hotels={resorts || []} 
                    restaurants={restaurants || []}
                    activities={activities || []}
                  />
                  <div className="flex items-center gap-6 mt-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Resorts ({resorts.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Restaurants ({restaurants.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Activities ({activities.length})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Assistant */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black p-2 rounded-full">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-light text-white">Resort Expert Assistant</h3>
                        <p className="text-sm text-gray-400">Personalized recommendations for {getDestinationDisplayName(selectedDestination)}</p>
                      </div>
                    </div>
                    <div className="text-sm text-amber-400 font-light">AI-Powered</div>
                  </div>
                </div>

                <div className="p-6 flex flex-col min-h-[400px]">
                  <ChatInterface
                    hotels={hotels}
                    setHotels={setHotels}
                    loading={loading}
                    setLoading={setLoading}
                    aiResponse={aiResponse}
                    setAiResponse={setAiResponse}
                    onSessionDataUpdate={setSessionData}
                    searchType="resorts"
                  />
                </div>
              </div>
            </div>

            {/* Categorized Results - Only show if user has interacted with chat */}
            {sessionData && sessionData.fromChatInteraction && (
              <div className="mb-16">
                <CategorizedResults sessionData={sessionData} searchType="resorts" />
              </div>
            )}

            {/* Experience Categories */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12">
              <h2 className="text-3xl font-light text-center mb-12 text-white">
                Discover More in {getDestinationDisplayName(selectedDestination)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-amber-400/30 transition-all duration-300">
                  <Star className="w-12 h-12 text-amber-400 mx-auto mb-6" />
                  <h3 className="text-xl font-light mb-4 text-white">Fine Dining</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Discover world-class restaurants and authentic local cuisine experiences
                  </p>
                  <button className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                    Explore Restaurants
                  </button>
                </div>
                
                <div className="text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-amber-400/30 transition-all duration-300">
                  <Waves className="w-12 h-12 text-blue-400 mx-auto mb-6" />
                  <h3 className="text-xl font-light mb-4 text-white">Water Adventures</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Snorkeling, diving, and exclusive beach experiences in crystal-clear waters
                  </p>
                  <button className="bg-gradient-to-r from-blue-400 to-cyan-500 text-black px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                    Book Adventures
                  </button>
                </div>
                
                <div className="text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-amber-400/30 transition-all duration-300">
                  <Palmtree className="w-12 h-12 text-green-400 mx-auto mb-6" />
                  <h3 className="text-xl font-light mb-4 text-white">Cultural Experiences</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Ancient ruins, traditional ceremonies, and authentic Mexican culture
                  </p>
                  <button className="bg-gradient-to-r from-green-400 to-emerald-500 text-black px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                    Discover Culture
                  </button>
                </div>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}

export default ResortSearchPage;