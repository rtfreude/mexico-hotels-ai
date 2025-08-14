let openai = null;
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

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

class ResponseOrganizerService {
  constructor() {
    this.responseCategories = {
      hotels: [],
      restaurants: [],
      activities: [],
      transportation: [],
      general: []
    };
    this.sessionData = new Map();
    this.followUpCache = new Map();
    this.organizedDataCache = new Map();
  }

  // Analyze AI response and extract structured data (optimized)
  async analyzeAndOrganizeResponse(aiMessage, userQuery, sessionId = 'default') {
    try {
      console.log('Analyzing response for query:', userQuery);
      console.log('AI message length:', aiMessage.length);
      
      // Skip analysis for very short responses
      if (aiMessage.length < 50) {
        return this.getDefaultAnalysis();
      }

      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo', // Faster model for analysis
        messages: [
          {
            role: 'system',
            content: `You are a response analyzer that extracts structured information from travel assistant responses.

            Analyze the AI response and user query to extract any mentioned:
            - Hotels/accommodations (resorts, hotels, lodges, etc.)
            - Restaurants/dining (restaurants, cafes, bars, food trucks, local eateries, etc.)
            - Activities/attractions (tours, excursions, sightseeing, entertainment, etc.)
            - Transportation options (flights, buses, taxis, car rentals, etc.)
            - General travel information (tips, cultural info, weather, etc.)

            IMPORTANT: Extract ALL details mentioned about each item, including:
            - For Hotels: name, location, price range, amenities, features, ratings, descriptions
            - For Restaurants: name, cuisine type, specialties, location, price range, atmosphere, recommendations
            - For Activities: name, type, location, duration, price, what's included, descriptions

            Return a JSON object with this structure:
            {
              "responseType": "hotels|restaurants|activities|transportation|general|mixed",
              "extractedData": {
                "hotels": [
                  {
                    "name": "Hotel Name",
                    "location": "Specific location",
                    "highlights": ["all features mentioned", "amenities", "special characteristics"],
                    "description": "Any descriptive text about the hotel",
                    "priceRange": "If mentioned",
                    "rating": "If mentioned"
                  }
                ],
                "restaurants": [
                  {
                    "name": "Restaurant Name",
                    "cuisine": "Cuisine type or style",
                    "location": "Specific location",
                    "highlights": ["specialties", "atmosphere", "unique features", "recommendations"],
                    "description": "Any descriptive text about the restaurant",
                    "priceRange": "If mentioned"
                  }
                ],
                "activities": [
                  {
                    "name": "Activity Name",
                    "type": "Activity type",
                    "location": "Specific location",
                    "description": "Full description of the activity",
                    "highlights": ["what's special", "what's included", "duration"],
                    "price": "If mentioned"
                  }
                ],
                "transportation": [
                  {
                    "type": "Type",
                    "description": "Description",
                    "tips": ["tip1", "tip2"]
                  }
                ],
                "general": {
                  "tips": ["tip1", "tip2"],
                  "insights": ["insight1", "insight2"]
                }
              },
              "mainFocus": "What the response primarily addresses",
              "followUpSuggestions": ["suggestion1", "suggestion2", "suggestion3"]
            }

            CRITICAL RULES:
            1. ONLY extract information that is EXPLICITLY mentioned in the AI response
            2. DO NOT invent or add any data that isn't in the response
            3. If the user asked about hotels but the AI only talks about hotels without listing restaurants, DO NOT extract restaurants
            4. Only extract the category of items that the AI actually discusses
            5. Be very strict - if something isn't clearly mentioned, don't include it`
          },
          {
            role: 'user',
            content: `User Query: "${userQuery}"
            
            AI Response: "${aiMessage}"
            
            Please analyze and extract structured information from this response.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1000,
      });

      const analysis = JSON.parse(completion.choices[0].message.content);

      // Sanitize analysis according to product requirement:
      // Only include restaurants/activities in the returned analysis if the user explicitly asked about them.
      const lowerQuery = (userQuery || '').toLowerCase();
      const userAskedRestaurants = /restaurant|restaurants|food|dining|eat|cafe|bar|menu/.test(lowerQuery);
      const userAskedActivities = /activity|activities|tour|tours|excursion|excursions|things to do|attraction|attractions|sightseeing/.test(lowerQuery);
      const userAskedHotels = /hotel|hotels|resort|resorts|stay|stays|accommodation|accommodations|hostel|hostels|inn|lodging|airbnb|bnb/.test(lowerQuery);

      if (!userAskedRestaurants) {
        if (analysis.extractedData && analysis.extractedData.restaurants) {
          analysis.extractedData.restaurants = [];
        }
      }

      if (!userAskedActivities) {
        if (analysis.extractedData && analysis.extractedData.activities) {
          analysis.extractedData.activities = [];
        }
      }

      if (!userAskedHotels) {
        if (analysis.extractedData && analysis.extractedData.hotels) {
          analysis.extractedData.hotels = [];
        }
      }

      // Recompute responseType based on remaining extracted data
      const types = [];
      if (analysis.extractedData?.hotels?.length > 0) types.push('hotels');
      if (analysis.extractedData?.restaurants?.length > 0) types.push('restaurants');
      if (analysis.extractedData?.activities?.length > 0) types.push('activities');
      if (analysis.extractedData?.transportation?.length > 0) types.push('transportation');
      if (analysis.extractedData?.general && (analysis.extractedData.general.tips?.length > 0 || analysis.extractedData.general.insights?.length > 0)) {
        types.push('general');
      }

      if (types.length === 0) {
        analysis.responseType = 'general';
      } else if (types.length === 1) {
        analysis.responseType = types[0];
      } else {
        analysis.responseType = 'mixed';
      }
      
      console.log('Sanitized analysis result:', JSON.stringify(analysis, null, 2));
      
      // Store the organized data for this session (sanitized)
      this.storeOrganizedData(sessionId, analysis, userQuery);
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing response:', error);
      return {
        responseType: 'general',
        extractedData: {
          hotels: [],
          restaurants: [],
          activities: [],
          transportation: [],
          general: { tips: [], insights: [] }
        },
        mainFocus: 'General travel information',
        followUpSuggestions: []
      };
    }
  }

  // Store organized data for a session
  storeOrganizedData(sessionId, analysis, userQuery = '') {
    // Store in cache for quick retrieval
    this.organizedDataCache.set(sessionId, analysis);
    
    if (!this.sessionData.has(sessionId)) {
      this.sessionData.set(sessionId, {
        hotels: [],
        restaurants: [],
        activities: [],
        transportation: [],
        general: []
      });
    }
    
    const sessionData = this.sessionData.get(sessionId);
    
    // Helper function to check for duplicates
    const isDuplicate = (existingItems, newItem, compareField) => {
      return existingItems.some(existing => 
        existing[compareField]?.toLowerCase() === newItem[compareField]?.toLowerCase()
      );
    };
    
    // Only add hotels if the user explicitly asked about hotels.
    const lowerQueryForHotels = (userQuery || '').toLowerCase();
    const userAskedHotels = /hotel|hotels|resort|resorts|stay|stays|accommodation|accommodations|hostel|hostels|inn|lodging|airbnb|bnb/.test(lowerQueryForHotels);

    if (userAskedHotels && analysis.extractedData.hotels?.length > 0) {
      const newHotels = analysis.extractedData.hotels.filter(hotel => 
        !isDuplicate(sessionData.hotels, hotel, 'name')
      );
      // Only add if existing hotels don't have full data (id, amenities, etc.)
      const hasFullHotelData = sessionData.hotels.some(hotel => hotel.id && hotel.amenities);
      if (!hasFullHotelData) {
        sessionData.hotels = [...sessionData.hotels, ...newHotels];
      }
    } else {
      // If the user did not ask about hotels, ensure we clear any previously cached hotels for this session
      sessionData.hotels = [];
    }
    
    // Only add restaurants if the user explicitly asked about dining/food.
    // Per product requirement: do not populate restaurant category unless the user asked for it.
    const lowerQueryForRestaurants = (userQuery || '').toLowerCase();
    const userAskedRestaurants = /restaurant|restaurants|food|dining|eat|cafe|bar|menu/.test(lowerQueryForRestaurants);

    if (userAskedRestaurants && analysis.extractedData.restaurants?.length > 0) {
      const newRestaurants = analysis.extractedData.restaurants.filter(restaurant => 
        !isDuplicate(sessionData.restaurants, restaurant, 'name')
      );
      sessionData.restaurants = [...sessionData.restaurants, ...newRestaurants];
    } else {
      // If the user did not ask about restaurants, ensure we clear any previously cached restaurants for this session
      sessionData.restaurants = [];
    }
    
    // Only add activities if the user explicitly asked about activities/tours/excursions.
    // Per product requirement: do not populate activities category unless the user asked for it.
    const lowerQueryForActivities = (userQuery || '').toLowerCase();
    const userAskedActivities = /activity|activities|tour|tours|excursion|excursions|things to do|attraction|attractions|sightseeing/.test(lowerQueryForActivities);

    if (userAskedActivities && analysis.extractedData.activities?.length > 0) {
      const newActivities = analysis.extractedData.activities.filter(activity => 
        !isDuplicate(sessionData.activities, activity, 'name')
      );
      sessionData.activities = [...sessionData.activities, ...newActivities];
    } else {
      // If the user did not ask about activities, ensure we clear any previously cached activities for this session
      sessionData.activities = [];
    }
    
    // Transportation and general info remain as before
    if (analysis.extractedData.transportation?.length > 0) {
      const newTransportation = analysis.extractedData.transportation.filter(transport => 
        !isDuplicate(sessionData.transportation, transport, 'type')
      );
      sessionData.transportation = [...sessionData.transportation, ...newTransportation];
    }
    
    if (analysis.extractedData.transportation?.length > 0) {
      const newTransportation = analysis.extractedData.transportation.filter(transport => 
        !isDuplicate(sessionData.transportation, transport, 'type')
      );
      sessionData.transportation = [...sessionData.transportation, ...newTransportation];
    }
    
    if (analysis.extractedData.general?.tips?.length > 0 || analysis.extractedData.general?.insights?.length > 0) {
      // For general info, we can allow some duplication as it might be contextually different
      sessionData.general.push(analysis.extractedData.general);
    }
    
    // Keep data manageable (last 20 items per category)
    Object.keys(sessionData).forEach(key => {
      if (Array.isArray(sessionData[key]) && sessionData[key].length > 20) {
        sessionData[key] = sessionData[key].slice(-20);
      }
    });
  }

  // Get organized data for a session
  getSessionData(sessionId) {
    if (!this.sessionData || !this.sessionData.has(sessionId)) {
      return {
        hotels: [],
        restaurants: [],
        activities: [],
        transportation: [],
        general: []
      };
    }
    
    return this.sessionData.get(sessionId);
  }

  // Clear session data
  clearSession(sessionId) {
    if (this.sessionData) {
      this.sessionData.delete(sessionId);
    }
    // Also clear any cached organized analysis and follow-up suggestions related to this session
    if (this.organizedDataCache) {
      this.organizedDataCache.delete(sessionId);
    }
    if (this.followUpCache) {
      // followUpCache may contain keys in formats like "sessionId" or "sessionId:query"
      for (const key of Array.from(this.followUpCache.keys())) {
        if (key === sessionId || key.startsWith(`${sessionId}:`)) {
          this.followUpCache.delete(key);
        }
      }
    }
  }

  // Store follow-up suggestions
  storeFollowUpSuggestions(sessionId, suggestions) {
    this.followUpCache.set(sessionId, suggestions);
  }

  // Get follow-up suggestions
  getFollowUpSuggestions(sessionId) {
    return this.followUpCache.get(sessionId) || [];
  }

  // Get default analysis structure
  getDefaultAnalysis() {
    return {
      responseType: 'general',
      extractedData: {
        hotels: [],
        restaurants: [],
        activities: [],
        transportation: [],
        general: { tips: [], insights: [] }
      },
      mainFocus: 'General travel information',
      followUpSuggestions: []
    };
  }

  // Generate follow-up suggestions based on conversation context (optimized)
  async generateFollowUpSuggestions(sessionId, currentQuery) {
    try {
      // Check cache first
      const cacheKey = `${sessionId}:${currentQuery}`;
      if (this.followUpCache.has(cacheKey)) {
        return this.followUpCache.get(cacheKey);
      }

      const sessionData = this.getSessionData(sessionId);
      
      // Use predefined suggestions for common queries
      const lowerQuery = currentQuery.toLowerCase();
      if (lowerQuery.includes('hotel') || lowerQuery.includes('stay')) {
        const suggestions = [
          "What restaurants are near these hotels?",
          "What activities can I do in this area?",
          "How far is the beach from these hotels?",
          "What's the best way to get around?"
        ];
        this.followUpCache.set(cacheKey, suggestions);
        return suggestions;
      }

      if (lowerQuery.includes('restaurant') || lowerQuery.includes('food')) {
        const suggestions = [
          "What are the must-try local dishes?",
          "Are there any good hotels near these restaurants?",
          "What's the average cost for a meal?",
          "Do I need reservations?"
        ];
        this.followUpCache.set(cacheKey, suggestions);
        return suggestions;
      }

      // For other queries, use AI but with faster model
      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Based on the conversation context and what has been discussed, generate 3-4 relevant follow-up questions the user might want to ask.

            Make the suggestions:
            - Natural and conversational
            - Specific to Mexico travel
            - Building on what's already been discussed
            - Diverse (mix of hotels, restaurants, activities, practical info)

            Return as a JSON array of strings.`
          },
          {
            role: 'user',
            content: `Current query: "${currentQuery}"
            
            Session context:
            - Hotels discussed: ${sessionData.hotels.length}
            - Restaurants mentioned: ${sessionData.restaurants.length}
            - Activities mentioned: ${sessionData.activities.length}
            - Transportation info: ${sessionData.transportation.length}
            
            Generate follow-up suggestions.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 300,
      });

      const result = JSON.parse(completion.choices[0].message.content);
      const suggestions = result.suggestions || this.getDefaultSuggestions();
      
      // Cache the suggestions
      this.followUpCache.set(cacheKey, suggestions);
      
      return suggestions;
    } catch (error) {
      console.error('Error generating follow-up suggestions:', error);
      return this.getDefaultSuggestions();
    }
  }

  // Get default suggestions
  getDefaultSuggestions() {
    return [
      "What about restaurants nearby?",
      "Tell me about activities in the area", 
      "How do I get around?",
      "Any local tips?"
    ];
  }
}

export default new ResponseOrganizerService();
