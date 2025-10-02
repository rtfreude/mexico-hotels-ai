import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import tripAdvisorService from './tripadvisor.service.js';
import crypto from 'crypto';

dotenv.config();

/* Lazy OpenAI client initialization to avoid throwing at module load
   when OPENAI_API_KEY is missing (same pattern used in rag.service.js) */
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

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

class OptimizedRAGService {
  constructor() {
    this.indexName = process.env.PINECONE_INDEX_NAME || 'mexico-hotels';
    this.index = null;
    this.conversationHistory = new Map();
    
    // Enhanced caching system
    this.queryCache = new Map();
    this.embeddingCache = new Map();
    this.hotelCache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
    
    // Pre-computed responses for common queries
    this.quickResponses = new Map();
    this.initializeQuickResponses();
    
    // Initialize index asynchronously
    this.initializeIndex();
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
    // Pre-computed responses for common greetings
    this.quickResponses.set('hello', "Hello! I'm Maya, your personal Mexico travel assistant. I'm here to help you find the perfect hotel for your Mexican vacation. Where are you thinking of staying? Popular destinations include Cancun, Playa del Carmen, Tulum, and Puerto Vallarta!");
    this.quickResponses.set('hi', "Hi there! I'm Maya, and I'd love to help you plan your Mexico trip. What kind of hotel experience are you looking for? Beach resort, boutique hotel, or something else?");
    this.quickResponses.set('hey', "Hey! Welcome! I'm Maya, your Mexico hotel expert. Tell me about your dream vacation - are you looking for beaches, culture, adventure, or a mix of everything?");
    this.quickResponses.set('help', "I'm here to help you find amazing hotels in Mexico! Just tell me:\n- Where you want to go (like Cancun, Tulum, etc.)\n- Your budget preferences\n- What amenities matter to you\n- When you're planning to travel\n\nI'll find the perfect matches for you!");
  }

  // Fast intent detection without AI
  detectIntent(query) {
    const lowerQuery = query.toLowerCase().trim();
    
    // Check for quick responses first
    for (const [key, response] of this.quickResponses) {
      if (lowerQuery === key || lowerQuery === key + '!' || lowerQuery === key + '.') {
        return { type: 'quick', response, needsHotels: false };
      }
    }
    
    // Hotel search patterns
    const hotelPatterns = [
      /hotel|resort|stay|accommodation|lodging|room|booking/i,
      /where (to|should|can) (i|we) stay/i,
      /recommend|suggestion|best place/i,
      /beach|pool|spa|luxury|budget|cheap|affordable/i
    ];
    
    // Location patterns
    const locationPattern = /cancun|playa del carmen|tulum|cabo|puerto vallarta|mexico city|cozumel|riviera maya|guadalajara|oaxaca|acapulco|los cabos|mazatlan/i;
    
    const hasHotelKeyword = hotelPatterns.some(pattern => pattern.test(lowerQuery));
    const hasLocation = locationPattern.test(lowerQuery);
    const location = lowerQuery.match(locationPattern)?.[0] || null;
    
    // General travel questions
    const generalPatterns = [
      { pattern: /weather|climate|temperature/i, type: 'weather' },
      { pattern: /food|restaurant|eat|cuisine/i, type: 'food' },
      { pattern: /culture|tradition|history/i, type: 'culture' },
      { pattern: /safety|safe|dangerous/i, type: 'safety' },
      { pattern: /currency|money|peso|dollar/i, type: 'currency' },
      { pattern: /language|spanish|english/i, type: 'language' }
    ];
    
    for (const { pattern, type } of generalPatterns) {
      if (pattern.test(lowerQuery) && !hasHotelKeyword) {
        return { type: 'general', topic: type, needsHotels: false };
      }
    }
    
    // Determine if we need hotel search
    const needsHotels = hasHotelKeyword || (hasLocation && lowerQuery.length < 50);
    
    return {
      type: needsHotels ? 'hotel_search' : 'general',
      needsHotels,
      location,
      query: lowerQuery
    };
  }

