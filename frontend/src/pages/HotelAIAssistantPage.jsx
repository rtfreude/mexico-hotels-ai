import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Building2, Sparkles, ExternalLink } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import Header from '../components/Header';
import GoogleMap from '../components/GoogleMap';
import CategorizedResults from '../components/CategorizedResults';

function HotelAIAssistantPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const location = useLocation();

  // Travelocity affiliate configuration
  const TRAVELOCITY_AFFILIATE_ID = 'your-travelocity-affiliate-id';
  const TRAVELOCITY_BASE_URL = 'https://www.travelocity.com/Hotel-Search';

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

  useEffect(() => {
    setAiResponse("¡Hola! I'm Maya, your personal Mexico hotel expert! I'll help you find the perfect hotel for exploring Mexico's cities, experiencing local culture, and enjoying authentic Mexican hospitality. What kind of hotel experience are you looking for?");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-semibold text-gray-800">Hotel AI Assistant</span>
              </div>
              <Header />
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Meet Maya - Your Hotel Expert
            </h1>
            <p className="text-xl mb-6 text-blue-100">
              AI-powered assistant specialized in Mexico hotels and city experiences
            </p>
            <div className="flex items-center justify-center space-x-3 text-blue-200">
              <ExternalLink className="w-5 h-5" />
              <span>Powered by Travelocity Network</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">City Hotels</h3>
              <p className="text-gray-600 text-sm">Perfect for exploring historic centers and cultural attractions</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-gray-600 text-sm">AI-powered suggestions based on your preferences</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <ExternalLink className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Direct Booking</h3>
              <p className="text-gray-600 text-sm">Seamless connection to Travelocity for best rates</p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[600px] flex flex-col">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Chat with Maya</h2>
                <p className="text-gray-600">Ask about hotels, locations, amenities, or get travel advice for Mexico</p>
              </div>

              <div className="flex-1">
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
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Hotel Search</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.open(generateTravelocityLink('Mexico City'), '_blank')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Mexico City Hotels
                </button>
                <button 
                  onClick={() => window.open(generateTravelocityLink('Guadalajara'), '_blank')}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition text-sm"
                >
                  Guadalajara Hotels
                </button>
                <button 
                  onClick={() => window.open(generateTravelocityLink('Puebla'), '_blank')}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition text-sm"
                >
                  Puebla Hotels
                </button>
              </div>
            </div>

            {/* Sample Questions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Try Asking Maya:</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition"
                     onClick={() => setAiResponse("I'd love to help you find hotels in Mexico City! What's your budget and what area would you like to stay in?")}>
                  <p className="text-sm text-gray-700">"Show me hotels in Mexico City near the Zócalo"</p>
                </div>
                <div className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition"
                     onClick={() => setAiResponse("Business hotels are perfect for work trips! I can recommend hotels with meeting rooms, business centers, and convenient locations.")}>
                  <p className="text-sm text-gray-700">"I need a business hotel with meeting facilities"</p>
                </div>
                <div className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition"
                     onClick={() => setAiResponse("Colonial cities offer amazing boutique hotels! Let me suggest some charming properties with authentic Mexican character.")}>
                  <p className="text-sm text-gray-700">"Find boutique hotels in colonial cities"</p>
                </div>
              </div>
            </div>

            {/* Hotel Tips */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Hotel Search Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Specify your preferred neighborhood</li>
                <li>• Mention business vs leisure travel</li>
                <li>• Ask about transportation options</li>
                <li>• Inquire about local attractions nearby</li>
                <li>• Check for special amenities you need</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {(sessionData || hotels.length > 0) && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Hotel Locations</h2>
              <GoogleMap 
                hotels={sessionData?.hotels || hotels || []} 
                restaurants={sessionData?.restaurants || []}
                activities={sessionData?.activities || []}
              />
            </div>

            {/* Categorized Results */}
            <div>
              <CategorizedResults sessionData={sessionData} searchType="hotels" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default HotelAIAssistantPage;