import express from 'express';
import ragService from '../services/rag.service.js';
import tripAdvisorService from '../services/tripadvisor.service.js';

const router = express.Router();

// Search hotels using both vector similarity and TripAdvisor
router.post('/', async (req, res) => {
  try {
    const { query, limit = 5, useRealData = true } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    console.log('Processing search query:', query);
    
    // Extract destination from query if possible
    const destinations = ['Cancun', 'Playa del Carmen', 'Tulum', 'Cabo San Lucas', 
                         'Puerto Vallarta', 'Mexico City', 'Cozumel', 'Riviera Maya', 
                         'Guadalajara', 'Oaxaca'];
    
    let destination = null;
    for (const dest of destinations) {
      if (query.toLowerCase().includes(dest.toLowerCase())) {
        destination = dest;
        break;
      }
    }
    
    let results = [];
    
    // Try to get real data from TripAdvisor if a destination is identified
    if (useRealData && destination) {
      try {
        console.log(`Searching TripAdvisor for hotels in ${destination}...`);
        const tripAdvisorResults = await tripAdvisorService.searchMexicoHotels(
          destination, 
          { limit: limit }
        );
        
        if (tripAdvisorResults.length > 0) {
          results = tripAdvisorResults;
        }
      } catch (error) {
        console.error('TripAdvisor search failed:', error);
      }
    }
    
    // If no TripAdvisor results, fall back to RAG service
    if (results.length === 0) {
      console.log('Using RAG service for search...');
      const ragResults = await ragService.searchHotels(query, limit);
      results = ragResults;
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error searching hotels:', error);
    res.status(500).json({ 
      error: 'Failed to search hotels',
      message: error.message 
    });
  }
});

// Get popular searches - enhanced with real destinations
router.get('/popular', async (req, res) => {
  try {
    // Try to get popular destinations from TripAdvisor
    let popularSearches = [];
    
    try {
      const destinations = await tripAdvisorService.getPopularMexicoDestinations();
      if (destinations && destinations.length > 0) {
        // Convert destinations to search queries
        popularSearches = destinations.slice(0, 8).map(dest => {
          const templates = [
            `Beach resorts in ${dest.name}`,
            `Family hotels in ${dest.name}`,
            `Luxury hotels in ${dest.name}`,
            `All-inclusive resorts in ${dest.name}`,
            `Boutique hotels in ${dest.name}`,
            `Budget hotels in ${dest.name}`
          ];
          return templates[Math.floor(Math.random() * templates.length)];
        });
      }
    } catch (error) {
      console.error('Error fetching from TripAdvisor:', error);
    }
    
    // Fallback to static popular searches if TripAdvisor fails
    if (popularSearches.length === 0) {
      popularSearches = [
        'Beach resorts in Cancun',
        'Family hotels in Playa del Carmen',
        'Luxury hotels in Cabo San Lucas',
        'Budget hotels in Mexico City',
        'All-inclusive resorts in Riviera Maya',
        'Boutique hotels in Tulum',
        'Hotels near Chichen Itza',
        'Romantic getaways in Puerto Vallarta'
      ];
    }
    
    res.json(popularSearches);
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    res.status(500).json({ error: 'Failed to fetch popular searches' });
  }
});

// Get search suggestions (autocomplete) - enhanced with real data
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    let suggestions = [];
    
    // Try to get suggestions from TripAdvisor
    if (q.length >= 3) {
      try {
        const searchResults = await tripAdvisorService.searchLocation(q, 'hotels');
        if (searchResults && searchResults.data) {
          suggestions = searchResults.data.slice(0, 5).map(result => result.name);
        }
      } catch (error) {
        console.error('TripAdvisor suggestions failed:', error);
      }
    }
    
    // Fallback to static suggestions if TripAdvisor fails or returns nothing
    if (suggestions.length === 0) {
      const staticSuggestions = [
        'Cancun beach hotels',
        'Playa del Carmen resorts',
        'Tulum boutique hotels',
        'Mexico City business hotels',
        'Cabo San Lucas luxury resorts',
        'Puerto Vallarta family hotels',
        'Cozumel diving resorts',
        'Guadalajara downtown hotels',
        'Oaxaca cultural hotels',
        'Riviera Maya all-inclusive',
        'Isla Mujeres beach hotels',
        'Merida colonial hotels',
        'San Miguel de Allende boutique',
        'Zihuatanejo beach resorts'
      ].filter(s => s.toLowerCase().includes(q.toLowerCase()));
      
      suggestions = staticSuggestions;
    }
    
    res.json(suggestions.slice(0, 8));
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Search hotels by specific destination (TripAdvisor powered)
router.get('/destination/:destination', async (req, res) => {
  try {
    const { destination } = req.params;
    const { limit = 10 } = req.query;
    
    console.log(`Searching for hotels in ${destination}...`);
    
    const hotels = await tripAdvisorService.searchMexicoHotels(destination, { 
      limit: parseInt(limit) 
    });
    
    if (hotels.length === 0) {
      // Fallback to RAG search
      const ragResults = await ragService.searchHotels(
        `hotels in ${destination}`, 
        parseInt(limit)
      );
      return res.json(ragResults);
    }
    
    res.json(hotels);
  } catch (error) {
    console.error('Error searching by destination:', error);
    res.status(500).json({ 
      error: 'Failed to search destination',
      message: error.message 
    });
  }
});

// Advanced search with filters
router.post('/advanced', async (req, res) => {
  try {
    const { 
      destination,
      checkIn,
      checkOut,
      guests,
      priceRange,
      minRating,
      amenities,
      hotelType
    } = req.body;
    
    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }
    
    // Search using TripAdvisor
    const hotels = await tripAdvisorService.searchMexicoHotels(destination, { limit: 20 });
    
    // Apply filters
    let filtered = hotels;
    
    if (minRating) {
      filtered = filtered.filter(h => h.rating >= minRating);
    }
    
    if (priceRange) {
      filtered = filtered.filter(h => {
        const priceLevel = h.priceLevel || '$';
        const priceLevels = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
        const hotelPriceNum = priceLevels[priceLevel] || 1;
        
        if (priceRange === 'budget') return hotelPriceNum <= 2;
        if (priceRange === 'mid') return hotelPriceNum === 2 || hotelPriceNum === 3;
        if (priceRange === 'luxury') return hotelPriceNum >= 3;
        return true;
      });
    }
    
    if (amenities && amenities.length > 0) {
      filtered = filtered.filter(hotel => {
        const hotelAmenities = hotel.amenities || [];
        return amenities.some(amenity => 
          hotelAmenities.some(ha => 
            ha.toLowerCase().includes(amenity.toLowerCase())
          )
        );
      });
    }
    
    if (hotelType) {
      filtered = filtered.filter(h => 
        h.category?.toLowerCase().includes(hotelType.toLowerCase())
      );
    }
    
    // Add check-in/check-out dates to response (for frontend display)
    const response = {
      hotels: filtered,
      searchCriteria: {
        destination,
        checkIn,
        checkOut,
        guests,
        totalResults: filtered.length
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({ 
      error: 'Advanced search failed',
      message: error.message 
    });
  }
});

export default router;
