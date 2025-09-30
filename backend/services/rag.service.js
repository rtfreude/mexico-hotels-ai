import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import crypto from 'crypto';
import performanceMonitor from '../utils/performance.js';
import redisClient from '../utils/redisClient.js';
import tripAdvisorService from './tripadvisor.service.js';

dotenv.config();

/* Lazy OpenAI client initialization.
   This prevents module-load-time errors when OPENAI_API_KEY is missing
   and defers creating the client until it's actually needed. */
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

let pinecone = null;
if (process.env.PINECONE_API_KEY) {
  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
} else {
  console.warn('PINECONE_API_KEY not provided; Pinecone features disabled');
}

class RAGService {
  constructor() {
    this.indexName = process.env.PINECONE_INDEX_NAME || 'mexico-hotels';
    this.index = null;
    this.conversationHistory = new Map(); // Store conversation history per session
    this.queryCache = new Map(); // Cache for query results (LRU semantics)
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache timeout
    this.cacheStaleWindow = 10 * 60 * 1000; // 10 minutes stale-while-revalidate window
    this.cacheMaxSize = 1000; // max entries for L1 cache
    this.inFlight = new Map(); // single-flight promises per cache key
    this.embeddingInFlight = new Map(); // single-flight for embeddings
    this.initializeIndex();

    // Timeouts & circuit-breaker configuration (can be tuned via environment variables)
    this.embeddingTimeoutMs = parseInt(process.env.EMBEDDING_TIMEOUT_MS || '3000', 10); // 2-4s recommended
    this.pineconeTimeoutMs = parseInt(process.env.PINECONE_TIMEOUT_MS || '1500', 10); // 1-3s depending on plan
    this.tripAdvisorTimeoutMs = parseInt(process.env.TRIPADVISOR_TIMEOUT_MS || '1500', 10);
    this.openaiMaxWaitMs = parseInt(process.env.OPENAI_MAX_WAIT_MS || '8000', 10); // configurable max wait
    this.openaiMaxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '800', 10);
    this.openaiFallbackTokens = parseInt(process.env.OPENAI_FALLBACK_TOKENS || String(Math.floor(this.openaiMaxTokens / 2)), 10);

