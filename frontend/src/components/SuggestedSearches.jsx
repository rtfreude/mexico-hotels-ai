import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function SuggestedSearches({ setHotels, setLoading, setAiResponse, maxItems = 14 }) {
  // Local quick suggestions (formerly "Quick Searches")
  const quickPrompts = useMemo(() => ([
    {
      label: 'Best beach resorts in Cancún',
      query: 'Show me the best beach resorts in Cancún with all-inclusive packages',
      type: 'quick',
    },
    {
      label: 'Honeymoon in Riviera Maya',
      query: "I'm planning a honeymoon in Riviera Maya. What are the most romantic hotels?",
      type: 'quick',
    },
    {
      label: 'Family-friendly in Playa del Carmen',
      query: 'Looking for family-friendly hotels in Playa del Carmen with kids activities',
      type: 'quick',
    },
    {
      label: 'Budget hotels in Tulum',
      query: 'What are the best budget-friendly hotels in Tulum near the beach?',
      type: 'quick',
    },
  ]), []);

  const [popular, setPopular] = useState([]);

  useEffect(() => {
    let ignore = false;
    const fetchPopularSearches = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/search/popular');
        if (!ignore && Array.isArray(response.data)) {
          // Normalize to objects with metadata
          const popularAsObjs = response.data.map((label) => ({
            label,
            query: label,
            type: 'popular',
          }));
          setPopular(popularAsObjs);
        }
      } catch {
        // Silent fail to avoid UI noise; still show quick suggestions
      }
    };
    fetchPopularSearches();
    return () => {
      ignore = true;
    };
  }, []);

  // Merge quick + popular, de-duplicate by label (case-insensitive), keep order: quick first then popular
  const suggestions = useMemo(() => {
    const seen = new Set();
    const merged = [];
    const addUnique = (items) => {
      for (const it of items) {
        const key = (it.label || '').trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        merged.push(it);
        if (merged.length >= maxItems) break;
      }
    };
    addUnique(quickPrompts);
    if (merged.length < maxItems) addUnique(popular);
    return merged;
  }, [quickPrompts, popular, maxItems]);

  const handleSuggestionClick = async (sugg) => {
    const query = sugg?.query || sugg?.label || '';
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/ai/chat', {
        query,
      });

      const { message, hotels: recommendedHotels } = response.data || {};
      if (message) setAiResponse(message);

      if (Array.isArray(recommendedHotels) && recommendedHotels.length > 0) {
        setHotels(recommendedHotels);
        toast.success(`Found ${recommendedHotels.length} hotels for "${query}"`);
      } else {
        // No hotels returned, but we may still show AI answer
        toast('Showing AI results', { icon: '🤖' });
        setHotels([]);
      }
    } catch {
      toast.error('Failed to run suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-mexico-gold" />
        <h3 className="text-sm font-semibold text-gray-700">Suggestions</h3>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
        {suggestions.map((s, idx) => (
          <button
            key={`${s.type}-${idx}-${s.label}`}
            onClick={() => handleSuggestionClick(s)}
            className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-mexico-green hover:text-white hover:border-mexico-green transition-colors"
            title={s.label}
          >
            {s.type === 'popular' ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SuggestedSearches;
