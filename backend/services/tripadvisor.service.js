import axios from 'axios';
import dotenv from 'dotenv';
import { RateLimiter, retryWithBackoff } from '../utils/rateLimiter.js';

dotenv.config();

class TripAdvisorService {
  constructor() {
    this.apiKey = process.env.TRIP_ADVISOR_API;
    this.baseUrl = 'https://api.content.tripadvisor.com/api/v1';
    
    // Initialize rate limiter - 3 requests per second
    this.rateLimiter = new RateLimiter(3, 1000);
    
    if (!this.apiKey) {
      console.warn('TripAdvisor API key not found in environment variables');
    }
  }

  /**
   * Search for locations (hotels, attractions, restaurants) in a destination
   */
  async searchLocation(query, category = 'hotels') {
    return retryWithBackoff(async () => {
      const response = await this.rateLimiter.add(() => 
        axios.get(`${this.baseUrl}/location/search`, {
          params: {
            key: this.apiKey,
            searchQuery: query,
            category: category,
            language: 'en'
          }
        })
      );
      
      return response.data;
    });
  }

  /**
   * Get detailed information about a specific location
   */
  async getLocationDetails(locationId) {
    return retryWithBackoff(async () => {
      const response = await this.rateLimiter.add(() =>
        axios.get(`${this.baseUrl}/location/${locationId}/details`, {
          params: {
            key: this.apiKey,
            language: 'en',
            currency: 'USD'
          }
        })
      );
      
      return response.data;
    });
  }

  /**
   * Get photos for a specific location
   */
  async getLocationPhotos(locationId, limit = 5) {
    return retryWithBackoff(async () => {
      const response = await this.rateLimiter.add(() =>
        axios.get(`${this.baseUrl}/location/${locationId}/photos`, {
          params: {
            key: this.apiKey,
            language: 'en',
            limit: limit
          }
        })
      );
      
      return response.data;
    }).catch(error => {
      console.error('Error getting location photos:', error.response?.data || error.message);
      // Return empty data instead of throwing to allow partial results
      return { data: [] };
    });
  }

  /**
   * Get reviews for a specific location
   */
  async getLocationReviews(locationId, limit = 5) {
    return retryWithBackoff(async () => {
      const response = await this.rateLimiter.add(() =>
        axios.get(`${this.baseUrl}/location/${locationId}/reviews`, {
          params: {
            key: this.apiKey,
            language: 'en',
            limit: limit
          }
        })
      );
      
      return response.data;
    }).catch(error => {
      console.error('Error getting location reviews:', error.response?.data || error.message);
      // Return empty data instead of throwing to allow partial results
      return { data: [] };
    });
  }

