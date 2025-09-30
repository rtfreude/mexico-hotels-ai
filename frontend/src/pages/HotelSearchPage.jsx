import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles, Bot, ExternalLink, Building2 } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import HotelGrid from '../components/HotelGrid';
import Header from '../components/Header';
import SuggestedSearches from '../components/SuggestedSearches';
import GoogleMap from '../components/GoogleMap';
import CategorizedResults from '../components/CategorizedResults';

function HotelSearchPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const location = useLocation();

  // Travelocity affiliate configuration
  const TRAVELOCITY_AFFILIATE_ID = 'your-travelocity-affiliate-id';
  const TRAVELOCITY_BASE_URL = 'https://www.travelocity.com/Hotel-Search';

  // Generate Travelocity affiliate link
  const generateTravelocityLink = (destination, checkin, checkout, guests = 2) => {
    const params = new URLSearchParams({
      destination: destination || 'Mexico',
      startDate: checkin || '',
      endDate: checkout || '',
      rooms: '1',
      adults: guests.toString(),
      affiliateId: TRAVELOCITY_AFFILIATE_ID
    });
    return `${TRAVELOCITY_BASE_URL}?${params.toString()}`;
  };

  // Handle parameters from wizard or direct links
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const city = urlParams.get('city');
    const region = urlParams.get('region');
    const checkin = urlParams.get('checkin');
    const checkout = urlParams.get('checkout');
    const guests = urlParams.get('guests');
    const budget = urlParams.get('budget');

    if (city) {
      const cityDisplayName = city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      let query = `Show me hotels in ${cityDisplayName}`;
      
      if (budget && budget !== 'mid-range') {
        query += ` with ${budget} pricing`;
      }
      
      if (checkin && checkout) {
        query += ` from ${checkin} to ${checkout}`;
      }
      
      if (guests && guests !== '2') {
        query += ` for ${guests} guests`;
      }

      console.log('Auto-searching hotels from wizard:', query);
      setAiResponse(`Welcome! I'm searching for ${budget || 'mid-range'} hotels in ${cityDisplayName} based on your selection. Remember, we're focusing on hotels for city exploration and cultural experiences.`);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-semibold text-gray-800">Hotel Search</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-600">AI-Assisted</span>
              </div>
              <Header />
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-3">
            Discover Perfect Hotels in Mexico
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Find the ideal hotel for city exploration, cultural immersion, and authentic Mexican experiences. 
            Our AI assistant helps you discover the perfect location and amenities.
          </p>
          
          {/* Travelocity Partnership Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-4 max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-center space-x-3">
              <ExternalLink className="w-5 h-5" />
              <span className="font-semibold">Powered by Travelocity</span>
              <span className="text-blue-200">•</span>
              <span className="text-sm">Best rates guaranteed</span>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="max-w-4xl mx-auto mb-6">
          <SuggestedSearches
            setHotels={setHotels}
            setLoading={setLoading}
            setAiResponse={setAiResponse}
            type="hotels"
          />
        </div>

        {/* Chat area */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat panel */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 flex flex-col min-h-[420px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-full">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Chat with Maya - Hotel Expert</h3>
                    <p className="text-sm text-gray-500">Specialized in Mexico hotel recommendations</p>
                  </div>
                </div>
                <div className="text-sm text-blue-600 font-medium">Hotel Specialist</div>
              </div>

              <div className="flex-1 flex flex-col">
                <ChatInterface
                  hotels={hotels}
                  setHotels={setHotels}
                  loading={loading}
                  setLoading={setLoading}
                  aiResponse={aiResponse}
                  setAiResponse={setAiResponse}
                  onSessionDataUpdate={setSessionData}
                  searchType="hotels"
                />
              </div>
            </div>

            {/* Hotel Tips panel */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 h-full flex flex-col">
                <h3 className="text-lg font-bold mb-3">🏨 Hotel Search Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700 flex-1">
                  <li>• Ask about location: "near historic center" or "walkable neighborhoods"</li>
                  <li>• Specify amenities: "business center," "fitness room," or "rooftop terrace"</li>
                  <li>• Budget ranges: "budget-friendly," "mid-range," or "luxury"</li>
                  <li>• Transportation: "near metro," "airport shuttle," or "walkable"</li>
                  <li>• Ask about local attractions and cultural sites nearby</li>
                </ul>
                
                {/* Travelocity Quick Search */}
                <div className="mt-6 p-4 bg-white rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Quick Travelocity Search</h4>
                  <button 
                    onClick={() => window.open(generateTravelocityLink(), '_blank')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition flex items-center justify-center text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Browse All Mexico Hotels
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map and categorized results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Map + fallback hotel grid */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Hotel Locations</h2>
              <GoogleMap 
                hotels={sessionData?.hotels || hotels || []} 
                restaurants={sessionData?.restaurants || []}
                activities={sessionData?.activities || []}
              />
              <p className="text-sm text-gray-500 mt-3">
                Map shows hotels (🏨), restaurants (🍽️), and activities (🎯). Click markers for details and booking links.
              </p>
            </div>

            {(!sessionData || (sessionData && !sessionData.hotels)) && hotels.length > 0 && (
              <div className="mt-8">
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
                  Recommended Hotels
                </h2>
                <HotelGrid hotels={hotels} affiliateType="travelocity" />
              </div>
            )}
          </div>

          {/* Right column - Categorized results */}
          <div className="mt-0">
            <CategorizedResults sessionData={sessionData} searchType="hotels" />
          </div>
        </div>

        {/* Featured Hotel Categories */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Popular Hotel Categories in Mexico</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Business Hotels</h3>
              <p className="text-gray-600 text-sm mb-4">Perfect for work trips with meeting facilities and city center locations</p>
              <button 
                onClick={() => window.open(generateTravelocityLink('Mexico City'), '_blank')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Find Business Hotels
              </button>
            </div>
            
            <div className="text-center p-6 bg-indigo-50 rounded-xl">
              <Building2 className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Boutique Hotels</h3>
              <p className="text-gray-600 text-sm mb-4">Unique properties with local character and personalized service</p>
              <button 
                onClick={() => window.open(generateTravelocityLink('San Miguel de Allende'), '_blank')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                Find Boutique Hotels
              </button>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <Building2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Historic Hotels</h3>
              <p className="text-gray-600 text-sm mb-4">Colonial charm and cultural heritage in historic city centers</p>
              <button 
                onClick={() => window.open(generateTravelocityLink('Puebla'), '_blank')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
              >
                Find Historic Hotels
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HotelSearchPage;