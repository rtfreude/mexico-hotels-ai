import { useState, useEffect } from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function PopularSearches({ setHotels, setLoading, setAiResponse }) {
  const [popularSearches, setPopularSearches] = useState([]);

  useEffect(() => {
    fetchPopularSearches();
  }, []);

  const fetchPopularSearches = async () => {
    try {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const response = await axios.get(`${base}/api/search/popular`);
      setPopularSearches(response.data);
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    }
  };

  const handlePopularSearch = async (searchTerm) => {
    setLoading(true);
    try {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const response = await axios.post(`${base}/api/ai/chat`, {
        query: searchTerm
      });

      const { message, hotels: recommendedHotels } = response.data;
      
      setAiResponse(message);
      
      if (recommendedHotels && recommendedHotels.length > 0) {
        setHotels(recommendedHotels);
        toast.success(`Found ${recommendedHotels.length} hotels for "${searchTerm}"!`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-mexico-green" />
        <h3 className="text-sm font-semibold text-gray-700">Popular Searches</h3>
        <Sparkles className="h-4 w-4 text-mexico-gold" />
      </div>
      <div className="flex flex-wrap gap-2">
        {popularSearches.map((search, index) => (
          <button
            key={index}
            onClick={() => handlePopularSearch(search)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-mexico-green hover:text-white hover:border-mexico-green transition-all duration-200"
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PopularSearches;