  /**
   * Search for hotels in Mexico with specific criteria
   */
  async searchMexicoHotels(destination, options = {}) {
    try {
      const searchQuery = `hotels in ${destination}, Mexico`;
      const searchResults = await this.searchLocation(searchQuery, 'hotels');
      
      if (!searchResults || !searchResults.data) {
        return [];
      }

      // Process hotels with limited parallel requests to avoid overwhelming the API
      const hotels = [];
      const hotelList = searchResults.data.slice(0, options.limit || 5); // Reduced limit for faster response
      
      // Process hotels in batches of 2 to balance speed and API limits
      const batchSize = 2;
      for (let i = 0; i < hotelList.length; i += batchSize) {
        const batch = hotelList.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (hotel) => {
          try {
            // Fetch only essential data - skip photos and reviews for speed
            const details = await this.getLocationDetails(hotel.location_id);
            
            const formattedHotel = this.formatHotelData(hotel, details, null, null);
            return formattedHotel;
          } catch (error) {
            console.error(`Error fetching details for hotel ${hotel.name}:`, error.message);
            // Still add the hotel with basic info if details fail
            return this.formatHotelData(hotel);
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        hotels.push(...batchResults.filter(hotel => hotel !== null));
      }

      return hotels;
    } catch (error) {
      console.error('Error searching Mexico hotels:', error);
      throw error;
    }
  }

  /**
   * Format hotel data for consistent response
   */
  formatHotelData(basicInfo, details = null, photos = null, reviews = null) {
    try {
      // Array of diverse hotel images for variety
      const hotelImages = [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945', // Luxury pool resort
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9', // Beach resort
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', // Boutique hotel
        'https://images.unsplash.com/photo-1582719508461-905c673771fd', // Modern resort
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa', // Ocean view hotel
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791', // Tropical resort
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb', // City hotel
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d', // Hotel exterior
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7', // Beach hotel
        'https://images.unsplash.com/photo-1549294413-26f195200c16'  // Resort pool
      ];

      // Get a random image from the array for variety
      const randomImage = hotelImages[Math.floor(Math.random() * hotelImages.length)];
      
      // Extract image URL from photos if available
      let imageUrl = randomImage;
      if (photos && photos.data && photos.data.length > 0) {
        const firstPhoto = photos.data[0];
        if (firstPhoto.images?.large?.url) {
          imageUrl = firstPhoto.images.large.url;
        } else if (firstPhoto.images?.medium?.url) {
          imageUrl = firstPhoto.images.medium.url;
        } else if (firstPhoto.images?.small?.url) {
          imageUrl = firstPhoto.images.small.url;
        }
      }

      // Ensure rating is valid
      let rating = parseFloat(basicInfo.rating) || 0;
      if (rating === 0) {
        // Generate a reasonable random rating between 3.5 and 4.9 if missing
        rating = parseFloat((3.5 + Math.random() * 1.4).toFixed(1));
      }

      // Determine price range
      let priceRange = basicInfo.price_level || '$$$';
      if (details && details.price) {
        priceRange = details.price;
      }

      // Extract amenities
      let amenities = [];
      if (details && details.amenities && Array.isArray(details.amenities)) {
        amenities = details.amenities;
      } else {
        // Default amenities if none provided
        amenities = ['WiFi', 'Pool', 'Restaurant', 'Bar', 'Room Service'];
      }

      const formatted = {
        id: basicInfo.location_id || `hotel-${Date.now()}-${Math.random()}`,
        name: basicInfo.name || 'Unknown Hotel',
        location: {
          city: basicInfo.address_obj?.city || 'Unknown',
          state: basicInfo.address_obj?.state || 'Mexico',
          country: 'Mexico',
          address: basicInfo.address_obj?.address_string || '',
          latitude: parseFloat(basicInfo.latitude) || 0,
          longitude: parseFloat(basicInfo.longitude) || 0
        },
        city: basicInfo.address_obj?.city || 'Unknown',
        state: basicInfo.address_obj?.state || 'Mexico',
        rating: rating,
        reviewCount: parseInt(basicInfo.num_reviews) || Math.floor(Math.random() * 500) + 100,
        priceLevel: priceRange,
        priceRange: priceRange,
        category: 'Hotel',
        type: 'Hotel',
        amenities: amenities,
        images: [],
        reviews: [],
        description: details?.description || basicInfo.description || `Beautiful hotel in Mexico with excellent amenities and service.`,
        bookingUrl: `https://www.tripadvisor.com/Hotel_Review-g${basicInfo.location_id}.html`,
        affiliateLink: `https://www.tripadvisor.com/Hotel_Review-g${basicInfo.location_id}.html`,
        imageUrl: imageUrl,
        nearbyAttractions: []
      };

      // Add additional details if available
      if (details) {
        formatted.website = details.website || '';
        formatted.phone = details.phone || '';
        formatted.email = details.email || '';
        formatted.rankingData = details.ranking_data || null;
      }

      // Add all photos if available
      if (photos && photos.data) {
        formatted.images = photos.data.map(photo => ({
          url: photo.images?.large?.url || photo.images?.medium?.url || photo.images?.small?.url || '',
          caption: photo.caption || ''
        }));
      }

      // Add reviews if available
      if (reviews && reviews.data) {
        formatted.reviews = reviews.data.map(review => ({
          id: review.id,
          rating: review.rating,
          title: review.title || '',
          text: review.text || '',
          publishedDate: review.published_date || '',
          author: review.user?.username || 'Anonymous'
        }));
      }

      return formatted;
    } catch (error) {
      console.error('Error formatting hotel data:', error);
      return null;
    }
  }

  /**
   * Get popular destinations in Mexico
   */
  async getPopularMexicoDestinations() {
    const popularDestinations = [
      'Cancun',
      'Playa del Carmen',
      'Tulum',
      'Cabo San Lucas',
      'Puerto Vallarta',
      'Mexico City',
      'Cozumel',
      'Riviera Maya',
      'Guadalajara',
      'Oaxaca'
    ];

    try {
      const destinations = [];
      
      // Process destinations sequentially to avoid rate limiting
      for (const destination of popularDestinations) {
        try {
          const results = await this.searchLocation(`${destination}, Mexico`, 'geos');
          if (results && results.data && results.data.length > 0) {
            destinations.push({
              name: destination,
              locationId: results.data[0].location_id,
              description: results.data[0].description || ''
            });
          }
        } catch (error) {
          console.error(`Error getting destination ${destination}:`, error.message);
          destinations.push({ name: destination, locationId: null, description: '' });
        }
      }
      
      return destinations;
    } catch (error) {
      console.error('Error getting popular destinations:', error);
      return popularDestinations.map(name => ({ name, locationId: null, description: '' }));
    }
  }
}

export default new TripAdvisorService();
