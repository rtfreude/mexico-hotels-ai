/**
 * Location Context Service
 * Maintains persistent location context across conversation sessions
 * Remembers user's last searched location for contextual follow-up queries
 */

// Enhanced cache integration can be added later if needed for persistent storage

class LocationContextService {
  constructor() {
    // Map<sessionId, { currentLocation, locationHistory, lastUpdated }>
    this.sessionContexts = new Map();
    
    // Location patterns for extraction
    this.locationPatterns = {
      // Mexican destinations
      'cancun': { normalized: 'Cancun', state: 'Quintana Roo', region: 'Riviera Maya' },
      'playa del carmen': { normalized: 'Playa del Carmen', state: 'Quintana Roo', region: 'Riviera Maya' },
      'tulum': { normalized: 'Tulum', state: 'Quintana Roo', region: 'Riviera Maya' },
      'cozumel': { normalized: 'Cozumel', state: 'Quintana Roo', region: 'Riviera Maya' },
      'riviera maya': { normalized: 'Riviera Maya', state: 'Quintana Roo', region: 'Riviera Maya' },
      'cabo san lucas': { normalized: 'Cabo San Lucas', state: 'Baja California Sur', region: 'Los Cabos' },
      'los cabos': { normalized: 'Los Cabos', state: 'Baja California Sur', region: 'Los Cabos' },
      'cabo': { normalized: 'Cabo San Lucas', state: 'Baja California Sur', region: 'Los Cabos' },
      'puerto vallarta': { normalized: 'Puerto Vallarta', state: 'Jalisco', region: 'Pacific Coast' },
      'vallarta': { normalized: 'Puerto Vallarta', state: 'Jalisco', region: 'Pacific Coast' },
      'mexico city': { normalized: 'Mexico City', state: 'CDMX', region: 'Central Mexico' },
      'cdmx': { normalized: 'Mexico City', state: 'CDMX', region: 'Central Mexico' },
      'guadalajara': { normalized: 'Guadalajara', state: 'Jalisco', region: 'Central Mexico' },
      'oaxaca': { normalized: 'Oaxaca', state: 'Oaxaca', region: 'Southern Mexico' },
      'acapulco': { normalized: 'Acapulco', state: 'Guerrero', region: 'Pacific Coast' },
      'mazatlan': { normalized: 'Mazatlan', state: 'Sinaloa', region: 'Pacific Coast' },
      'san miguel de allende': { normalized: 'San Miguel de Allende', state: 'Guanajuato', region: 'Central Mexico' },
      'merida': { normalized: 'Merida', state: 'Yucatan', region: 'Yucatan Peninsula' },
      'isla mujeres': { normalized: 'Isla Mujeres', state: 'Quintana Roo', region: 'Riviera Maya' }
    };

    console.log('✅ Location Context Service initialized');
  }

