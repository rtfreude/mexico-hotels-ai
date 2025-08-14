import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Bot } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import HotelGrid from '../components/HotelGrid';
import Header from '../components/Header';
import SuggestedSearches from '../components/SuggestedSearches';
import GoogleMap from '../components/GoogleMap';
import CategorizedResults from '../components/CategorizedResults';

function SearchPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [sessionData, setSessionData] = useState(null);


  return (
    <div className="min-h-screen bg-gradient-to-br from-sand/20 to-beach-blue/10">
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
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-semibold text-gray-800">AI-Assisted</span>
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
            Discover Your Perfect Mexico Getaway — AI Assisted
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Ask Pepe for personalized hotel recommendations, view results on the map, and explore curated options — all in one place. Pepe AI helps narrow choices and surface the best matches.
          </p>
        </div>

        {/* Suggestions */}
        <div className="max-w-4xl mx-auto mb-6">
          <SuggestedSearches
            setHotels={setHotels}
            setLoading={setLoading}
            setAiResponse={setAiResponse}
          />
        </div>

        {/* Chat area - chat + pro tips side-by-side (responsive) */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat panel - spans 2/3 on large screens */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 flex flex-col min-h-[420px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-2 rounded-full">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Chat with Pepe (AI)</h3>
                    <p className="text-sm text-gray-500">Get personalized recommendations and quick comparisons.</p>
                  </div>
                </div>
                <div className="text-sm text-blue-600 font-medium">AI Assisted</div>
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
                />
              </div>
            </div>

            {/* Pro Tips panel - spans 1/3 on large screens */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-6 h-full flex flex-col">
                <h3 className="text-lg font-bold mb-3">💡 Pro Tips from Pepe</h3>
                <ul className="space-y-2 text-sm text-gray-700 flex-1">
                  <li>• Ask about specific amenities like "adults-only" or "swim-up bars"</li>
                  <li>• Tell Pepe your budget - she'll find the best value for your peso!</li>
                  <li>• Ask about weather, culture, or local food recommendations</li>
                  <li>• Ask Pepe to compare resorts and explain what makes each special</li>
                  <li>• Don't be shy - Pepe loves chatting about Mexico!</li>
                </ul>
                <div className="text-xs text-gray-500 mt-4">Tip: On mobile the tips appear below the chat for easier reading.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map and categorized results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Map + fallback hotel grid */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Map</h2>
              {/* Prefer sessionData.hotels when available, otherwise use hotels state */}
              <GoogleMap hotels={sessionData?.hotels?.length ? sessionData.hotels : hotels} />
              <p className="text-sm text-gray-500 mt-3">
                Markers show hotel locations. Click a marker to open details and center the map.
              </p>
            </div>

            {(!sessionData || (sessionData && !sessionData.hotels)) && hotels.length > 0 && (
              <div className="mt-8">
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
                  Recommended Hotels
                </h2>
                <HotelGrid hotels={hotels} />
              </div>
            )}
          </div>

          {/* Right column - Categorized results (with placeholder when empty) */}
          <div className="mt-0">
            <CategorizedResults sessionData={sessionData} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default SearchPage;
