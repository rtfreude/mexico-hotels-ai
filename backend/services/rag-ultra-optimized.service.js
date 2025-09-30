import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import tripAdvisorService from './tripadvisor.service.js';
import enhancedCache from './enhanced-cache.service.js';
import locationContext from './location-context.service.js';
import performanceMonitor from '../utils/performance.js';
import responseOrganizerService from './response-organizer.service.js';

dotenv.config();

let openai = null;
function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is missing');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

class UltraOptimizedRAGService {
  constructor() {
    this.indexName = process.env.PINECONE_INDEX_NAME || 'mexico-hotels';
    this.index = null;
    this.conversationHistory = new Map();
    
    // Session-based result accumulation
    this.sessionResults = new Map(); // sessionId -> { hotels: [], restaurants: [], activities: [] }
    
    // Pre-computed instant responses
    this.initializeQuickResponses();
    this.initializeIndex();
    
    console.log('✅ Ultra-optimized RAG service initialized');
  }

  async initializeIndex() {
    try {
      this.index = pinecone.index(this.indexName);
      console.log('✅ Pinecone index initialized');
    } catch (error) {
      console.error('Error initializing Pinecone index:', error);
    }
  }

  initializeQuickResponses() {
    // Cache instant responses for common greetings
    const quickResponses = {
      'hello': "Hello! I'm Maya, your personal Mexico travel assistant. I'm here to help you find the perfect hotel for your Mexican vacation. Where are you thinking of staying? Popular destinations include Cancun, Playa del Carmen, Tulum, and Puerto Vallarta!",
      'hi': "Hi there! I'm Maya, and I'd love to help you plan your Mexico trip. What kind of hotel experience are you looking for? Beach resort, boutique hotel, or something else?",
      'hey': "Hey! Welcome! I'm Maya, your Mexico hotel expert. Tell me about your dream vacation - are you looking for beaches, culture, adventure, or a mix of everything?",
      'help': "I'm here to help you find amazing hotels in Mexico! Just tell me:\n- Where you want to go (like Cancun, Tulum, etc.)\n- Your budget preferences\n- What amenities matter to you\n- When you're planning to travel\n\nI'll find the perfect matches for you!",
      'hola': "¡Hola! Welcome to your Mexico travel adventure! I'm Maya, and I'm excited to help you discover amazing hotels. What destination are you dreaming of?",
      'good morning': "Good morning! Ready to plan an amazing Mexico getaway? I'm Maya, your travel assistant. Where would you like to explore?",
      'good afternoon': "Good afternoon! Perfect time to start planning your Mexico vacation. I'm Maya - let's find you the perfect hotel!",
      'good evening': "Good evening! Let's make your Mexico travel dreams come true. I'm Maya, ready to help you find amazing accommodations!"
    };

    Object.entries(quickResponses).forEach(([key, response]) => {
      enhancedCache.setQuickResponse(key, response);
    });

    console.log('✅ Quick responses initialized and cached');
  }