  /**
   * Extract location from query text
   */
  extractLocation(query) {
    const lowerQuery = query.toLowerCase();
    
    // Check for exact matches first (longer matches take priority)
    const sortedLocations = Object.keys(this.locationPatterns)
      .sort((a, b) => b.length - a.length);
    
    for (const location of sortedLocations) {
      if (lowerQuery.includes(location)) {
        return {
          detected: location,
          ...this.locationPatterns[location],
          confidence: 'high'
        };
      }
    }
    
    // Check for partial matches or variations
    for (const [key, value] of Object.entries(this.locationPatterns)) {
      const words = key.split(' ');
      if (words.length > 1) {
        // Check if all words are present
        const allWordsPresent = words.every(word => lowerQuery.includes(word));
        if (allWordsPresent) {
          return {
            detected: key,
            ...value,
            confidence: 'medium'
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Update location context for a session
   */
  updateLocationContext(sessionId, query, detectedLocation = null) {
    const location = detectedLocation || this.extractLocation(query);
    
    if (location) {
      if (!this.sessionContexts.has(sessionId)) {
        this.sessionContexts.set(sessionId, {
          currentLocation: null,
          locationHistory: [],
          lastUpdated: null,
          preferences: {}
        });
      }
      
      const context = this.sessionContexts.get(sessionId);
      
      // Update current location if it's different
      if (!context.currentLocation || context.currentLocation.normalized !== location.normalized) {
        // Add previous location to history
        if (context.currentLocation) {
          context.locationHistory.unshift({
            ...context.currentLocation,
            usedAt: context.lastUpdated
          });
          // Keep only last 5 locations
          context.locationHistory = context.locationHistory.slice(0, 5);
        }
        
        context.currentLocation = location;
        context.lastUpdated = Date.now();
        
        console.log(`📍 Location context updated for session ${sessionId}: ${location.normalized}`);
        
        // Update in-memory storage (caching will be handled by enhanced cache methods when needed)
        this.sessionContexts.set(sessionId, context);
        
        return true; // Location was updated
      }
    }
    
    return false; // No location update
  }

  /**
   * Get current location context for a session
   */
  getLocationContext(sessionId) {
    return this.sessionContexts.get(sessionId) || {
      currentLocation: null,
      locationHistory: [],
      lastUpdated: null,
      preferences: {}
    };
  }

  /**
   * Get current location for a session (simplified)
   */
  getCurrentLocation(sessionId) {
    const context = this.getLocationContext(sessionId);
    return context.currentLocation;
  }

  /**
   * Check if query needs location context
   */
  needsLocationContext(query) {
    const lowerQuery = query.toLowerCase();
    
    // Queries that benefit from location context
    const contextualPatterns = [
      /restaurant|food|dining|eat|cafe|bar/i,
      /activity|activities|tour|excursion|attraction|sightseeing/i,
      /near|nearby|around|close to|in the area/i,
      /what.*do|where.*go|how.*get/i,
      /beach|pool|spa|nightlife|shopping/i,
      /transport|taxi|bus|airport|getting around/i
    ];
    
    return contextualPatterns.some(pattern => pattern.test(lowerQuery)) && 
           !this.extractLocation(query); // Only if no explicit location mentioned
  }

  /**
   * Enhance query with location context
   */
  enhanceQueryWithContext(query, sessionId) {
    const currentLocation = this.getCurrentLocation(sessionId);
    
    if (!currentLocation || this.extractLocation(query)) {
      return query; // No context needed or location already specified
    }
    
    if (this.needsLocationContext(query)) {
      return `${query} in ${currentLocation.normalized}`;
    }
    
    return query;
  }

  /**
   * Get location suggestions based on context
   */
  getLocationSuggestions(sessionId) {
    const context = this.getLocationContext(sessionId);
    const suggestions = [];
    
    if (context.currentLocation) {
      const location = context.currentLocation.normalized;
      suggestions.push(
        `What restaurants are good in ${location}?`,
        `What activities can I do in ${location}?`,
        `How do I get around ${location}?`
      );
    }
    
    // Add suggestions from location history
    context.locationHistory.slice(0, 2).forEach(histLocation => {
      suggestions.push(`Tell me about hotels in ${histLocation.normalized}`);
    });
    
    return suggestions.slice(0, 4); // Limit to 4 suggestions
  }

  /**
   * Clear location context for a session
   */
  clearLocationContext(sessionId) {
    this.sessionContexts.delete(sessionId);
    console.log(`🧹 Cleared location context for session ${sessionId}`);
  }

  /**
   * Get context summary for logging/debugging
   */
  getContextSummary(sessionId) {
    const context = this.getLocationContext(sessionId);
    return {
      currentLocation: context.currentLocation?.normalized || 'None',
      locationHistory: context.locationHistory.map(loc => loc.normalized),
      lastUpdated: context.lastUpdated ? new Date(context.lastUpdated).toISOString() : null
    };
  }

  /**
   * Update user preferences based on queries
   */
  updatePreferences(sessionId, queryType, preferences = {}) {
    const context = this.getLocationContext(sessionId);
    
    if (!context.preferences[queryType]) {
      context.preferences[queryType] = {};
    }
    
    Object.assign(context.preferences[queryType], preferences);
    
    // Update in memory
    this.sessionContexts.set(sessionId, context);
  }

  /**
   * Get smart location suggestions based on query intent
   */
  getSmartLocationForQuery(query, sessionId) {
    const currentLocation = this.getCurrentLocation(sessionId);
    const queryLower = query.toLowerCase();
    
    if (!currentLocation) return null;
    
    // For restaurant queries, use current location
    if (/restaurant|food|dining|eat/i.test(queryLower)) {
      return {
        location: currentLocation.normalized,
        reason: 'restaurants near your hotels',
        type: 'restaurants'
      };
    }
    
    // For activity queries, use current location
    if (/activity|activities|tour|excursion|attraction/i.test(queryLower)) {
      return {
        location: currentLocation.normalized,
        reason: 'activities in your area',
        type: 'activities'
      };
    }
    
    // For general "near" queries
    if (/near|nearby|around|close to/i.test(queryLower)) {
      return {
        location: currentLocation.normalized,
        reason: 'near your location',
        type: 'general'
      };
    }
    
    return null;
  }
}

export default new LocationContextService();