    // Simple circuit-breaker state for TripAdvisor
    this.tripAdvisorCircuit = {
      failures: 0,
      failureThreshold: parseInt(process.env.TRIPADVISOR_FAILURE_THRESHOLD || '3', 10),
      resetTimeoutMs: parseInt(process.env.TRIPADVISOR_RESET_MS || String(60 * 1000), 10), // open for 60s by default
      openUntil: 0,
      lastFailureTs: 0
    };
  }

  // Utility: wrap a promise with a timeout; rejects with an Error on timeout
  _withTimeout(promise, ms, name = 'operation') {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        const err = new Error(`${name} timeout after ${ms}ms`);
        err.code = 'TIMEOUT';
        reject(err);
      }, ms);

      promise.then(res => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(res);
      }).catch(err => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  // Helper to check if TripAdvisor circuit is open
  _isTripAdvisorOpen() {
    return Date.now() < (this.tripAdvisorCircuit.openUntil || 0);
  }

  // Helper to record TripAdvisor failure and (possibly) open circuit
  _recordTripAdvisorFailure() {
    const s = this.tripAdvisorCircuit;
    s.failures = (s.failures || 0) + 1;
    s.lastFailureTs = Date.now();
    if (s.failures >= s.failureThreshold) {
      s.openUntil = Date.now() + s.resetTimeoutMs;
      performanceMonitor.incrementCounter('tripadvisor.circuit_open');
      console.warn(`TripAdvisor circuit opened for ${s.resetTimeoutMs}ms due to repeated failures`);
    }
  }

  // Helper to reset TripAdvisor circuit on success
  _resetTripAdvisorCircuit() {
    this.tripAdvisorCircuit.failures = 0;
    this.tripAdvisorCircuit.openUntil = 0;
    this.tripAdvisorCircuit.lastFailureTs = 0;
    performanceMonitor.incrementCounter('tripadvisor.circuit_reset');
  }

  async initializeIndex() {
    try {
      if (!pinecone) {
        console.warn('Pinecone client not configured - skipping index initialization');
        return;
      }
      // Check if index exists, if not create it
      const indexes = await pinecone.listIndexes();
      const indexExists = indexes.indexes?.some(idx => idx.name === this.indexName);
      
      if (!indexExists) {
        console.log(`Creating Pinecone index: ${this.indexName}`);
        await pinecone.createIndex({
          name: this.indexName,
          dimension: 1536, // OpenAI embedding dimension
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        
        // Wait for index to be ready
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
      
      this.index = pinecone.index(this.indexName);
      console.log('✅ Pinecone index initialized');
    } catch (error) {
      console.error('Error initializing Pinecone index:', error);
    }
  }

  // Generate embeddings using OpenAI with Redis L2 cache and local single-flight
  async generateEmbedding(text) {
    const normalized = (text || '').trim();
    const hash = crypto.createHash('sha256').update(normalized).digest('hex');
    const cacheKey = `embed:${hash}`;

    // Try L2 Redis cache first (non-fatal)
    try {
      const cached = await redisClient.getJSON(cacheKey);
      if (cached && Array.isArray(cached)) {
        performanceMonitor.incrementCounter('embed.cache_hit');
        return cached;
      }
      performanceMonitor.incrementCounter('embed.cache_miss');
    } catch (e) {
      console.warn('Redis embedding lookup failed:', e && e.message ? e.message : e);
    }

    // Local single-flight to avoid duplicate embedding requests in this process
    if (!this.embeddingInFlight) this.embeddingInFlight = new Map();
    if (this.embeddingInFlight.has(hash)) {
      return await this.embeddingInFlight.get(hash);
    }

    const promise = (async () => {
      try {
        const embeddingPromise = performanceMonitor.wrapAsync('openai.embedding', async () => {
          return getOpenAI().embeddings.create({
            model: 'text-embedding-3-small',
            input: normalized,
          });
        }, { textPreview: normalized.slice(0, 100) });

        // Apply timeout to the OpenAI embedding request
        const response = await this._withTimeout(embeddingPromise, this.embeddingTimeoutMs, 'openai.embedding');
        const embedding = response.data[0].embedding;

        // Try to persist to Redis asynchronously
        try {
          await redisClient.setJSON(cacheKey, embedding, 60 * 60 * 24 * 30); // 30 days TTL
        } catch (e) {
          console.warn('Redis set for embedding failed:', e && e.message ? e.message : e);
        }

        return embedding;
      } catch (error) {
        // Distinguish timeout vs other errors for metrics
        if (error && error.code === 'TIMEOUT') {
          performanceMonitor.incrementCounter('embed.timeout');
          console.warn('Embedding request timed out:', error.message);
        } else {
          console.error('Error generating embedding:', error);
        }
        throw error;
      } finally {
        // cleanup in-flight
        try { this.embeddingInFlight.delete(hash); } catch (_) {}
      }
    })();

    this.embeddingInFlight.set(hash, promise);
    return await promise;
  }

  // Store hotel data in vector database (works with both sample and TripAdvisor data)
  async storeHotelData(hotels) {
    try {
      // Ensure Pinecone index is initialized before attempting upserts.
      // initializeIndex is safe to call multiple times: it will no-op if the index already exists.
      if (!this.index) {
        await this.initializeIndex();
      }
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
          Reviews: ${hotel.reviewCount || 0} reviews
          Nearby Attractions: ${hotel.nearbyAttractions?.join(', ') || 'N/A'}
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
      
      // Upsert vectors in batches (instrumented)
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await performanceMonitor.wrapAsync('pinecone.upsert', async () => {
          return this.index.upsert(batch);
        }, { index: this.indexName, batchSize: batch.length });
      }
      
      console.log(`✅ Stored ${vectors.length} hotels in vector database`);
      return true;
    } catch (error) {
      console.error('Error storing hotel data:', error);
      throw error;
    }
  }

  // Search for hotels based on user query
  async searchHotels(query, topK = 5) {
    try {
      // Extract location from query
      const lowerQuery = query.toLowerCase();
      const locations = ['cancun', 'playa del carmen', 'tulum', 'cabo', 'puerto vallarta', 
                        'mexico city', 'cozumel', 'riviera maya', 'guadalajara', 'oaxaca'];
      
      let targetLocation = null;
      for (const loc of locations) {
        if (lowerQuery.includes(loc)) {
          targetLocation = loc;
          break;
        }
      }
      
      // Try L2 retrieval cache in Redis first (avoid embedding + Pinecone when possible)
      const queryHash = crypto.createHash('sha256').update((query || '').toLowerCase().trim()).digest('hex');
      const redisKey = `rag:search:v1:${queryHash}:top${topK}`;
      try {
        const cached = await redisClient.getJSON(redisKey);
        if (cached && cached.hotels && Array.isArray(cached.hotels)) {
          const now = Date.now();
          const age = now - (cached.timestamp || 0);
          const staleAfter = cached.staleAfter || this.cacheTimeout;
          if (age < staleAfter) {
            performanceMonitor.incrementCounter('rag.cache_hit');
            // Fresh L2 cache; return immediately
            return cached.hotels;
          } else if (age < (staleAfter + this.cacheStaleWindow)) {
            // Stale but within stale-while-revalidate window: serve stale and trigger background revalidate
            performanceMonitor.incrementCounter('rag.cache_stale');
            // Fire-and-forget revalidation
            this._backgroundRevalidate(redisKey, query, topK).catch(err => {
              console.warn('Background revalidate failed:', err && err.message ? err.message : err);
            });
            return cached.hotels;
          } else {
            performanceMonitor.incrementCounter('rag.cache_miss');
          }
        } else {
          performanceMonitor.incrementCounter('rag.cache_miss');
        }
      } catch (e) {
        // Non-fatal - continue to compute embedding + query Pinecone
        console.warn('Redis lookup error for retrieval cache:', e && e.message ? e.message : e);
      }

      // Retrieval single-flight across processes using Redis lock.
      // Only one process should query Pinecone for a given queryHash.
      const lockKey = `rag:search:lock:${queryHash}`;
      const lockTtlMs = 5 * 60 * 1000; // 5 minutes lock by default (stale-while-revalidate)
      const waitTimeoutMs = 3000; // how long other processes will poll for the cached result
      const pollIntervalMs = 200;
      const lockId = (crypto.randomUUID && crypto.randomUUID()) || crypto.randomBytes(8).toString('hex');
      
      let lockAcquired = false;
      try {
        // Ensure redis client connected then attempt SET NX PX
        await redisClient.connect();
        try {
          const setRes = await redisClient.client.set(lockKey, lockId, { NX: true, PX: lockTtlMs });
          lockAcquired = setRes === 'OK';
        } catch (e) {
          console.warn('Redis lock attempt failed:', e && e.message ? e.message : e);
          lockAcquired = false;
        }
      } catch (e) {
        console.warn('Redis connection for lock failed:', e && e.message ? e.message : e);
      }

      if (!lockAcquired) {
        // If we didn't get the lock, poll short intervals waiting for another process to populate the L2 cache.
        const start = Date.now();
        let cachedWhileWaiting = null;
        try {
          while (Date.now() - start < waitTimeoutMs) {
            cachedWhileWaiting = await redisClient.getJSON(redisKey);
            if (cachedWhileWaiting && Array.isArray(cachedWhileWaiting)) {
              performanceMonitor.incrementCounter('rag.cache_hit_waiting');
              return cachedWhileWaiting;
            }
            await new Promise(r => setTimeout(r, pollIntervalMs));
          }
        } catch (e) {
          // Non-fatal; we'll fallback to L1 or proceed
          console.warn('Error while polling redis for cached retrieval result:', e && e.message ? e.message : e);
        }

        // After waiting, try serving L1 (in-memory) stale result if available
        const l1Key = (query || '').toLowerCase().trim();
        const l1Cached = this._getFromCache(l1Key);
        if (l1Cached) {
          performanceMonitor.incrementCounter('rag.l1_fallback_after_lock_wait');
          return l1Cached;
        }

        // No L2 or L1 available within wait window — proceed to generate embedding and query Pinecone.
        // We intentionally do NOT hold the redis lock here (lock is held by another process or failed).
        performanceMonitor.incrementCounter('rag.lock_bypass');
      }

      // If we acquired the lock (or are bypassing because nobody seeded cache), generate embedding and query Pinecone.
      let queryEmbedding;
      try {
        queryEmbedding = await this._withTimeout(this.generateEmbedding(query), this.embeddingTimeoutMs, 'embedding');
      } catch (embedErr) {
        // Embedding timed out or failed - serve best available cache (L1 or L2) and trigger background refresh
        performanceMonitor.incrementCounter('rag.embed_stage_timeout');
        console.warn('Embedding stage failed or timed out, attempting to serve cached results:', embedErr && embedErr.message ? embedErr.message : embedErr);

        // Try L2 again
        try {
          const cached = await redisClient.getJSON(redisKey);
          if (cached && cached.hotels && Array.isArray(cached.hotels)) {
            // Trigger background refresh
            this._backgroundRevalidate(redisKey, query, topK).catch(() => {});
            return cached.hotels;
          }
        } catch (e) {
          /* ignore */
        }

        // Try L1 in-process cache
        const l1Key = (query || '').toLowerCase().trim();
        const l1Cached = this._getFromCache(l1Key);
        if (l1Cached) {
          // Trigger L1 revalidate
          this._backgroundRevalidateForL1(l1Key, query).catch(() => {});
          return l1Cached;
        }

        // Nothing cached - bubble up error
        throw embedErr;
      }

      // Search in Pinecone - get more results to filter
      let searchResults;
      try {
        const pineconeQueryPromise = performanceMonitor.wrapAsync('pinecone.query', async () => {
          return this.index.query({
            vector: queryEmbedding,
            topK: topK * 3, // Get more results to filter from
            includeMetadata: true,
          });
        }, { index: this.indexName, topK: topK * 3 });

        searchResults = await this._withTimeout(pineconeQueryPromise, this.pineconeTimeoutMs, 'pinecone.query');
      } catch (pineErr) {
        performanceMonitor.incrementCounter('rag.pinecone_timeout');
        console.warn('Pinecone query timed out or failed, attempting to serve cached results:', pineErr && pineErr.message ? pineErr.message : pineErr);

        // Try L2
        try {
          const cached = await redisClient.getJSON(redisKey);
          if (cached && cached.hotels && Array.isArray(cached.hotels)) {
            // Trigger background refresh
            this._backgroundRevalidate(redisKey, query, topK).catch(() => {});
            return cached.hotels;
          }
        } catch (e) {}

        // Try L1
        const l1Key = (query || '').toLowerCase().trim();
        const l1Cached = this._getFromCache(l1Key);
        if (l1Cached) {
          this._backgroundRevalidateForL1(l1Key, query).catch(() => {});
          return l1Cached;
        }

        // No cache available: rethrow
        throw pineErr;
      }
      
      // If we acquired the lock, after obtaining results we will attempt to set the L2 cache and release the lock.
      let shouldReleaseLock = lockAcquired;
      
      // After successful Pinecone query, persist to L2 Redis cache with freshness metadata (non-blocking)
      const formattedMatchesForCache = (searchResults.matches || []).slice(0, topK).map(match => {
        // Minimal formatting for cache: keep metadata and id/score
        return {
          id: match.id,
          score: match.score,
          metadata: match.metadata || {}
        };
      });
      const cachePayload = {
        hotels: formattedMatchesForCache,
        timestamp: Date.now(),
        // staleAfter controls how long this entry is considered fresh
        staleAfter: this.cacheTimeout
      };
      try {
        // Write to Redis asynchronously
        redisClient.setJSON(redisKey, cachePayload, Math.floor((this.cacheTimeout + this.cacheStaleWindow) / 1000)).catch(e => {
          console.warn('Failed to set L2 cache:', e && e.message ? e.message : e);
        });
        performanceMonitor.incrementCounter('rag.cache_set');
      } catch (e) {
        console.warn('Error while scheduling L2 cache set:', e && e.message ? e.message : e);
      }
      
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
      
      // Filter results by location if specified
      let filteredMatches = searchResults.matches;
      if (targetLocation) {
        filteredMatches = searchResults.matches.filter(match => {
          const city = (match.metadata.city || '').toLowerCase();
          const location = (match.metadata.location || '').toLowerCase();
          return city.includes(targetLocation) || location.includes(targetLocation);
        });
        
        // If no exact matches, fall back to all results
        if (filteredMatches.length === 0) {
          filteredMatches = searchResults.matches;
        }
      }
      
      // Take only the requested number of results
      filteredMatches = filteredMatches.slice(0, topK);
      
      // Format results with better data validation
      const hotels = filteredMatches.map((match, index) => {
        // Parse the metadata safely
        let amenities = [];
        let nearbyAttractions = [];
        
        try {
          amenities = JSON.parse(match.metadata.amenities || '[]');
          nearbyAttractions = JSON.parse(match.metadata.nearbyAttractions || '[]');
        } catch (e) {
          console.warn('Error parsing hotel metadata:', e);
        }

        // Ensure amenities is an array and has meaningful content
        if (!Array.isArray(amenities) || amenities.length === 0) {
          // Provide default amenities based on hotel type and location
          const defaultAmenities = this.getDefaultAmenities(match.metadata.type, targetLocation);
          amenities = defaultAmenities;
        }

        // Ensure rating is a number and within valid range
        let rating = parseFloat(match.metadata.rating) || 0;
        if (rating === 0 || rating > 5) {
          // Generate a reasonable rating based on hotel type and score
          rating = this.generateReasonableRating(match.metadata.type, match.score);
        }

        // Ensure description exists and is meaningful
        let description = match.metadata.description || '';
        if (!description || description.length < 20) {
          description = this.generateHotelDescription(match.metadata.name, match.metadata.city, match.metadata.type, amenities);
        }

        // Use existing image or assign a diverse, high-quality placeholder
        const imageUrl = match.metadata.imageUrl || hotelImages[index % hotelImages.length];

        // Ensure price range is valid
        let priceRange = match.metadata.priceRange || '$$$';
        if (!priceRange.includes('$')) {
          priceRange = this.convertPriceRange(priceRange);
        }

        return {
          id: match.id,
          score: match.score,
          name: match.metadata.name,
          location: match.metadata.location,
          city: match.metadata.city,
          state: match.metadata.state || 'Mexico',
          description: description,
          amenities: amenities.filter(a => a && a.trim() !== ''), // Remove empty amenities
          priceRange: priceRange,
          rating: parseFloat(rating.toFixed(1)),
          reviewCount: parseInt(match.metadata.reviewCount) || Math.floor(Math.random() * 400) + 150,
          type: match.metadata.type || 'Hotel',
          imageUrl: imageUrl,
          affiliateLink: match.metadata.affiliateLink || '#',
          nearbyAttractions: nearbyAttractions.filter(a => a && a.trim() !== ''), // Remove empty attractions
          latitude: parseFloat(match.metadata.latitude) || 0,
          longitude: parseFloat(match.metadata.longitude) || 0
        };
      });
      
      return hotels;
    } catch (error) {
      console.error('Error searching hotels:', error);
      throw error;
    }
  }

  // Analyze query intent using simple keyword matching (much faster)
  analyzeQueryIntent(query) {
    const lowerQuery = query.toLowerCase();
    
    // Hotel-related keywords
    const hotelKeywords = ['hotel', 'resort', 'accommodation', 'stay', 'room', 'booking', 'lodge', 'inn', 'suite'];
    const locationKeywords = ['cancun', 'playa del carmen', 'tulum', 'cabo', 'puerto vallarta', 'mexico city', 'cozumel', 'riviera maya'];
    const generalKeywords = ['weather', 'culture', 'food', 'history', 'language', 'currency', 'time', 'flight'];
    
    // Check for hotel-related intent
    const hasHotelKeywords = hotelKeywords.some(keyword => lowerQuery.includes(keyword));
    const hasLocationKeywords = locationKeywords.some(keyword => lowerQuery.includes(keyword));
    const hasGeneralKeywords = generalKeywords.some(keyword => lowerQuery.includes(keyword));
    
    // Determine intent
    let needsHotelSearch = false;
    let responseType = 'general';
    
    if (hasHotelKeywords || (hasLocationKeywords && !hasGeneralKeywords)) {
      needsHotelSearch = true;
      responseType = 'hotels';
    } else if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      responseType = 'greeting';
    }
    
    return {
      needsHotelSearch,
      searchQuery: needsHotelSearch ? query : '',
      responseType
    };
  }

  // Generate AI response with improved context awareness
  async generateAIResponse(userQuery, hotels, sessionId = 'default') {
    try {
      // Get or create conversation history for this session
      if (!this.conversationHistory.has(sessionId)) {
        this.conversationHistory.set(sessionId, []);
      }
      const history = this.conversationHistory.get(sessionId);

      // Build context from hotels if available
      let hotelContext = '';
      if (hotels && hotels.length > 0) {
        hotelContext = hotels.map((hotel, index) => `
          ${index + 1}. ${hotel.name} (${hotel.city}, ${hotel.state})
          - Location: ${hotel.location}
          - Price Range: ${hotel.priceRange}
          - Rating: ${hotel.rating}/5
          - Type: ${hotel.type}
          - Key Amenities: ${hotel.amenities.slice(0, 5).join(', ')}
          - Description: ${hotel.description}
        `).join('\n');
      }

      const systemPrompt = `You are Maya AI, a friendly and knowledgeable FEMALE travel assistant specializing in Mexico hotels and vacations. 
        
        IMPORTANT: You are FEMALE. Use feminine pronouns when referring to yourself (she/her). Your personality is warm, enthusiastic, and helpful - like a knowledgeable friend who loves Mexico.
        
        Key traits:
        - You have deep knowledge about Mexico's destinations, culture, food, and hotels
        - You provide personalized recommendations based on the user's specific needs
        - You remember context from the conversation and build upon previous messages
        - You can answer general travel questions, not just about hotels
        - You share insider tips and local insights
        - You're conversational and friendly, but professional
        
        CRITICAL FORMATTING RULES:
        - NEVER use asterisks (*) for emphasis or formatting
        - NEVER use markdown formatting (no **, *, _, backticks, #, etc.)
        - NEVER use any special formatting characters
        - Write in plain text only
        - For emphasis, use CAPS or write descriptively instead of using formatting
        - When listing hotels, use numbers (1. 2. 3.) without any bold or italic formatting
        
        Response guidelines:
        - Write naturally, as if texting a friend who's planning a trip
        - Be specific and helpful, not generic
        - If asked about something you don't know, admit it and offer to help with what you do know
        - Keep responses concise but informative
        - Use plain text without any formatting symbols
        - If the user asks a general question (not about hotels), answer it naturally without forcing hotel recommendations`;

      // Build conversation messages
      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      // Add conversation history (last 5 exchanges)
      const recentHistory = history.slice(-10);
      messages.push(...recentHistory);

      // Add current query with context
      let userPrompt = userQuery;
      if (hotelContext) {
        userPrompt = `User query: "${userQuery}"
        
        ${hotelContext ? `Here are relevant hotels I found:\n${hotelContext}\n\nProvide a helpful response that naturally incorporates these recommendations if they're relevant to the query.` : ''}
        
        Remember to:
        - Be conversational and natural
        - Use complete sentences without special formatting
        - Provide specific, actionable information
        - Share relevant tips or insights about the area`;
      }

      messages.push({ role: 'user', content: userPrompt });

      // Prepare primary completion request
      const completionPromisePrimary = performanceMonitor.wrapAsync('openai.chat.completion', async () => {
        return getOpenAI().chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: messages,
          temperature: 0.8,
          max_tokens: this.openaiMaxTokens,
        });
      }, { model: 'gpt-4-turbo-preview', messagesCount: messages.length });

      // Try primary completion with configured timeout
      let completion;
      try {
        completion = await this._withTimeout(completionPromisePrimary, this.openaiMaxWaitMs, 'openai.chat.completion');
      } catch (openaiErr) {
        // On timeout or failure, attempt a smaller token fallback before giving up
        performanceMonitor.incrementCounter('openai.completion_timeout_or_error');
        console.warn('OpenAI completion failed or timed out, trying fallback:', openaiErr && openaiErr.message ? openaiErr.message : openaiErr);

        try {
          const fallbackPromise = performanceMonitor.wrapAsync('openai.chat.completion.fallback', async () => {
            return getOpenAI().chat.completions.create({
              model: 'gpt-4-turbo-preview',
              messages: messages,
              temperature: 0.8,
              max_tokens: this.openaiFallbackTokens,
            });
          }, { fallback: true });

          completion = await this._withTimeout(fallbackPromise, this.openaiMaxWaitMs, 'openai.chat.completion.fallback');
        } catch (fallbackErr) {
          // If fallback also fails (likely timeout), produce a graceful local fallback response (best-effort)
          performanceMonitor.incrementCounter('openai.completion_fallback_failed');
          console.warn('OpenAI fallback failed; returning generated fallback message:', fallbackErr && fallbackErr.message ? fallbackErr.message : fallbackErr);

          // Build a simple templated response using the hotel list so the user still gets useful info
          const simpleMessage = (hotels && hotels.length > 0) ? (
            `I found the following hotels that might be a good fit:\n` +
            hotels.slice(0, 5).map((h, i) => `${i + 1}. ${h.name} — ${h.city} — ${h.priceRange} — ${h.rating}/5`).join('\n') +
            `\n\nIf you'd like more details about any of these, I can fetch them for you — it may take a moment.`
          ) : `Sorry, I'm having trouble reaching my AI service right now. I can still look up hotels for you but it may take a little longer.`;

          // Update history with fallback
          history.push({ role: 'user', content: userQuery });
          history.push({ role: 'assistant', content: simpleMessage });
          if (history.length > 20) {
            this.conversationHistory.set(sessionId, history.slice(-20));
          }

          return {
            message: simpleMessage,
            hotels: hotels || []
          };
        }
      }

      const aiResponse = completion.choices[0].message.content;

      // Update conversation history
      history.push({ role: 'user', content: userQuery });
      history.push({ role: 'assistant', content: aiResponse });

      // Keep history size manageable (last 20 messages)
      if (history.length > 20) {
        this.conversationHistory.set(sessionId, history.slice(-20));
      }

      return {
        message: aiResponse,
        hotels: hotels || []
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  }

  // Main RAG pipeline - enhanced with intent analysis, LRU caching and single-flight
  async processUserQuery(query, sessionId = 'default') {
    try {
      // Normalize cache key
      const cacheKey = (query || '').toLowerCase().trim();

      // Single-flight: if this same query is already being processed, reuse its promise
      if (this.inFlight.has(cacheKey)) {
        return await this.inFlight.get(cacheKey);
      }

      const work = (async () => {
        // Try L1 cache (LRU) first
        const cachedHotels = this._getFromCache(cacheKey);
        if (cachedHotels) {
          console.log('Returning cached result for query:', query);
          const response = await this.generateAIResponse(query, cachedHotels, sessionId);
          response.hotels = cachedHotels;
          return response;
        }

        // Analyze intent
        const intent = this.analyzeQueryIntent(query);
        console.log('Query intent:', intent);

        let hotels = [];

        if (intent.needsHotelSearch) {
          // Destination extraction
          const destinations = ['Cancun', 'Playa del Carmen', 'Tulum', 'Cabo San Lucas', 
                               'Puerto Vallarta', 'Mexico City', 'Cozumel', 'Riviera Maya', 
                               'Guadalajara', 'Oaxaca', 'Acapulco', 'Los Cabos', 'Mazatlan'];

          let destination = null;
          for (const dest of destinations) {
            if (query.toLowerCase().includes(dest.toLowerCase())) {
              destination = dest;
              break;
            }
          }

          const destinationCacheKey = destination ? `destination:${destination.toLowerCase()}` : null;
          const cachedDestination = destinationCacheKey ? this._getFromCache(destinationCacheKey) : null;
          if (cachedDestination) {
            console.log('Using cached destination data for:', destination);
            hotels = cachedDestination;
          }

          // If no cached destination results and we have a destination, call TripAdvisor once (with circuit-breaker & timeout)
          if (hotels.length === 0 && destination) {
            if (this._isTripAdvisorOpen()) {
              performanceMonitor.incrementCounter('tripadvisor.skipped_circuit_open');
              console.warn('Skipping TripAdvisor call due to open circuit');
            } else {
              try {
                console.log(`Fetching real-time data from TripAdvisor for ${destination}...`);
                const tripPromise = performanceMonitor.wrapAsync('tripadvisor.search', async () => {
                  return tripAdvisorService.searchMexicoHotels(destination, { limit: 5 });
                }, { destination });

                const tripAdvisorHotels = await this._withTimeout(tripPromise, this.tripAdvisorTimeoutMs, 'tripadvisor.search');

                if (tripAdvisorHotels && tripAdvisorHotels.length > 0) {
                  // Upsert into vector DB and cache destination results
                  await performanceMonitor.wrapAsync('rag.storeHotelData', async () => {
                    return this.storeHotelData(tripAdvisorHotels);
                  }, { count: tripAdvisorHotels.length, destination });

                  hotels = tripAdvisorHotels;
                  if (destinationCacheKey) this._setCache(destinationCacheKey, tripAdvisorHotels);

                  // On success, reset circuit
                  this._resetTripAdvisorCircuit();
                }
              } catch (error) {
                // On TripAdvisor failure/timeouts, record a failure and fall back to vector search
                console.warn('TripAdvisor fetch failed or timed out, falling back to vector search:', error && error.message ? error.message : error);
                this._recordTripAdvisorFailure();
              }
            }
          }

          // Fallback to vector search
          if (hotels.length === 0) {
            const searchQuery = intent.searchQuery || query;
            hotels = await this.searchHotels(searchQuery, 5);
          }

          // Cache the resolved hotels for this query
          this._setCache(cacheKey, hotels);
        }

        // Generate AI response
        let response;
        try {
          response = await this.generateAIResponse(query, hotels, sessionId);
        } catch (aiErr) {
          console.warn('AI response generation failed; serving best-available cached result if present:', aiErr && aiErr.message ? aiErr.message : aiErr);
          // If AI generation fails, serve L1 or L2 cached hotels with a simple message
          const l1Cached = this._getFromCache(cacheKey);
          if (l1Cached) {
            const simpleMessage = `Here are some cached hotel suggestions I found while the assistant is temporarily unavailable:\n` +
              l1Cached.slice(0, 5).map((h, i) => `${i + 1}. ${h.name} — ${h.city} — ${h.priceRange} — ${h.rating}/5`).join('\n');
            response = { message: simpleMessage, hotels: l1Cached };
            // Trigger background refresh
            this._backgroundRevalidateForL1(cacheKey, query).catch(() => {});
          } else {
            // Try L2
            try {
              const queryHash = crypto.createHash('sha256').update((query || '').toLowerCase().trim()).digest('hex');
              const redisKey = `rag:search:v1:${queryHash}:top5`;
              const cached = await redisClient.getJSON(redisKey);
              if (cached && cached.hotels && Array.isArray(cached.hotels)) {
                const simpleMessage = `Here are some cached hotel suggestions I found while the assistant is temporarily unavailable:\n` +
                  cached.hotels.slice(0, 5).map((h, i) => `${i + 1}. ${h.metadata.name} — ${h.metadata.city || ''}`).join('\n');
                response = { message: simpleMessage, hotels: cached.hotels };
                this._backgroundRevalidate(redisKey, query, 5).catch(() => {});
              }
            } catch (e) {
              /* ignore */
            }
          }

          // If still nothing, return generic failure message
          if (!response) {
            response = {
              message: "I'm having trouble generating a rich response right now. I can still look up hotels for you, but it may take a moment.",
              hotels: []
            };
          }
        }

        response.hotels = response.hotels || hotels;
        return response;
      })();

      // Register the in-flight promise and ensure cleanup
      this.inFlight.set(cacheKey, work);
      try {
        const result = await work;
        return result;
      } finally {
        this.inFlight.delete(cacheKey);
      }
    } catch (error) {
      console.error('Error processing user query:', error);
      return {
        message: "I'm having trouble processing your request right now. Could you try rephrasing your question? I'm here to help with Mexico hotel recommendations and travel advice!",
        hotels: []
      };
    }
  }

  // Helper method to get default amenities based on hotel type and location
  getDefaultAmenities(hotelType, location) {
    const baseAmenities = ['WiFi', 'Air Conditioning', 'Room Service'];
    
    if (hotelType === 'Resort') {
      return [...baseAmenities, 'Pool', 'Beach Access', 'Restaurant', 'Spa', 'All-Inclusive'];
    } else if (hotelType === 'Boutique') {
      return [...baseAmenities, 'Unique Design', 'Personalized Service', 'Restaurant', 'Bar'];
    } else if (hotelType === 'Luxury') {
      return [...baseAmenities, 'Concierge', 'Spa', 'Fine Dining', 'Butler Service', 'Premium Location'];
    } else if (location && location.includes('beach')) {
      return [...baseAmenities, 'Beach Access', 'Pool', 'Restaurant'];
    }
    
    return baseAmenities;
  }

  // Helper method to generate reasonable ratings
  generateReasonableRating(hotelType, score) {
    let baseRating = 3.5;
    
    if (hotelType === 'Luxury') {
      baseRating = 4.2;
    } else if (hotelType === 'Resort') {
      baseRating = 4.0;
    } else if (hotelType === 'Boutique') {
      baseRating = 3.8;
    }
    
    // Adjust based on search score
    if (score > 0.8) {
      baseRating += 0.5;
    } else if (score > 0.6) {
      baseRating += 0.2;
    }
    
    // Add some randomness but keep it reasonable
    const randomAdjustment = (Math.random() - 0.5) * 0.4;
    const finalRating = Math.max(3.0, Math.min(5.0, baseRating + randomAdjustment));
    
    return parseFloat(finalRating.toFixed(1));
  }

  // Helper method to generate hotel descriptions
  generateHotelDescription(name, city, type, amenities) {
    const templates = {
      'Resort': `Experience luxury and relaxation at ${name} in ${city}. This beautiful resort offers world-class amenities and exceptional service in a stunning location.`,
      'Boutique': `Discover the unique charm of ${name}, a boutique hotel in ${city} that combines personalized service with distinctive style and character.`,
      'Luxury': `Indulge in the ultimate luxury experience at ${name} in ${city}. This premium hotel offers unparalleled comfort and sophisticated elegance.`,
      'Hotel': `Enjoy comfortable accommodations and excellent service at ${name} in ${city}. Perfect for both business and leisure travelers.`
    };
    
    const baseDescription = templates[type] || templates['Hotel'];
    
    // Add amenity highlights if available
    if (amenities && amenities.length > 0) {
      const topAmenities = amenities.slice(0, 3).join(', ');
      return `${baseDescription} Features include ${topAmenities} and more.`;
    }
    
    return baseDescription;
  }

  // Helper method to convert price ranges
  convertPriceRange(priceRange) {
    if (!priceRange) return '$$$';
    
    const lower = priceRange.toLowerCase();
    if (lower.includes('budget') || lower.includes('cheap') || lower.includes('low')) {
      return '$$';
    } else if (lower.includes('luxury') || lower.includes('premium') || lower.includes('high')) {
      return '$$$$$';
    } else if (lower.includes('mid') || lower.includes('moderate')) {
      return '$$$';
    } else if (lower.includes('expensive')) {
      return '$$$$';
    }
    
    return '$$$'; // default
  }

  // Lightweight LRU cache helpers (in-memory) with stale-while-revalidate support
  _getFromCache(cacheKey) {
    const entry = this.queryCache.get(cacheKey);
    if (!entry) return null;

    const now = Date.now();
    const age = now - (entry.timestamp || 0);
    const staleAfter = entry.staleAfter || this.cacheTimeout;

    // Fresh entry
    if (age < staleAfter) {
      // Move to end to mark as recently used
      this.queryCache.delete(cacheKey);
      this.queryCache.set(cacheKey, entry);
      return entry.hotels;
    }

    // Stale but within stale-while-revalidate window -> serve stale and trigger background revalidate
    if (age < (staleAfter + this.cacheStaleWindow)) {
      performanceMonitor.incrementCounter('rag.l1_stale');
      // Fire-and-forget revalidation to refresh L2 (and optionally L1)
      // entry.query may contain original query string; fall back to cacheKey if absent
      const originalQuery = entry.query || cacheKey;
      this._backgroundRevalidateForL1(cacheKey, originalQuery).catch(err => {
        console.warn('L1 background revalidate failed:', err && err.message ? err.message : err);
      });

      // Move to end to mark as recently used
      this.queryCache.delete(cacheKey);
      this.queryCache.set(cacheKey, entry);
      return entry.hotels;
    }

    // Too old, evict
    this.queryCache.delete(cacheKey);
    return null;
  }

  _setCache(cacheKey, hotels, staleAfter = this.cacheTimeout) {
    this.queryCache.set(cacheKey, {
      hotels,
      timestamp: Date.now(),
      staleAfter,
      // store the original query string for background revalidation mapping
      query: cacheKey
    });
    // Enforce max size (evict oldest)
    if (this.queryCache.size > this.cacheMaxSize) {
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }
  }

  // Background revalidation: refresh L2 cache by re-running the retrieval pipeline.
  // This is fire-and-forget and should not block the request that served stale results.
  async _backgroundRevalidate(redisKey, query, topK = 5) {
    try {
      performanceMonitor.incrementCounter('rag.cache_revalidate_start');
      // Re-run retrieval to obtain fresh results (this will generate embeddings and query Pinecone)
      const hotels = await this.searchHotels(query, topK);

      // Store a minimal representation in L2 for quick hits (id, score, metadata)
      const formatted = (hotels || []).slice(0, topK).map(h => ({
        id: h.id,
        score: h.score || 0,
        metadata: {
          name: h.name,
          city: h.city,
          location: h.location,
          state: h.state,
          priceRange: h.priceRange,
          rating: h.rating,
          imageUrl: h.imageUrl,
        }
      }));

      const payload = {
        hotels: formatted,
        timestamp: Date.now(),
        staleAfter: this.cacheTimeout
      };

      // Persist to Redis; TTL covers fresh + stale window
      try {
        await redisClient.setJSON(redisKey, payload, Math.floor((this.cacheTimeout + this.cacheStaleWindow) / 1000));
        performanceMonitor.incrementCounter('rag.cache_revalidated');
      } catch (e) {
        console.warn('Failed to persist revalidated L2 cache:', e && e.message ? e.message : e);
      }

      // Also update L1 in-memory cache for immediate in-process benefit
      const l1Key = (query || '').toLowerCase().trim();
      try {
        this._setCache(l1Key, hotels);
      } catch (e) {
        console.warn('Failed to update L1 cache during revalidate:', e && e.message ? e.message : e);
      }
    } catch (error) {
      console.warn('Background revalidation failed:', error && error.message ? error.message : error);
      performanceMonitor.incrementCounter('rag.cache_revalidate_fail');
    }
  }

  // Background revalidation specifically triggered from L1 stale reads.
  // Uses the original cacheKey to update L1 after fetching fresh results.
  async _backgroundRevalidateForL1(cacheKey, originalQuery, topK = 5) {
    try {
      performanceMonitor.incrementCounter('rag.l1_revalidate_start');
      const hotels = await this.searchHotels(originalQuery, topK);

      // Update L1 with fresh results
      this._setCache(cacheKey, hotels);

      // Also write to L2 so other processes benefit
      const queryHash = crypto.createHash('sha256').update((originalQuery || '').toLowerCase().trim()).digest('hex');
      const redisKey = `rag:search:v1:${queryHash}:top${topK}`;
      const formatted = (hotels || []).slice(0, topK).map(h => ({
        id: h.id,
        score: h.score || 0,
        metadata: {
          name: h.name,
          city: h.city,
          location: h.location,
          state: h.state,
          priceRange: h.priceRange,
          rating: h.rating,
          imageUrl: h.imageUrl,
        }
      }));
      const payload = {
        hotels: formatted,
        timestamp: Date.now(),
        staleAfter: this.cacheTimeout
      };
      try {
        await redisClient.setJSON(redisKey, payload, Math.floor((this.cacheTimeout + this.cacheStaleWindow) / 1000));
        performanceMonitor.incrementCounter('rag.cache_set');
      } catch (e) {
        console.warn('Failed to set L2 cache during L1 revalidate:', e && e.message ? e.message : e);
      }

      performanceMonitor.incrementCounter('rag.l1_revalidate_success');
    } catch (e) {
      console.warn('L1 background revalidate failed:', e && e.message ? e.message : e);
      performanceMonitor.incrementCounter('rag.l1_revalidate_fail');
    }
  }

  // Clear conversation history for a session
  clearSession(sessionId = 'default') {
    this.conversationHistory.delete(sessionId);
  }
}

export default new RAGService();
