import crypto from 'crypto';

/**
 * Enhanced in-memory caching service with TTL, LRU eviction, and Redis fallback
 * Designed to replace Redis when it's unavailable while maintaining performance
 */
class EnhancedCacheService {
  constructor() {
    // Multiple cache layers with different TTLs and sizes
    this.quickResponseCache = new Map(); // For greetings - no TTL needed
    this.queryCache = new Map(); // For complete query responses - 1 min TTL
    this.embeddingCache = new Map(); // For embeddings - long TTL
    this.hotelCache = new Map(); // For hotel search results - 30 min TTL
    this.analysisCache = new Map(); // For response analysis - 5 min TTL
    
    // Cache configurations
    this.cacheConfigs = {
      quickResponse: { maxSize: 50, ttl: 0 }, // No TTL for greetings
      query: { maxSize: 100, ttl: 60 * 1000 }, // 1 minute
      embedding: { maxSize: 1000, ttl: 60 * 60 * 1000 }, // 1 hour
      hotel: { maxSize: 200, ttl: 30 * 60 * 1000 }, // 30 minutes
      analysis: { maxSize: 100, ttl: 5 * 60 * 1000 } // 5 minutes
    };
    
    // Start periodic cleanup
    this.startCleanup();
    
    console.log('✅ Enhanced cache service initialized');
  }

  /**
   * Generate a consistent cache key from any input
   */
  generateKey(prefix, ...inputs) {
    const combined = inputs.map(input => {
      if (typeof input === 'object') {
        return JSON.stringify(input);
      }
      return String(input).toLowerCase().trim();
    }).join('::');
    
    return `${prefix}::${crypto.createHash('md5').update(combined).digest('hex')}`;
  }

  /**
   * Generic cache get with TTL check
   */
  get(cacheType, key) {
    const cache = this.getCache(cacheType);
    const config = this.cacheConfigs[cacheType];
    
    if (!cache.has(key)) {
      return null;
    }
    
    const item = cache.get(key);
    
    // Check TTL if configured
    if (config.ttl > 0 && Date.now() - item.timestamp > config.ttl) {
      cache.delete(key);
      return null;
    }
    
    // Update access time for LRU
    item.lastAccess = Date.now();
    
    return item.value;
  }

  /**
   * Generic cache set with size management
   */
  set(cacheType, key, value) {
    const cache = this.getCache(cacheType);
    const config = this.cacheConfigs[cacheType];
    
    // Create cache entry
    const item = {
      value,
      timestamp: Date.now(),
      lastAccess: Date.now()
    };
    
    // Add to cache
    cache.set(key, item);
    
    // Manage cache size using LRU eviction
    if (cache.size > config.maxSize) {
      this.evictLRU(cache, Math.floor(config.maxSize * 0.8)); // Evict to 80% capacity
    }
  }

  /**
   * Get the appropriate cache Map
   */
  getCache(cacheType) {
    switch (cacheType) {
      case 'quickResponse': return this.quickResponseCache;
      case 'query': return this.queryCache;
      case 'embedding': return this.embeddingCache;
      case 'hotel': return this.hotelCache;
      case 'analysis': return this.analysisCache;
      default: throw new Error(`Unknown cache type: ${cacheType}`);
    }
  }

  /**
   * LRU eviction - remove least recently used items
   */
  evictLRU(cache, targetSize) {
    const entries = Array.from(cache.entries())
      .sort(([,a], [,b]) => a.lastAccess - b.lastAccess);
    
    const toDelete = entries.length - targetSize;
    for (let i = 0; i < toDelete; i++) {
      cache.delete(entries[i][0]);
    }
  }

  /**
   * Quick response caching (for greetings)
   */
  getQuickResponse(query) {
    const key = this.generateKey('quick', query);
    return this.get('quickResponse', key);
  }

  setQuickResponse(query, response) {
    const key = this.generateKey('quick', query);
    this.set('quickResponse', key, response);
  }

  /**
   * Query response caching
   */
  getQueryResponse(sessionId, query) {
    const key = this.generateKey('query', sessionId, query);
    return this.get('query', key);
  }

  setQueryResponse(sessionId, query, response) {
    const key = this.generateKey('query', sessionId, query);
    this.set('query', key, response);
  }

  /**
   * Embedding caching
   */
  getEmbedding(text) {
    const key = this.generateKey('embedding', text);
    return this.get('embedding', key);
  }

  setEmbedding(text, embedding) {
    const key = this.generateKey('embedding', text);
    this.set('embedding', key, embedding);
  }

  /**
   * Hotel search caching
   */
  getHotelResults(location, query) {
    const key = this.generateKey('hotel', location || 'general', query);
    return this.get('hotel', key);
  }

  setHotelResults(location, query, hotels) {
    const key = this.generateKey('hotel', location || 'general', query);
    this.set('hotel', key, hotels);
  }

  /**
   * Analysis caching
   */
  getAnalysis(aiMessage, userQuery) {
    const key = this.generateKey('analysis', aiMessage, userQuery);
    return this.get('analysis', key);
  }

  setAnalysis(aiMessage, userQuery, analysis) {
    const key = this.generateKey('analysis', aiMessage, userQuery);
    this.set('analysis', key, analysis);
  }

  /**
   * Periodic cleanup of expired items
   */
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Clean every minute
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    Object.entries(this.cacheConfigs).forEach(([cacheType, config]) => {
      if (config.ttl === 0) return; // Skip caches without TTL
      
      const cache = this.getCache(cacheType);
      const toDelete = [];
      
      cache.forEach((item, key) => {
        if (now - item.timestamp > config.ttl) {
          toDelete.push(key);
        }
      });
      
      toDelete.forEach(key => {
        cache.delete(key);
        cleaned++;
      });
    });

    if (cleaned > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleaned} expired items`);
    }
  }

  /**
   * Clear specific cache type
   */
  clearCache(cacheType) {
    const cache = this.getCache(cacheType);
    const size = cache.size;
    cache.clear();
    console.log(`🧹 Cleared ${cacheType} cache: ${size} items removed`);
  }

  /**
   * Clear all caches
   */
  clearAll() {
    let total = 0;
    Object.keys(this.cacheConfigs).forEach(cacheType => {
      const cache = this.getCache(cacheType);
      total += cache.size;
      cache.clear();
    });
    console.log(`🧹 Cleared all caches: ${total} items removed`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const stats = {};
    Object.keys(this.cacheConfigs).forEach(cacheType => {
      const cache = this.getCache(cacheType);
      const config = this.cacheConfigs[cacheType];
      stats[cacheType] = {
        size: cache.size,
        maxSize: config.maxSize,
        utilization: ((cache.size / config.maxSize) * 100).toFixed(1) + '%',
        ttl: config.ttl
      };
    });
    return stats;
  }

  /**
   * Session management
   */
  clearSession(sessionId) {
    // Clear query cache entries for this session
    const queryCache = this.getCache('query');
    const toDelete = [];
    
    queryCache.forEach((item, key) => {
      if (key.includes(sessionId)) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => queryCache.delete(key));
    console.log(`🧹 Cleared session cache for ${sessionId}: ${toDelete.length} items removed`);
  }
}

export default new EnhancedCacheService();