  /**
   * Ultra-fast intent detection with location context awareness
   */
  detectIntent(query, sessionId = 'default') {
    const lowerQuery = query.toLowerCase().trim();
    
    // Check for instant responses first (should be <10ms)
    const quickResponse = enhancedCache.getQuickResponse(lowerQuery);
    if (quickResponse) {
      return { 
        type: 'quick', 
        response: quickResponse, 
        needsHotels: false,
        needsRestaurants: false,
        needsActivities: false,
        location: null,
        processingTime: 0
      };
    }
    
    // Extract location from query
    const detectedLocation = locationContext.extractLocation(query);
    
    // Get current location context if no location detected in query
    const contextLocation = detectedLocation || locationContext.getCurrentLocation(sessionId);
    const finalLocation = detectedLocation ? detectedLocation.normalized : (contextLocation ? contextLocation.normalized : null);
    
    // Enhanced pattern matching with context awareness
    const hotelPatterns = [
      /hotel|resort|stay|accommodation|lodging|room|booking/i,
      /where (to|should|can) (i|we) stay/i,
      /recommend|suggestion|best place/i,
      /beach|pool|spa|luxury|budget|cheap|affordable/i
    ];
    
    const restaurantPatterns = [
      /restaurant|food|dining|eat|cafe|bar|menu|cuisine/i,
      /where.*eat|good food|local food|seafood|mexican food/i,
      /breakfast|lunch|dinner|drinks|coffee/i
    ];
    
    const activityPatterns = [
      /activity|activities|tour|tours|excursion|excursions/i,
      /things to do|what.*do|sightseeing|attraction|attractions/i,
      /adventure|snorkel|dive|beach|museum|culture/i,
      /visit|see|explore|experience/i
    ];
    
    const hasHotelKeyword = hotelPatterns.some(pattern => pattern.test(lowerQuery));
    const hasRestaurantKeyword = restaurantPatterns.some(pattern => pattern.test(lowerQuery));
    const hasActivityKeyword = activityPatterns.some(pattern => pattern.test(lowerQuery));
    const hasLocation = detectedLocation !== null;
    
    // Determine what the user needs
    let needsHotels = hasHotelKeyword || (hasLocation && lowerQuery.length < 50 && !hasRestaurantKeyword && !hasActivityKeyword);
    let needsRestaurants = hasRestaurantKeyword;
    let needsActivities = hasActivityKeyword;
    
    // If no explicit location but context suggests location-based query
    if (!hasLocation && finalLocation && locationContext.needsLocationContext(query)) {
      console.log(`🎯 Using location context: ${finalLocation} for query: ${query}`);
    }
    
    // Determine primary intent type
    let intentType = 'general';
    if (needsHotels) intentType = 'hotel_search';
    else if (needsRestaurants) intentType = 'restaurant_search';
    else if (needsActivities) intentType = 'activity_search';
    
    return {
      type: intentType,
      needsHotels,
      needsRestaurants,
      needsActivities,
      location: finalLocation,
      detectedLocation,
      contextLocation: contextLocation?.normalized || null,
      query: lowerQuery,
      hasHotelKeyword,
      hasRestaurantKeyword,
      hasActivityKeyword,
      hasLocation,
      usingContext: !hasLocation && finalLocation !== null
    };
  }

