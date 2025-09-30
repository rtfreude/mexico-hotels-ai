import express from 'express';
import ragService from '../services/rag.service.js';
import sampleHotels from '../data/sample-hotels.js';
import tripAdvisorService from '../services/tripadvisor.service.js';

const router = express.Router();

// Get all hotels (now fetches from TripAdvisor for popular destinations)
router.get('/', async (req, res) => {
  try {
    const { destination = 'Cancun', useCache = false } = req.query;
    
    // If useCache is true, return sample data (for development/testing)
    if (useCache === 'true') {
      return res.json(sampleHotels);
    }
    
    // Fetch real data from TripAdvisor
    const hotels = await tripAdvisorService.searchMexicoHotels(destination, { limit: 12 });
    
    if (hotels.length === 0) {
      // Fallback to sample data if TripAdvisor fails
      console.log('No hotels found from TripAdvisor, using sample data');
      return res.json(sampleHotels);
    }
    
    res.json(hotels);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    // Fallback to sample data on error
    res.json(sampleHotels);
  }
});

// Search hotels by destination using TripAdvisor
router.get('/search/:destination', async (req, res) => {
  try {
    const { destination } = req.params;
    const { limit = 10 } = req.query;
    
    console.log(`Searching hotels in ${destination}...`);
    const hotels = await tripAdvisorService.searchMexicoHotels(destination, { 
      limit: parseInt(limit) 
    });
    
    if (hotels.length === 0) {
      return res.status(404).json({ 
        error: 'No hotels found',
        message: `Could not find hotels in ${destination}. Try a different destination.`
      });
    }
    
    res.json(hotels);
  } catch (error) {
    console.error('Error searching hotels:', error);
    res.status(500).json({ 
      error: 'Failed to search hotels',
      message: error.message 
    });
  }
});

// Get hotel by ID (TripAdvisor location ID)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First try to get from TripAdvisor
    if (id.startsWith('g') || !isNaN(id)) {
      try {
        const details = await tripAdvisorService.getLocationDetails(id);
        const photos = await tripAdvisorService.getLocationPhotos(id, 5);
        const reviews = await tripAdvisorService.getLocationReviews(id, 5);
        
        const hotel = tripAdvisorService.formatHotelData(
          { location_id: id, ...details },
          details,
          photos,
          reviews
        );
        
        return res.json(hotel);
      } catch (error) {
        console.error('Error fetching from TripAdvisor:', error);
      }
    }
    
    // Fallback to sample data
    const hotel = sampleHotels.find(h => h.id === id);
    
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    res.json(hotel);
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
});

// Get popular Mexico destinations
router.get('/destinations/popular', async (req, res) => {
  try {
    const destinations = await tripAdvisorService.getPopularMexicoDestinations();
    res.json(destinations);
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    
    // Fallback to static list
    const fallbackDestinations = [
      { name: 'Cancun', description: 'Beautiful beaches and vibrant nightlife' },
      { name: 'Playa del Carmen', description: 'Trendy beach town with European flair' },
      { name: 'Tulum', description: 'Bohemian beach paradise with ancient ruins' },
      { name: 'Cabo San Lucas', description: 'Luxury resorts and water sports' },
      { name: 'Puerto Vallarta', description: 'Traditional Mexican charm meets beach resort' },
      { name: 'Mexico City', description: 'Historic capital with world-class museums' },
      { name: 'Cozumel', description: 'Diving paradise with coral reefs' },
      { name: 'Riviera Maya', description: 'Stretch of Caribbean coastline with all-inclusive resorts' }
    ];
    
    res.json(fallbackDestinations);
  }
});

// Initialize/seed hotel data in vector database
router.post('/seed', async (req, res) => {
  try {
    const { destination = 'Cancun', limit = 20, useSampleData = false } = req.body;
    
    console.log(`Seeding hotel data for ${destination} to vector database...`);
    
    // Force use of sample data if requested, or if TripAdvisor fails
    if (useSampleData) {
      console.log('Using sample data for seeding...');
      await ragService.storeHotelData(sampleHotels);
      
      return res.json({ 
        message: 'Seeded with sample data (forced)',
        count: sampleHotels.length 
      });
    }
    
    // Try TripAdvisor first
    let hotels = [];
    try {
      hotels = await tripAdvisorService.searchMexicoHotels(destination, { limit });
    } catch (error) {
      console.log('TripAdvisor failed, using sample data:', error.message);
      hotels = [];
    }
    
    if (hotels.length > 0) {
      // Store TripAdvisor data in vector database
      await ragService.storeHotelData(hotels);
      
      res.json({ 
        message: 'Hotel data seeded successfully from TripAdvisor',
        destination: destination,
        count: hotels.length 
      });
    } else {
      // Fallback to sample data (which includes all our new Cancun adults-only resorts)
      console.log('No TripAdvisor data found, using sample data...');
      await ragService.storeHotelData(sampleHotels);
      
      res.json({ 
        message: 'Seeded with sample data (TripAdvisor unavailable)',
        count: sampleHotels.length 
      });
    }
  } catch (error) {
    console.error('Error seeding hotel data:', error);
    res.status(500).json({ 
      error: 'Failed to seed hotel data',
      message: error.message 
    });
  }
});

// Filter hotels by criteria (works with both TripAdvisor and sample data)
router.post('/filter', async (req, res) => {
  try {
    const { 
      destination,
      city, 
      priceRange, 
      type, 
      minRating,
      amenities,
      useRealData = true 
    } = req.body;
    
    let hotels = [];
    
    // Fetch hotels based on data source preference
    if (useRealData && destination) {
      try {
        hotels = await tripAdvisorService.searchMexicoHotels(destination, { limit: 20 });
      } catch (error) {
        console.error('TripAdvisor error, using sample data:', error);
        hotels = sampleHotels;
      }
    } else {
      hotels = sampleHotels;
    }
    
    // Apply filters
    let filtered = [...hotels];
    
    if (city) {
      filtered = filtered.filter(h => 
        h.location?.city?.toLowerCase().includes(city.toLowerCase()) ||
        h.city?.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    if (priceRange) {
      filtered = filtered.filter(h => {
        const hotelPrice = h.priceLevel || h.priceRange;
        if (typeof priceRange === 'string') {
          return hotelPrice === priceRange;
        }
        // Handle numeric price ranges if needed
        return true;
      });
    }
    
    if (type) {
      filtered = filtered.filter(h => 
        h.type?.toLowerCase() === type.toLowerCase() ||
        h.category?.toLowerCase() === type.toLowerCase()
      );
    }
    
    if (minRating) {
      filtered = filtered.filter(h => h.rating >= minRating);
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
    
    res.json(filtered);
  } catch (error) {
    console.error('Error filtering hotels:', error);
    res.status(500).json({ error: 'Failed to filter hotels' });
  }
});

// Get hotel photos
router.get('/:id/photos', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;
    
    const photos = await tripAdvisorService.getLocationPhotos(id, parseInt(limit));
    res.json(photos);
  } catch (error) {
    console.error('Error fetching hotel photos:', error);
    res.status(500).json({ 
      error: 'Failed to fetch photos',
      message: error.message 
    });
  }
});

// Get hotel reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;
    
    const reviews = await tripAdvisorService.getLocationReviews(id, parseInt(limit));
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching hotel reviews:', error);
    res.status(500).json({ 
      error: 'Failed to fetch reviews',
      message: error.message 
    });
  }
});

export default router;