  // Generate embedding with caching
  async generateEmbedding(text) {
    // Check cache first
    const cacheKey = crypto.createHash('md5').update(text).digest('hex');
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey);
    }
    
    try {
      const response = await getOpenAI().embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      
      const embedding = response.data[0].embedding;
      this.embeddingCache.set(cacheKey, embedding);
      
      // Clean old cache entries if too many
      if (this.embeddingCache.size > 1000) {
        const firstKey = this.embeddingCache.keys().next().value;
        this.embeddingCache.delete(firstKey);
      }
      
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  // Optimized hotel search
  async searchHotels(query, location, topK = 5) {
    // Check hotel cache first
    const cacheKey = `${location || 'general'}:${query}`.toLowerCase();
    if (this.hotelCache.has(cacheKey)) {
      const cached = this.hotelCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('Returning cached hotels for:', cacheKey);
        return cached.hotels;
      }
      this.hotelCache.delete(cacheKey);
    }
    
    try {
      // Always try vector search first if index is available
      if (this.index) {
        const searchQuery = location 
          ? `${location} Mexico hotels ${query}`
          : `Mexico hotels ${query}`;
        
        const queryEmbedding = await this.generateEmbedding(searchQuery);
        
        // Try with location filter first if location is provided
        let searchResults;
        if (location) {
          // Normalize location for better matching
          const normalizedLocation = location.toLowerCase()
            .replace('playa del carmen', 'playa del carmen')
            .replace('puerto vallarta', 'puerto vallarta')
            .replace('los cabos', 'cabo san lucas');
          
          searchResults = await this.index.query({
            vector: queryEmbedding,
            topK: topK * 2, // Get more results to filter
            includeMetadata: true
          });
          
          // Filter results by location manually if needed
          if (searchResults.matches && searchResults.matches.length > 0) {
            const locationMatches = searchResults.matches.filter(match => {
              const city = (match.metadata.city || '').toLowerCase();
              return city.includes(normalizedLocation) || normalizedLocation.includes(city);
            });
            
            // If we have location matches, use them; otherwise use all results
            if (locationMatches.length > 0) {
              searchResults.matches = locationMatches.slice(0, topK);
            } else {
              searchResults.matches = searchResults.matches.slice(0, topK);
            }
          }
        } else {
          // No location specified, just do a general search
          searchResults = await this.index.query({
            vector: queryEmbedding,
            topK,
            includeMetadata: true
          });
        }
        
        if (searchResults.matches && searchResults.matches.length > 0) {
          const hotels = this.formatSearchResults(searchResults.matches);
          
          // Cache the results
          this.hotelCache.set(cacheKey, {
            hotels,
            timestamp: Date.now()
          });
          
          console.log(`Found ${hotels.length} hotels from vector search`);
          return hotels;
        }
      }
      
      // Only fallback to TripAdvisor if vector search returns nothing
      // AND we have a specific location
      if (location && (!this.index || this.hotelCache.size === 0)) {
        console.log('Vector search empty, falling back to TripAdvisor...');
        const tripAdvisorHotels = await this.fetchTripAdvisorHotels(location, topK);
        if (tripAdvisorHotels.length > 0) {
          this.hotelCache.set(cacheKey, {
            hotels: tripAdvisorHotels,
            timestamp: Date.now()
          });
          return tripAdvisorHotels;
        }
      }
      
      // If all else fails, return some default hotels
      console.log('Using default hotel data...');
      return this.getDefaultHotels(location, topK);
    } catch (error) {
      console.error('Error searching hotels:', error);
      return this.getDefaultHotels(location, topK);
    }
  }

  // Format search results consistently
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

  // Fetch from TripAdvisor with better error handling
  async fetchTripAdvisorHotels(location, limit) {
    try {
      console.log(`Fetching TripAdvisor data for ${location}...`);
      const hotels = await tripAdvisorService.searchMexicoHotels(location, { limit });
      
      // Store in vector DB for future use (async, don't wait)
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

  // Store hotel data (async, non-blocking)
  async storeHotelData(hotels) {
    try {
      const vectors = [];
      
      for (const hotel of hotels) {
        // Handle both sample data format and TripAdvisor format
        const amenitiesList = Array.isArray(hotel.amenities) 
          ? hotel.amenities 
          : [];
        
        const location = typeof hotel.location === 'object'
          ? `${hotel.location.address || ''}, ${hotel.location.city || ''}, ${hotel.location.state || ''}`
          : hotel.location || '';
        
        const city = hotel.location?.city || hotel.city || 'Unknown';
        const state = hotel.location?.state || hotel.state || 'Mexico';

        // Region information: handle reference object, plain string, or embedded fields
        const regionName = (hotel.region && typeof hotel.region === 'object') ? (hotel.region.name || hotel.regionName || '') : (hotel.region || hotel.regionName || '');
        const regionId = (hotel.region && typeof hotel.region === 'object') ? (hotel.region.id || hotel.region._id || hotel.region._ref || null) : (hotel.regionId || null);
        const regionSlug = (hotel.region && typeof hotel.region === 'object') ? (hotel.region.slug || hotel.regionSlug || '') : (hotel.regionSlug || '');

        const textToEmbed = `
          Hotel: ${hotel.name}
          Location: ${location}
          City: ${city}
          State: ${state}
          Region: ${regionName}
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
            ,
            // Region metadata for region-aware retrieval and filtering
            regionName: regionName || '',
            regionId: regionId || null,
            regionSlug: regionSlug || ''
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

  // Fast AI response generation
  async generateAIResponse(userQuery, hotels, intent, sessionId = 'default') {
    try {
      // For quick responses, return immediately
      if (intent.type === 'quick') {
        return {
          message: intent.response,
          hotels: []
        };
      }
      
      // Get conversation history
      if (!this.conversationHistory.has(sessionId)) {
        this.conversationHistory.set(sessionId, []);
      }
      const history = this.conversationHistory.get(sessionId);
      
      // Build hotel context if available
      let hotelContext = '';
      if (hotels && hotels.length > 0) {
        hotelContext = hotels.map((hotel, index) => 
          `${index + 1}. ${hotel.name} in ${hotel.city} - ${hotel.priceRange}, ${hotel.rating}/5 stars`
        ).join('\n');
      }
      
      // Use GPT-3.5-turbo for faster responses
      const systemPrompt = `You are Maya AI, a friendly FEMALE travel assistant for Mexico hotels.
        
        IMPORTANT: You are FEMALE. Keep responses concise and helpful.
        
        FORMATTING RULES:
        - NO asterisks or markdown
        - Plain text only
        - Use numbers for lists (1. 2. 3.)
        
        Be specific, friendly, and helpful. Maximum 3-4 sentences unless listing hotels.`;
      
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-4), // Only last 2 exchanges
        { 
          role: 'user', 
          content: hotelContext ? 
            `Query: "${userQuery}"\n\nRelevant hotels:\n${hotelContext}\n\nProvide a helpful, concise response.` :
            userQuery
        }
      ];
      
      // Use GPT-3.5-turbo for 10x faster responses
      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 300,
        stream: false
      });
      
      const aiResponse = completion.choices[0].message.content;
      
      // Update history
      history.push({ role: 'user', content: userQuery });
      history.push({ role: 'assistant', content: aiResponse });
      
      if (history.length > 10) {
        this.conversationHistory.set(sessionId, history.slice(-10));
      }
      
      return {
        message: aiResponse,
        hotels: hotels || []
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        message: "I'm having a moment! Let me try again. What kind of hotel are you looking for in Mexico?",
        hotels: hotels || []
      };
    }
  }

  // Main optimized pipeline
  async processUserQuery(query, sessionId = 'default') {
    const startTime = Date.now();
    
    try {
      // Quick intent detection
      const intent = this.detectIntent(query);
      console.log('Intent detected in', Date.now() - startTime, 'ms:', intent);
      
      // Check response cache
      const cacheKey = `${sessionId}:${query.toLowerCase().trim()}`;
      if (this.queryCache.has(cacheKey)) {
        const cached = this.queryCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 60000) { // 1 minute cache for responses
          console.log('Returning cached response, total time:', Date.now() - startTime, 'ms');
          return cached.response;
        }
      }
      
      let hotels = [];
      
      // Only search for hotels if needed
      if (intent.needsHotels) {
        const searchStart = Date.now();
        hotels = await this.searchHotels(query, intent.location, 5);
        console.log('Hotel search completed in', Date.now() - searchStart, 'ms');
      }
      
      // Generate AI response
      const aiStart = Date.now();
      const response = await this.generateAIResponse(query, hotels, intent, sessionId);
      console.log('AI response generated in', Date.now() - aiStart, 'ms');
      
      // Cache the response
      this.queryCache.set(cacheKey, {
        response,
        timestamp: Date.now()
      });
      
      // Clean cache if too large
      if (this.queryCache.size > 100) {
        const firstKey = this.queryCache.keys().next().value;
        this.queryCache.delete(firstKey);
      }
      
      console.log('Total response time:', Date.now() - startTime, 'ms');
      return response;
    } catch (error) {
      console.error('Error processing query:', error);
      return {
        message: "I'm having trouble right now. Could you try asking about a specific destination like Cancun or Playa del Carmen?",
        hotels: []
      };
    }
  }

  // Clear session
  clearSession(sessionId = 'default') {
    this.conversationHistory.delete(sessionId);
  }

  // Get default hotels when search fails
  getDefaultHotels(location, limit = 5) {
    const defaultHotels = [
      {
        id: 'default-1',
        name: 'Grand Fiesta Americana',
        city: location || 'Cancun',
        state: 'Quintana Roo',
        location: `${location || 'Cancun'}, Mexico`,
        description: 'Luxury beachfront resort with stunning ocean views',
        amenities: ['Pool', 'Spa', 'Beach Access', 'Restaurant', 'Bar'],
        priceRange: '$$$$',
        rating: 4.5,
        reviewCount: 1250,
        type: 'Resort',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        affiliateLink: '#'
      },
      {
        id: 'default-2',
        name: 'Hotel Xcaret',
        city: location || 'Playa del Carmen',
        state: 'Quintana Roo',
        location: `${location || 'Playa del Carmen'}, Mexico`,
        description: 'All-inclusive eco-resort with access to parks',
        amenities: ['All-Inclusive', 'Pool', 'Spa', 'Kids Club', 'Beach'],
        priceRange: '$$$$',
        rating: 4.7,
        reviewCount: 2100,
        type: 'Resort',
        imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9',
        affiliateLink: '#'
      },
      {
        id: 'default-3',
        name: 'Hyatt Ziva',
        city: location || 'Cancun',
        state: 'Quintana Roo',
        location: `${location || 'Cancun'}, Mexico`,
        description: 'Family-friendly all-inclusive resort',
        amenities: ['All-Inclusive', 'Pool', 'Beach', 'Restaurant', 'Gym'],
        priceRange: '$$$',
        rating: 4.4,
        reviewCount: 1800,
        type: 'Resort',
        imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
        affiliateLink: '#'
      },
      {
        id: 'default-4',
        name: 'Secrets Maroma Beach',
        city: location || 'Riviera Maya',
        state: 'Quintana Roo',
        location: `${location || 'Riviera Maya'}, Mexico`,
        description: 'Adults-only luxury resort',
        amenities: ['Adults Only', 'All-Inclusive', 'Spa', 'Pool', 'Beach'],
        priceRange: '$$$$',
        rating: 4.6,
        reviewCount: 950,
        type: 'Resort',
        imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd',
        affiliateLink: '#'
      },
      {
        id: 'default-5',
        name: 'Iberostar Selection',
        city: location || 'Cancun',
        state: 'Quintana Roo',
        location: `${location || 'Cancun'}, Mexico`,
        description: 'Beachfront resort with multiple pools',
        amenities: ['Pool', 'Beach', 'Restaurant', 'Kids Club', 'Spa'],
        priceRange: '$$$',
        rating: 4.3,
        reviewCount: 1450,
        type: 'Resort',
        imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
        affiliateLink: '#'
      }
    ];
    
    return defaultHotels.slice(0, limit);
  }
}

export default new OptimizedRAGService();