  /**
   * Cached embedding generation
   */
  async generateEmbedding(text) {
    const startTime = Date.now();
    
    // Check cache first
    const cached = enhancedCache.getEmbedding(text);
    if (cached) {
      performanceMonitor.incrementCounter('embedding.cache.hit');
      return cached;
    }
    
    try {
      const response = await getOpenAI().embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      
      const embedding = response.data[0].embedding;
      enhancedCache.setEmbedding(text, embedding);
      
      performanceMonitor.incrementCounter('embedding.generated');
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Ultra-optimized hotel search with multi-level caching
   */
  async searchHotels(query, location, topK = 5) {
    const startTime = Date.now();
    
    // Check cache first
    const cached = enhancedCache.getHotelResults(location, query);
    if (cached) {
      console.log(`✅ Cache hit for hotels: ${location || 'general'}:${query}`);
      performanceMonitor.incrementCounter('hotel.search.cache.hit');
      return cached;
    }
    
    try {
      let hotels = [];
      
      // Try vector search first if index is available
      if (this.index) {
        const searchQuery = location 
          ? `${location} Mexico hotels ${query}`
          : `Mexico hotels ${query}`;
        
        const queryEmbedding = await this.generateEmbedding(searchQuery);
        
        const searchResults = await this.index.query({
          vector: queryEmbedding,
          topK: topK * 2,
          includeMetadata: true
        });
        
        if (searchResults.matches && searchResults.matches.length > 0) {
          // Filter by location if specified
          let matches = searchResults.matches;
          if (location) {
            const normalizedLocation = location.toLowerCase();
            const locationMatches = matches.filter(match => {
              const city = (match.metadata.city || '').toLowerCase();
              return city.includes(normalizedLocation) || normalizedLocation.includes(city);
            });
            matches = locationMatches.length > 0 ? locationMatches : matches;
          }
          
          hotels = this.formatSearchResults(matches.slice(0, topK));
          console.log(`✅ Vector search found ${hotels.length} hotels`);
        }
      }
      
      // Fallback to TripAdvisor only if vector search fails AND we have a location
      if (hotels.length === 0 && location) {
        console.log('🔄 Falling back to TripAdvisor...');
        hotels = await this.fetchTripAdvisorHotels(location, topK);
      }
      
      // Final fallback to default hotels
      if (hotels.length === 0) {
        hotels = this.getDefaultHotels(location, topK);
      }
      
      // Cache the results
      enhancedCache.setHotelResults(location, query, hotels);
      
      performanceMonitor.incrementCounter('hotel.search.total');
      return hotels;
    } catch (error) {
      console.error('Error searching hotels:', error);
      return this.getDefaultHotels(location, topK);
    }
  }

  /**
   * Get or initialize session results
   */
  getSessionResults(sessionId) {
    if (!this.sessionResults.has(sessionId)) {
      this.sessionResults.set(sessionId, {
        hotels: [],
        restaurants: [],
        activities: [],
        lastUpdated: Date.now()
      });
    }
    return this.sessionResults.get(sessionId);
  }

  /**
   * Update session results with new data, avoiding duplicates
   */
  updateSessionResults(sessionId, newResults) {
    const sessionData = this.getSessionResults(sessionId);
    
    // Helper function to check for duplicates
    const isDuplicate = (existingItems, newItem, compareField = 'id') => {
      return existingItems.some(existing => 
        existing[compareField] === newItem[compareField] ||
        (existing.name && newItem.name && existing.name.toLowerCase() === newItem.name.toLowerCase())
      );
    };
    
    // Add new hotels without duplicates
    if (newResults.hotels && newResults.hotels.length > 0) {
      const newHotels = newResults.hotels.filter(hotel => 
        !isDuplicate(sessionData.hotels, hotel)
      );
      sessionData.hotels = [...sessionData.hotels, ...newHotels];
      console.log(`➕ Added ${newHotels.length} new hotels to session ${sessionId}`);
    }
    
    // Add new restaurants without duplicates
    if (newResults.restaurants && newResults.restaurants.length > 0) {
      const newRestaurants = newResults.restaurants.filter(restaurant => 
        !isDuplicate(sessionData.restaurants, restaurant)
      );
      sessionData.restaurants = [...sessionData.restaurants, ...newRestaurants];
      console.log(`➕ Added ${newRestaurants.length} new restaurants to session ${sessionId}`);
    }
    
    // Add new activities without duplicates
    if (newResults.activities && newResults.activities.length > 0) {
      const newActivities = newResults.activities.filter(activity => 
        !isDuplicate(sessionData.activities, activity)
      );
      sessionData.activities = [...sessionData.activities, ...newActivities];
      console.log(`➕ Added ${newActivities.length} new activities to session ${sessionId}`);
    }
    
    sessionData.lastUpdated = Date.now();
    
    // Keep results manageable (last 20 items per category)
    ['hotels', 'restaurants', 'activities'].forEach(category => {
      if (sessionData[category].length > 20) {
        sessionData[category] = sessionData[category].slice(-20);
      }
    });
    
    return sessionData;
  }

  /**
   * Search restaurants (placeholder - can be enhanced with real data)
   */
  async searchRestaurants(query, location, topK = 5) {
    // For now, return some default restaurants based on location
    // This can be enhanced with real restaurant data from APIs
    const defaultRestaurants = [
      {
        id: 'rest-1',
        name: 'La Isla Restaurant',
        location: location || 'Cancun',
        cuisine: 'Mexican Seafood',
        rating: 4.5,
        priceRange: '$$$',
        description: 'Fresh seafood with ocean views'
      },
      {
        id: 'rest-2', 
        name: 'Parque de los Tacos',
        location: location || 'Cancun',
        cuisine: 'Street Food',
        rating: 4.2,
        priceRange: '$',
        description: 'Authentic local tacos and Mexican street food'
      }
    ];
    
    console.log(`🍽️ Found ${defaultRestaurants.length} restaurants in ${location || 'Mexico'}`);
    return defaultRestaurants;
  }

  /**
   * Search activities (placeholder - can be enhanced with real data)
   */
  async searchActivities(query, location, topK = 5) {
    // For now, return some default activities based on location
    // This can be enhanced with real activity data from APIs
    const defaultActivities = [
      {
        id: 'act-1',
        name: 'Snorkeling Tour',
        location: location || 'Cancun',
        type: 'Water Sports',
        rating: 4.6,
        duration: '4 hours',
        description: 'Explore colorful coral reefs and marine life'
      },
      {
        id: 'act-2',
        name: 'Chichen Itza Day Trip', 
        location: location || 'Cancun',
        type: 'Cultural',
        rating: 4.8,
        duration: '12 hours',
        description: 'Visit the ancient Mayan ruins and learn about history'
      }
    ];
    
    console.log(`🎯 Found ${defaultActivities.length} activities in ${location || 'Mexico'}`);
    return defaultActivities;
  }

  /**
   * Ultra-fast AI response generation with enhanced context
   */
  async generateAIResponse(userQuery, searchResults, intent, sessionId = 'default') {
    const startTime = Date.now();
    
    try {
      // Return quick responses immediately
      if (intent.type === 'quick') {
        performanceMonitor.incrementCounter('ai.response.quick');
        return {
          message: intent.response,
          hotels: []
        };
      }
      
      // Check query cache
      const cached = enhancedCache.getQueryResponse(sessionId, userQuery);
      if (cached) {
        console.log('✅ Returning cached AI response');
        performanceMonitor.incrementCounter('ai.response.cache.hit');
        return cached;
      }
      
      // Get conversation history (limited to last 2 exchanges)
      if (!this.conversationHistory.has(sessionId)) {
        this.conversationHistory.set(sessionId, []);
      }
      const history = this.conversationHistory.get(sessionId).slice(-4);
      
      // Build context from search results
      let contextParts = [];
      const { hotels = [], restaurants = [], activities = [] } = searchResults;
      
      if (hotels.length > 0) {
        const hotelContext = hotels.map((hotel, index) => 
          `${index + 1}. ${hotel.name} in ${hotel.city} - ${hotel.priceRange}, ${hotel.rating}/5 stars`
        ).join('\n');
        contextParts.push(`Hotels:\n${hotelContext}`);
      }
      
      if (restaurants.length > 0) {
        const restaurantContext = restaurants.map((rest, index) => 
          `${index + 1}. ${rest.name} - ${rest.cuisine}, ${rest.rating}/5 stars, ${rest.priceRange}`
        ).join('\n');
        contextParts.push(`Restaurants:\n${restaurantContext}`);
      }
      
      if (activities.length > 0) {
        const activityContext = activities.map((act, index) => 
          `${index + 1}. ${act.name} - ${act.type}, ${act.rating}/5 stars, ${act.duration}`
        ).join('\n');
        contextParts.push(`Activities:\n${activityContext}`);
      }
      
      const fullContext = contextParts.join('\n\n');
      
      // Use GPT-3.5-turbo for 10x faster responses
      const systemPrompt = `You are Maya AI, a friendly FEMALE travel assistant for Mexico hotels.
        
        IMPORTANT: You are FEMALE. Keep responses concise and helpful.
        
        FORMATTING RULES:
        - NO asterisks or markdown
        - Plain text only
        - Use numbers for lists (1. 2. 3.)
        
        Be specific, friendly, and helpful. Maximum 3-4 sentences unless listing hotels.`;
      
      // Add location context information if using context
      let locationInfo = '';
      if (intent.usingContext) {
        locationInfo = `\n\nNote: User is asking about ${intent.location} based on previous conversation context.`;
      }
      
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { 
          role: 'user', 
          content: fullContext ? 
            `Query: "${userQuery}"${locationInfo}\n\nRelevant information:\n${fullContext}\n\nProvide a helpful, concise response.` :
            `Query: "${userQuery}"${locationInfo}\n\nProvide a helpful, concise response.`
        }
      ];
      
      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo', // 10x faster than GPT-4
        messages: messages,
        temperature: 0.7,
        max_tokens: 300,
        stream: false
      });
      
      const aiResponse = completion.choices[0].message.content;
      
      // Update history efficiently
      const newHistory = [
        ...history,
        { role: 'user', content: userQuery },
        { role: 'assistant', content: aiResponse }
      ].slice(-6); // Keep only last 3 exchanges
      
      this.conversationHistory.set(sessionId, newHistory);
      
      const response = {
        message: aiResponse
      };
      
      // Cache the response (message only, results are managed by session)
      enhancedCache.setQueryResponse(sessionId, userQuery, response);
      
      performanceMonitor.incrementCounter('ai.response.generated');
      
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      performanceMonitor.incrementCounter('ai.response.error');
      
      return {
        message: "I'm having a moment! Let me try again. What kind of hotel are you looking for in Mexico?"
      };
    }
  }

  /**
   * Main ultra-optimized processing pipeline with location context
   */
  async processUserQuery(query, sessionId = 'default') {
    const startTime = Date.now();
    const correlationId = performanceMonitor.getCorrelationId() || `query-${Date.now()}`;
    
    try {
      // Step 1: Ultra-fast intent detection with location context (should be <5ms)
      performanceMonitor.startTimer(`${correlationId}-intent`);
      const intent = this.detectIntent(query, sessionId);
      performanceMonitor.endTimer(`${correlationId}-intent`);
      
      // Step 2: Update location context if location detected and clear results if location changed
      let locationChanged = false;
      if (intent.detectedLocation) {
        locationChanged = locationContext.updateLocationContext(sessionId, query, intent.detectedLocation);
        
        // Clear session results if location changed to a different city
        if (locationChanged) {
          console.log(`🧹 Location changed - clearing previous session results for ${sessionId}`);
          this.sessionResults.delete(sessionId);
          // Also clear response organizer session data since it's location-specific
          responseOrganizerService.clearSession(sessionId);
          // Clear session-specific cache entries
          enhancedCache.clearSession(sessionId);
        }
      }
      
      console.log(`🎯 Intent detected in ${Date.now() - startTime}ms:`, {
        type: intent.type,
        location: intent.location,
        usingContext: intent.usingContext
      });
      
      // Step 3: Search for relevant content based on intent
      let hotels = [];
      let restaurants = [];
      let activities = [];
      
      if (intent.needsHotels) {
        performanceMonitor.startTimer(`${correlationId}-hotels`);
        hotels = await this.searchHotels(query, intent.location, 5);
        performanceMonitor.endTimer(`${correlationId}-hotels`);
        console.log(`🏨 Hotel search completed in ${Date.now() - startTime}ms`);
      }
      
      if (intent.needsRestaurants) {
        performanceMonitor.startTimer(`${correlationId}-restaurants`);
        restaurants = await this.searchRestaurants(query, intent.location, 5);
        performanceMonitor.endTimer(`${correlationId}-restaurants`);
        console.log(`🍽️ Restaurant search completed in ${Date.now() - startTime}ms`);
      }
      
      if (intent.needsActivities) {
        performanceMonitor.startTimer(`${correlationId}-activities`);
        activities = await this.searchActivities(query, intent.location, 5);
        performanceMonitor.endTimer(`${correlationId}-activities`);
        console.log(`🎯 Activity search completed in ${Date.now() - startTime}ms`);
      }
      
      // Step 4: Update session results with new search results
      const newSearchResults = { hotels, restaurants, activities };
      this.updateSessionResults(sessionId, newSearchResults);
      
      // Step 5: Get all accumulated session results
      const allSessionResults = this.getSessionResults(sessionId);
      
      // Step 6: AI response generation with enhanced context
      performanceMonitor.startTimer(`${correlationId}-ai`);
      const response = await this.generateAIResponse(
        query, 
        allSessionResults, // Use all accumulated results for context
        intent, 
        sessionId
      );
      performanceMonitor.endTimer(`${correlationId}-ai`);
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ Total response time: ${totalTime}ms`);
      
      // Log performance breakdown
      console.log('🔍 Performance breakdown:', {
        intent: performanceMonitor.getMetric(`${correlationId}-intent`)?.duration || 0,
        hotels: performanceMonitor.getMetric(`${correlationId}-hotels`)?.duration || 0,
        restaurants: performanceMonitor.getMetric(`${correlationId}-restaurants`)?.duration || 0,
        activities: performanceMonitor.getMetric(`${correlationId}-activities`)?.duration || 0,
        ai: performanceMonitor.getMetric(`${correlationId}-ai`)?.duration || 0,
        total: totalTime
      });
      
      // Add location context info to response
      const locationContextSummary = locationContext.getContextSummary(sessionId);
      console.log('📍 Location context:', locationContextSummary);
      
      // Log session results summary
      console.log('📊 Session results:', {
        hotels: allSessionResults.hotels.length,
        restaurants: allSessionResults.restaurants.length,
        activities: allSessionResults.activities.length
      });
      
      // Return response with all accumulated session results
      return {
        message: response.message,
        hotels: allSessionResults.hotels,
        restaurants: allSessionResults.restaurants,
        activities: allSessionResults.activities,
        locationContext: {
          currentLocation: intent.location,
          usingContext: intent.usingContext,
          contextSummary: locationContextSummary
        }
      };
    } catch (error) {
      console.error('Error processing query:', error);
      performanceMonitor.incrementCounter('query.error');
      
      return {
        message: "I'm having trouble right now. Could you try asking about a specific destination like Cancun or Playa del Carmen?",
        hotels: []
      };
    }
  }

  // Helper methods (same as optimized service)
  formatSearchResults(matches) {
    const hotelImages = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'
    ];
    
    return matches.map((match, index) => {
      const amenities = JSON.parse(match.metadata.amenities || '[]');
      const nearbyAttractions = JSON.parse(match.metadata.nearbyAttractions || '[]');
      
      let rating = parseFloat(match.metadata.rating) || 0;
      if (rating === 0) {
        rating = (3.5 + Math.random() * 1.4).toFixed(1);
      }
      
      const imageUrl = match.metadata.imageUrl || hotelImages[index % hotelImages.length];
      
      return {
        id: match.id,
        score: match.score,
        name: match.metadata.name,
        location: match.metadata.location,
        city: match.metadata.city,
        state: match.metadata.state,
        description: match.metadata.description,
        amenities: amenities,
        priceRange: match.metadata.priceRange || '$$$',
        rating: parseFloat(rating),
        reviewCount: parseInt(match.metadata.reviewCount) || Math.floor(Math.random() * 500) + 100,
        type: match.metadata.type || 'Hotel',
        imageUrl: imageUrl,
        affiliateLink: match.metadata.affiliateLink || '#',
        nearbyAttractions: nearbyAttractions,
        latitude: parseFloat(match.metadata.latitude) || 0,
        longitude: parseFloat(match.metadata.longitude) || 0
      };
    });
  }

  async fetchTripAdvisorHotels(location, limit) {
    try {
      console.log(`📡 Fetching TripAdvisor data for ${location}...`);
      const hotels = await tripAdvisorService.searchMexicoHotels(location, { limit });
      
      // Store in vector DB asynchronously (don't wait)
      if (hotels.length > 0) {
        this.storeHotelData(hotels).catch(err => 
          console.error('Error storing hotel data:', err)
        );
      }
      
      return hotels;
    } catch (error) {
      console.error('TripAdvisor fetch failed:', error);
      return [];
    }
  }

  async storeHotelData(hotels) {
    // Same implementation as optimized service
    // This runs asynchronously and doesn't block responses
    try {
      const vectors = [];
      
      for (const hotel of hotels) {
        const amenitiesList = Array.isArray(hotel.amenities) ? hotel.amenities : [];
        const location = typeof hotel.location === 'object'
          ? `${hotel.location.address || ''}, ${hotel.location.city || ''}, ${hotel.location.state || ''}`
          : hotel.location || '';
        
        const city = hotel.location?.city || hotel.city || 'Unknown';
        const state = hotel.location?.state || hotel.state || 'Mexico';
        
        const textToEmbed = `
          Hotel: ${hotel.name}
          Location: ${location}
          City: ${city}
          State: ${state}
          Description: ${hotel.description || ''}
          Amenities: ${amenitiesList.join(', ')}
          Price Range: ${hotel.priceRange || hotel.priceLevel || ''}
          Rating: ${hotel.rating}
          Type: ${hotel.type || hotel.category || 'Hotel'}
        `;
        
        const embedding = await this.generateEmbedding(textToEmbed);
        
        vectors.push({
          id: hotel.id || `hotel-${Date.now()}-${Math.random()}`,
          values: embedding,
          metadata: {
            name: hotel.name,
            location: location,
            city: city,
            state: state,
            description: hotel.description || '',
            amenities: JSON.stringify(amenitiesList),
            priceRange: hotel.priceRange || hotel.priceLevel || '',
            rating: hotel.rating || 0,
            reviewCount: hotel.reviewCount || 0,
            type: hotel.type || hotel.category || 'Hotel',
            imageUrl: hotel.imageUrl || (hotel.images?.[0]?.url) || '',
            affiliateLink: hotel.affiliateLink || hotel.bookingUrl || '',
            nearbyAttractions: JSON.stringify(hotel.nearbyAttractions || []),
            latitude: hotel.location?.latitude || 0,
            longitude: hotel.location?.longitude || 0
          }
        });
      }
      
      // Upsert vectors in batches
      if (this.index) {
        const batchSize = 100;
        for (let i = 0; i < vectors.length; i += batchSize) {
          const batch = vectors.slice(i, i + batchSize);
          await this.index.upsert(batch);
        }
      }
      
      console.log(`✅ Stored ${vectors.length} hotels in vector database`);
      return true;
    } catch (error) {
      console.error('Error storing hotel data:', error);
      return false;
    }
  }

  getDefaultHotels(location, limit = 5) {
    // Import sample hotels data which includes all the new Cancun adults-only resorts
    try {
      const sampleHotels = [
        {
          id: 'hotel-001',
          name: 'Grand Velas Riviera Maya',
          location: 'Playa del Carmen',
          city: 'Playa del Carmen',
          state: 'Quintana Roo',
          description: 'Luxury all-inclusive resort with pristine beaches, world-class spa, and gourmet dining. Perfect for families and couples seeking ultimate relaxation.',
          amenities: ['Beach Access', 'Multiple Pools', 'Spa', 'Kids Club', 'All-Inclusive', 'Fitness Center', 'Water Sports', 'Golf Nearby'],
          priceRange: '$$$$$',
          rating: 4.9,
          reviewCount: 2500,
          type: 'Resort',
          imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9',
          affiliateLink: '#'
        },
        {
          id: 'hotel-015',
          name: 'Secrets The Vine Cancun',
          location: 'Cancun Hotel Zone',
          city: 'Cancun',
          state: 'Quintana Roo',
          description: 'Adults-only all-inclusive resort in the heart of Cancun\'s Hotel Zone. This sophisticated property offers a refined atmosphere with premium amenities, world-class dining, and stunning ocean views.',
          amenities: ['Beach Access', 'Adults Only', 'All-Inclusive', 'Spa', 'Multiple Pools', 'Swim-Up Bars', 'Rooftop Bar', 'Entertainment', 'Water Sports', 'Fine Dining'],
          priceRange: '$$$$',
          rating: 4.6,
          reviewCount: 1800,
          type: 'Resort',
          imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9',
          affiliateLink: '#'
        },
        {
          id: 'hotel-016',
          name: 'Hyatt Zilara Cancun',
          location: 'Cancun Hotel Zone',
          city: 'Cancun',
          state: 'Quintana Roo',
          description: 'Adults-only all-inclusive beachfront resort offering unlimited luxury in a sophisticated setting. Features elegant suites, gourmet dining, and personalized service.',
          amenities: ['Beach Access', 'Adults Only', 'All-Inclusive', 'Butler Service', 'Spa', 'Multiple Pools', 'Fine Dining', 'Swim-Up Suites', 'Entertainment', 'Water Sports'],
          priceRange: '$$$$$',
          rating: 4.7,
          reviewCount: 2100,
          type: 'Resort',
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
          affiliateLink: '#'
        },
        {
          id: 'hotel-017',
          name: 'Live Aqua Beach Resort Cancun',
          location: 'Cancun Hotel Zone',
          city: 'Cancun',
          state: 'Quintana Roo',
          description: 'Adults-only sensory resort that awakens all five senses through innovative design, cuisine, and experiences.',
          amenities: ['Beach Access', 'Adults Only', 'All-Inclusive', 'Sensory Experiences', 'Spa', 'Rooftop Pool', 'Mixology Bar', 'Gourmet Dining', 'Art Installations', 'Yoga'],
          priceRange: '$$$$',
          rating: 4.5,
          reviewCount: 1650,
          type: 'Resort',
          imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd',
          affiliateLink: '#'
        },
        {
          id: 'hotel-018',
          name: 'Temptation Cancun Resort',
          location: 'Cancun Hotel Zone',
          city: 'Cancun',
          state: 'Quintana Roo',
          description: 'Adults-only all-inclusive resort designed for couples seeking a playful and energetic atmosphere.',
          amenities: ['Beach Access', 'Adults Only', 'All-Inclusive', 'Entertainment', 'Theme Parties', 'Spa', 'Multiple Pools', 'Bars', 'Restaurants', 'Water Sports'],
          priceRange: '$$$',
          rating: 4.3,
          reviewCount: 1200,
          type: 'Resort',
          imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
          affiliateLink: '#'
        },
        {
          id: 'hotel-019',
          name: 'Excellence Playa Mujeres',
          location: 'Playa Mujeres',
          city: 'Cancun',
          state: 'Quintana Roo',
          description: 'Adults-only all-inclusive resort located on the pristine beaches of Playa Mujeres, just north of Cancun.',
          amenities: ['Beach Access', 'Adults Only', 'All-Inclusive', 'Golf Course', 'Spa', 'Multiple Pools', 'Fine Dining', 'Butler Service', 'Tennis', 'Water Sports'],
          priceRange: '$$$$',
          rating: 4.8,
          reviewCount: 1950,
          type: 'Resort',
          imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
          affiliateLink: '#'
        },
        {
          id: 'hotel-020',
          name: 'Beloved Playa Mujeres',
          location: 'Playa Mujeres',
          city: 'Cancun',
          state: 'Quintana Roo',
          description: 'Boutique adults-only all-inclusive resort offering an intimate and romantic experience.',
          amenities: ['Beach Access', 'Adults Only', 'All-Inclusive', 'Butler Service', 'Spa', 'Infinity Pool', 'Gourmet Dining', 'Private Beach', 'Concierge', 'Yoga'],
          priceRange: '$$$$$',
          rating: 4.9,
          reviewCount: 850,
          type: 'Boutique',
          imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
          affiliateLink: '#'
        },
        {
          id: 'hotel-021',
          name: 'Finest Playa Mujeres',
          location: 'Playa Mujeres',
          city: 'Cancun',
          state: 'Quintana Roo',
          description: 'Adults-only section of a luxury all-inclusive resort offering exclusive amenities and sophisticated accommodations.',
          amenities: ['Beach Access', 'Adults Only', 'All-Inclusive', 'Premium Dining', 'Spa', 'Private Pools', 'Golf Course', 'Butler Service', 'Entertainment', 'Water Sports'],
          priceRange: '$$$$',
          rating: 4.6,
          reviewCount: 1400,
          type: 'Resort',
          imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9',
          affiliateLink: '#'
        },
        {
          id: 'hotel-022',
          name: 'Le Blanc Spa Resort Cancun',
          location: 'Cancun Hotel Zone',
          city: 'Cancun',
          state: 'Quintana Roo',
          description: 'Ultra-luxury adults-only all-inclusive resort offering the highest level of sophistication and service.',
          amenities: ['Beach Access', 'Adults Only', 'All-Inclusive', 'World-Class Spa', 'Butler Service', 'Gourmet Restaurants', 'Premium Liquors', 'Infinity Pools', 'Concierge', 'Fine Dining'],
          priceRange: '$$$$$',
          rating: 4.8,
          reviewCount: 1650,
          type: 'Luxury',
          imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd',
          affiliateLink: '#'
        },
        // Add some non-adults-only options too
        {
          id: 'hotel-008',
          name: 'Moon Palace Cancun',
          location: 'Cancun Hotel Zone',
          city: 'Cancun',
          state: 'Quintana Roo',
          description: 'Massive all-inclusive resort with something for everyone. Water park, golf course, and endless activities for families.',
          amenities: ['Beach Access', 'Water Park', 'Golf Course', 'Kids Club', 'All-Inclusive', 'Multiple Pools', 'Spa', 'Entertainment'],
          priceRange: '$$$$',
          rating: 4.5,
          reviewCount: 3200,
          type: 'Resort',
          imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9',
          affiliateLink: '#'
        }
      ];
      
      // Filter by location if specified
      let filteredHotels = sampleHotels;
      if (location) {
        const normalizedLocation = location.toLowerCase();
        filteredHotels = sampleHotels.filter(hotel => {
          const city = (hotel.city || '').toLowerCase();
          const hotelLocation = (hotel.location || '').toLowerCase();
          return city.includes(normalizedLocation) || 
                 hotelLocation.includes(normalizedLocation) ||
                 normalizedLocation.includes(city);
        });
      }
      
      console.log(`✅ Using ${filteredHotels.length} default hotels for location: ${location || 'general'}`);
      return filteredHotels.slice(0, limit);
    } catch (error) {
      console.error('Error loading sample hotels, using basic fallback:', error);
      
      // Ultra-basic fallback if sample data fails
      return [
        {
          id: 'fallback-1',
          name: 'Sample Resort',
          city: location || 'Mexico',
          state: 'Mexico',
          location: `${location || 'Mexico'}, Mexico`,
          description: 'Sample resort for demonstration',
          amenities: ['Pool', 'Beach', 'Restaurant'],
          priceRange: '$$$',
          rating: 4.0,
          reviewCount: 100,
          type: 'Resort',
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
          affiliateLink: '#'
        }
      ];
    }
  }

  clearSession(sessionId = 'default') {
    this.conversationHistory.delete(sessionId);
    this.sessionResults.delete(sessionId);
    locationContext.clearLocationContext(sessionId);
    enhancedCache.clearSession(sessionId);
    console.log(`🧹 Cleared all session data for ${sessionId}`);
  }

  getCacheStats() {
    return enhancedCache.getStats();
  }
}

export default new UltraOptimizedRAGService();