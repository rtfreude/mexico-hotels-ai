import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Palmtree, Sparkles, ExternalLink, Waves, Star, Utensils } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import Header from '../components/Header';
import GoogleMap from '../components/GoogleMap';
import CategorizedResults from '../components/CategorizedResults';

function ResortAIAssistantPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const location = useLocation();

  // Resort affiliate configurations
  const RESORT_AFFILIATES = {
    palace: {
      code: 'palace-affiliate-id',
      baseUrl: 'https://www.palaceresorts.com/book/',
      name: 'Palace Resorts'
    },
    secrets: {
      code: 'secrets-affiliate-id',
      baseUrl: 'https://www.secretsresorts.com/book/',
      name: 'Secrets Resorts'
    },
    excellence: {
      code: 'excellence-affiliate-id',
      baseUrl: 'https://www.excellenceresorts.com/book/',
      name: 'Excellence Group'
    }
  };

  const generateResortLink = (resortBrand, destination, checkin, checkout, guests = 2) => {
    const affiliate = RESORT_AFFILIATES[resortBrand] || RESORT_AFFILIATES.palace;
    const params = new URLSearchParams({
      destination: destination || 'Mexico',
      startDate: checkin || '',
      endDate: checkout || '',
      rooms: '1',
      adults: guests.toString(),
      affiliateId: affiliate.code
    });
    return `${affiliate.baseUrl}?${params.toString()}`;
  };

  useEffect(() => {
    setAiResponse("¡Hola! I'm Pepe, your personal Mexico resort expert! I specialize in all-inclusive paradise where everything is taken care of - meals, drinks, activities, and pure relaxation. Ready to find your perfect beachfront escape?");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 to-emerald-50/30">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Palmtree className="w-5 h-5 text-teal-600" />
                <span className="text-lg font-semibold text-gray-800">Resort AI Assistant</span>
              </div>
              <Header />
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl p-8 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Meet Pepe - Your Resort Expert
            </h1>
            <p className="text-xl mb-6 text-teal-100">
              AI-powered assistant specialized in Mexico all-inclusive resorts
            </p>
            <div className="flex items-center justify-center space-x-3 text-teal-200">
              <Waves className="w-5 h-5" />
              <span>Direct Resort Partnerships & Exclusive Rates</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Palmtree className="w-12 h-12 text-teal-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All-Inclusive Resorts</h3>
              <p className="text-gray-600 text-sm">Everything included - meals, drinks, activities, and entertainment</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Star className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Luxury & Adults-Only</h3>
              <p className="text-gray-600 text-sm">Premium resorts with sophisticated amenities and experiences</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Utensils className="w-12 h-12 text-cyan-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Family Paradise</h3>
              <p className="text-gray-600 text-sm">Kid-friendly resorts with activities for every family member</p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[600px] flex flex-col">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Chat with Pepe</h2>
                <p className="text-gray-600">Ask about resorts, all-inclusive packages, amenities, or get vacation planning advice</p>
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
                  searchType="resorts"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Featured Resort Brands</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.open(generateResortLink('palace', 'Cancun'), '_blank')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition text-sm"
                >
                  Palace Resorts
                </button>
                <button 
                  onClick={() => window.open(generateResortLink('secrets', 'Riviera Maya'), '_blank')}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition text-sm"
                >
                  Secrets Adults-Only
                </button>
                <button 
                  onClick={() => window.open(generateResortLink('excellence', 'Cabo'), '_blank')}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition text-sm"
                >
                  Excellence Group
                </button>
              </div>
            </div>

            {/* Sample Questions */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Try Asking Pepe:</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition"
                     onClick={() => setAiResponse("Adults-only resorts are perfect for romantic getaways! I can recommend sophisticated properties with premium amenities, gourmet dining, and tranquil atmospheres.")}>
                  <p className="text-sm text-gray-700">"Show me adults-only resorts in Riviera Maya"</p>
                </div>
                <div className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition"
                     onClick={() => setAiResponse("Family resorts are amazing for creating memories! I'll find resorts with kids clubs, family suites, water parks, and activities for all ages.")}>
                  <p className="text-sm text-gray-700">"Find family-friendly all-inclusive resorts"</p>
                </div>
                <div className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition"
                     onClick={() => setAiResponse("Swim-up suites are the ultimate luxury! You can literally swim from your room to the pool. Let me show you resorts with these amazing accommodations.")}>
                  <p className="text-sm text-gray-700">"I want a resort with swim-up suites"</p>
                </div>
              </div>
            </div>

            {/* Resort Tips */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Resort Search Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Specify adults-only vs family-friendly</li>
                <li>• Ask about specialty restaurants</li>
                <li>• Mention preferred room categories</li>
                <li>• Inquire about included activities</li>
                <li>• Ask about spa services and golf</li>
                <li>• Check premium drink inclusions</li>
              </ul>
            </div>

            {/* Resort Categories */}
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  <span>Adults-Only Luxury</span>
                </div>
                <div className="flex items-center">
                  <Utensils className="w-4 h-4 mr-2" />
                  <span>Family All-Inclusive</span>
                </div>
                <div className="flex items-center">
                  <Waves className="w-4 h-4 mr-2" />
                  <span>Beachfront Paradise</span>
                </div>
                <div className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>Ultra-Luxury Suites</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {(sessionData || hotels.length > 0) && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Resort Locations</h2>
              <GoogleMap 
                hotels={sessionData?.hotels || hotels || []} 
                restaurants={sessionData?.restaurants || []}
                activities={sessionData?.activities || []}
              />
            </div>

            {/* Categorized Results */}
            <div>
              <CategorizedResults sessionData={sessionData} searchType="resorts" />
            </div>
          </div>
        )}

        {/* Resort Brand Showcase */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose All-Inclusive Resorts?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Utensils className="w-12 h-12 text-teal-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Unlimited Dining</h3>
              <p className="text-sm text-gray-600">Multiple restaurants, room service, premium bars</p>
            </div>
            <div className="text-center">
              <Waves className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Water Activities</h3>
              <p className="text-sm text-gray-600">Pools, water sports, beach access included</p>
            </div>
            <div className="text-center">
              <Star className="w-12 h-12 text-cyan-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Entertainment</h3>
              <p className="text-sm text-gray-600">Shows, music, activities, kids clubs</p>
            </div>
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Surprises</h3>
              <p className="text-sm text-gray-600">One price covers everything you need</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ResortAIAssistantPage;