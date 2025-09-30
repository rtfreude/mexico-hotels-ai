import express from 'express';
import ragService from '../services/rag-ultra-optimized.service.js';
import responseOrganizerService from '../services/response-organizer.service.js';
import performanceMonitor from '../utils/performance.js';
import crypto from 'crypto';

const router = express.Router();

// Process user query with optimized RAG
router.post('/chat', async (req, res) => {
  const requestId = `chat-${Date.now()}`;
  performanceMonitor.setCorrelationId(requestId);
  performanceMonitor.startTimer(requestId);
  
  try {
    const { query, sessionId } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Generate session ID if not provided
    const session = sessionId || crypto.randomBytes(16).toString('hex');
    
    console.log('Processing query:', query, 'Session:', session);
    
    // Determine user intent flags early so they can be used throughout processing
    const lowerQuery = (query || '').toLowerCase();
    const userAskedRestaurants = /restaurant|restaurants|food|dining|eat|cafe|bar|menu/.test(lowerQuery);
    const userAskedActivities = /activity|activities|tour|tours|excursion|excursions|things to do|attraction|attractions|sightseeing/.test(lowerQuery);
    const userAskedHotels = /hotel|hotels|resort|resorts|stay|stays|accommodation|accommodations|hostel|hostels|inn|lodging|airbnb|bnb/.test(lowerQuery);
    
    // Set response headers for potential streaming
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    performanceMonitor.startTimer(`${requestId}-rag`);
    
    // Process query with ultra-optimized service
    const response = await ragService.processUserQuery(query, session);
    
    performanceMonitor.endTimer(`${requestId}-rag`);
    
    // Skip post-processing for quick responses (greetings) to improve performance
    const queryLower = query.toLowerCase().trim();
    const isQuickResponse = ['hello', 'hi', 'hey', 'help', 'hola', 'good morning', 'good afternoon', 'good evening'].includes(queryLower) || 
                           queryLower.match(/^(hi|hello|hey)!?$/);
    
    let organizedData = null;
    let followUpSuggestions = [];
    
    if (!isQuickResponse && response.message.length > 50) {
      // Only run post-processing for complex queries
      performanceMonitor.startTimer(`${requestId}-postprocess`);
      
      const [organizedDataResult, followUpSuggestionsResult] = await Promise.all([
        responseOrganizerService.analyzeAndOrganizeResponse(response.message, query, session),
        responseOrganizerService.generateFollowUpSuggestions(session, query)
      ]).catch(error => {
        console.error('Error in post-processing:', error);
        return [null, []];
      });
      
      organizedData = organizedDataResult;
      followUpSuggestions = followUpSuggestionsResult;
      
      performanceMonitor.endTimer(`${requestId}-postprocess`);
    } else {
      // For quick responses, provide minimal organized data and default suggestions
      organizedData = {
        responseType: 'general',
        extractedData: {
          hotels: [],
          restaurants: [],
          activities: [],
          transportation: [],
          general: { tips: [], insights: [] }
        },
        mainFocus: 'Greeting',
        followUpSuggestions: []
      };
      
      followUpSuggestions = [
        "Show me hotels in Cancun",
        "What about Playa del Carmen?",
        "Find luxury resorts in Tulum",
        "Budget hotels in Puerto Vallarta"
      ];
      
      console.log('⚡ Skipped post-processing for quick response');
    }
    
    // Get updated session data after analysis
    let sessionData = responseOrganizerService.getSessionData(session);
    
    // If RAG service has data (especially after location changes), prioritize it
    if (response.hotels || response.restaurants || response.activities) {
      sessionData = {
        hotels: response.hotels || sessionData.hotels || [],
        restaurants: response.restaurants || sessionData.restaurants || [],
        activities: response.activities || sessionData.activities || [],
        transportation: sessionData.transportation || [],
        general: sessionData.general || []
      };
    }
    
    // If we have real hotel data from the RAG service and the user asked for hotels, replace the simplified ones
    if (userAskedHotels && response.hotels && response.hotels.length > 0) {
      // Create a new session data object with full hotel data
      sessionData = {
        ...sessionData,
        hotels: response.hotels
      };
      // Update the organizer's session data to use the full hotel objects
      responseOrganizerService.sessionData.set(session, sessionData);
    }
    
    // NEW LOGIC: Show categories if they have accumulated results in the session
    // This preserves categories across queries for better user experience
    const organized = organizedData || {};
    const extracted = organized.extractedData || {};
    
    const filteredSessionData = { ...sessionData };
    
    // Show restaurants if we have accumulated restaurant results OR user asked in current query
    // This allows restaurants to persist even when asking about activities
    if (!userAskedRestaurants && !(sessionData.restaurants && sessionData.restaurants.length > 0)) {
      filteredSessionData.restaurants = [];
    }
    
    // Show activities if we have accumulated activity results OR user asked in current query  
    // This allows activities to persist even when asking about restaurants
    if (!userAskedActivities && !(sessionData.activities && sessionData.activities.length > 0)) {
      filteredSessionData.activities = [];
    }
    
    // Show hotels if we have accumulated hotel results OR user asked in current query
    // This allows hotels to persist even when asking about restaurants/activities
    if (!userAskedHotels && !(sessionData.hotels && sessionData.hotels.length > 0)) {
      filteredSessionData.hotels = [];
    }
    
    // Return the filtered sessionData to the client (do not mutate the stored session unless full data replacement happened above)
    sessionData = filteredSessionData;

    // Update organized data to be consistent with session-based filtering
    // Show categories in organized data if they have accumulated results OR user asked in current query
    if (organized) {
      try {
        if (!userAskedRestaurants && !(sessionData.restaurants && sessionData.restaurants.length > 0)) {
          if (organized.extractedData) organized.extractedData.restaurants = [];
        }
        if (!userAskedActivities && !(sessionData.activities && sessionData.activities.length > 0)) {
          if (organized.extractedData) organized.extractedData.activities = [];
        }
        if (!userAskedHotels && !(sessionData.hotels && sessionData.hotels.length > 0)) {
          if (organized.extractedData) organized.extractedData.hotels = [];
        }
        // Recompute responseType conservatively
        const remainingTypes = [];
        if (organized.extractedData?.hotels?.length > 0) remainingTypes.push('hotels');
        if (organized.extractedData?.restaurants?.length > 0) remainingTypes.push('restaurants');
        if (organized.extractedData?.activities?.length > 0) remainingTypes.push('activities');
        if (organized.extractedData?.transportation?.length > 0) remainingTypes.push('transportation');
        if (organized.extractedData?.general && (organized.extractedData.general.tips?.length > 0 || organized.extractedData.general.insights?.length > 0)) {
          remainingTypes.push('general');
        }
        organized.responseType = remainingTypes.length === 0 ? 'general' : (remainingTypes.length === 1 ? remainingTypes[0] : 'mixed');
      } catch (e) {
        console.warn('Error sanitizing organizedData:', e);
      }
    }

    performanceMonitor.endTimer(requestId);
    performanceMonitor.logSummary();
    // clear correlation id for request
    performanceMonitor.setCorrelationId(null);

    // Log what we're returning for easier debugging
    console.log('Returning sessionData categories:', {
      hotels: (sessionData.hotels || []).length,
      restaurants: (sessionData.restaurants || []).length,
      activities: (sessionData.activities || []).length
    });
    console.log('Returning organizedData types:', organized?.responseType);

    // Include performance counters in the response for verification (useful for perf harness)
    const perfCounters = Object.fromEntries(performanceMonitor.counters || []);

    // Return complete response with organized data and counters
    res.json({ 
      ...response, 
      sessionId: session,
      organizedData: organized,
      followUpSuggestions: followUpSuggestions || [],
      sessionData,
      responseTime: performanceMonitor.getMetric(requestId)?.duration || 0,
      perfCounters
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    performanceMonitor.endTimer(requestId);
    // clear correlation id for request
    performanceMonitor.setCorrelationId(null);
    res.status(500).json({ 
      error: 'Failed to process query',
      message: error.message 
    });
  }
});

// Stream chat responses (for future implementation)
router.post('/chat/stream', async (req, res) => {
  const requestId = `chat-stream-${Date.now()}`;
  performanceMonitor.startTimer(requestId);
  
  try {
    const { query, sessionId } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const session = sessionId || crypto.randomBytes(16).toString('hex');
    
    const lowerQuery = (query || '').toLowerCase();
    const userAskedHotels = /hotel|hotels|resort|resorts|stay|stays|accommodation|accommodations|hostel|hostels|inn|lodging|airbnb|bnb/.test(lowerQuery);
    
    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', sessionId: session })}\n\n`);
    
    // Process query
    const response = await ragService.processUserQuery(query, session);
    
    // Send the response in chunks for perceived speed
    const chunks = response.message.split('. ');
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i] + (i < chunks.length - 1 ? '. ' : '');
      res.write(`data: ${JSON.stringify({ 
        type: 'message', 
        content: chunk,
        isComplete: i === chunks.length - 1 
      })}\n\n`);
      
      // Small delay between chunks for streaming effect
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Send hotels only if user explicitly asked for hotels
    if (userAskedHotels && response.hotels && response.hotels.length > 0) {
      res.write(`data: ${JSON.stringify({ 
        type: 'hotels', 
        hotels: response.hotels 
      })}\n\n`);
    }
    
    // Send completion signal
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    
    performanceMonitor.endTimer(requestId);
    res.end();
  } catch (error) {
    console.error('Error in streaming chat:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      message: error.message 
    })}\n\n`);
    res.end();
  }
});

// Clear conversation history for a session
router.post('/clear-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId) {
      ragService.clearSession(sessionId);
      responseOrganizerService.clearSession(sessionId);
      res.json({ message: 'Session cleared successfully' });
    } else {
      res.status(400).json({ error: 'Session ID is required' });
    }
  } catch (error) {
    console.error('Error clearing session:', error);
    res.status(500).json({ 
      error: 'Failed to clear session',
      message: error.message 
    });
  }
});

 // Get organized session data
 router.get('/session-data/:sessionId', async (req, res) => {
   try {
     const { sessionId } = req.params;
     
     if (!sessionId) {
       return res.status(400).json({ error: 'Session ID is required' });
     }
     
     // Fetch stored session data and follow-ups
     const sessionData = responseOrganizerService.getSessionData(sessionId);
     const followUpSuggestions = responseOrganizerService.getFollowUpSuggestions(sessionId);
     
     // If we have a recent organized analysis for this session, use it to filter which categories to expose.
     // This prevents previously cached restaurants/activities from appearing if the latest analysis didn't include them.
     const organized = responseOrganizerService.organizedDataCache.get(sessionId) || {};
     const extracted = organized.extractedData || {};
     
     const filteredSessionData = { ...sessionData };
     
     if (!(extracted.hotels && extracted.hotels.length > 0) &&
         !(organized.responseType === 'hotels' || organized.responseType === 'mixed')) {
       filteredSessionData.hotels = [];
     }
     
     if (!(extracted.restaurants && extracted.restaurants.length > 0) &&
         !(organized.responseType === 'restaurants' || organized.responseType === 'mixed')) {
       filteredSessionData.restaurants = [];
     }
     
     if (!(extracted.activities && extracted.activities.length > 0) &&
         !(organized.responseType === 'activities' || organized.responseType === 'mixed')) {
       filteredSessionData.activities = [];
     }
     
     res.json({ 
       sessionData: filteredSessionData,
       followUpSuggestions: followUpSuggestions || []
     });
   } catch (error) {
     console.error('Error getting session data:', error);
     res.status(500).json({ 
       error: 'Failed to get session data',
       message: error.message 
     });
   }
 });

// Get AI suggestions based on preferences (optimized)
router.post('/suggestions', async (req, res) => {
  const requestId = `suggestions-${Date.now()}`;
  performanceMonitor.startTimer(requestId);
  
  try {
    const { preferences, sessionId } = req.body;
    
    // Build a query from preferences
    const queryParts = [];
    if (preferences.location) queryParts.push(`in ${preferences.location}`);
    if (preferences.type) queryParts.push(`${preferences.type} hotel`);
    if (preferences.budget) queryParts.push(`${preferences.budget} price range`);
    if (preferences.amenities?.length) queryParts.push(`with ${preferences.amenities.join(', ')}`);
    
    const query = `Find hotels ${queryParts.join(' ')}`;
    const session = sessionId || crypto.randomBytes(16).toString('hex');
    
    const response = await ragService.processUserQuery(query, session);
    
    performanceMonitor.endTimer(requestId);
    
    res.json({ 
      ...response, 
      sessionId: session,
      responseTime: performanceMonitor.getMetric(requestId)?.duration || 0
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    performanceMonitor.endTimer(requestId);
    res.status(500).json({ 
      error: 'Failed to get suggestions',
      message: error.message 
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'AI Chat Service',
    timestamp: new Date().toISOString()
  });
});

// Cache statistics endpoint for monitoring
router.get('/cache-stats', (req, res) => {
  try {
    const stats = ragService.getCacheStats();
    res.json({
      status: 'ok',
      cacheStats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      error: 'Failed to get cache statistics',
      message: error.message
    });
  }
});

export default router;
