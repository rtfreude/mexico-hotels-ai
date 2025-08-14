import { useState } from 'react';
import { Search, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function SearchBar({ setHotels, setLoading, setAiResponse }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/search', {
        query: searchQuery.trim(),
        limit: 9
      });

      if (response.data && response.data.length > 0) {
        setHotels(response.data);
        toast.success(`Found ${response.data.length} hotels!`);
      } else {
        toast.info('No hotels found. Try a different search.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search hotels. Please try again.');
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-6">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for hotels, destinations, or amenities..."
          className="w-full px-6 py-4 pr-14 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-mexico-green focus:border-transparent"
          disabled={isSearching}
        />
        <button
          type="submit"
          disabled={isSearching || !searchQuery.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-mexico-green hover:bg-mexico-green/90 text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? (
            <Loader className="h-6 w-6 animate-spin" />
          ) : (
            <Search className="h-6 w-6" />
          )}
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
