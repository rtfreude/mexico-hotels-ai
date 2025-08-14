import { MessageCircle, ArrowRight } from 'lucide-react';

function FollowUpSuggestions({ suggestions, onSuggestionClick, loading }) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="h-5 w-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-700">You might also ask:</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            disabled={loading}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
          >
            <span>{suggestion}</span>
            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default FollowUpSuggestions;
