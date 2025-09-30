import { useState, useEffect, useRef } from 'react';
import { Send, Loader, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConversationDisplay from './ConversationDisplay';

function ChatInterface({ 
  setHotels, 
  loading, 
  setLoading, 
  setAiResponse, 
  aiResponse, // Add this prop
  onNewMessage, 
  onSessionDataUpdate 
}) {
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [, setSessionData] = useState(null);
  const [followUpSuggestions, setFollowUpSuggestions] = useState([]);
  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Initialize session ID on component mount
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('pepeAiSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  // Handle initial AI response from auto-search
  useEffect(() => {
    if (aiResponse && messages.length === 0) {
      // Add the AI response to the conversation if it's from auto-search
      setMessages([{ type: 'ai', content: aiResponse }]);
    }
  }, [aiResponse]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (query) => {
    if (!query.trim() || loading) return;

    const userMessage = query.trim();
    setInput('');
    
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    // Add user message to conversation
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    
    // Notify parent component about the user message
    if (onNewMessage) {
      onNewMessage(userMessage, null);
    }
    
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/ai/chat', {
        query: userMessage,
        sessionId: sessionId
      }, {
        signal: abortControllerRef.current.signal,
        timeout: 30000 // 30 second timeout
      });

      const { 
        message, 
        hotels: recommendedHotels, 
        sessionId: newSessionId,
        followUpSuggestions: newFollowUpSuggestions,
        sessionData: newSessionData
      } = response.data;
      
      // Store session ID for future requests
      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId);
        sessionStorage.setItem('pepeAiSessionId', newSessionId);
      }
      
      // Add AI response to conversation
      setMessages(prev => [...prev, { type: 'ai', content: message }]);
      
      // Update organized data
      setSessionData(newSessionData);
      setFollowUpSuggestions(newFollowUpSuggestions || []);
      
      // Pass session data to parent
      if (onSessionDataUpdate && newSessionData) {
        onSessionDataUpdate(newSessionData);
      }
      
      // Notify parent component about the AI response
      if (onNewMessage) {
        onNewMessage(null, message);
      }
      
      setAiResponse(message);
      
      if (recommendedHotels && recommendedHotels.length > 0) {
        setHotels(recommendedHotels);
        toast.success(`Found ${recommendedHotels.length} hotels matching your request!`);
      }
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        console.log('Request was cancelled');
        return;
      }
      
      console.error('Error:', error);
      let errorMessage = 'Failed to get AI response. Please try again.';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timed out. The AI is taking longer than usual. Please try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Add error message to conversation
      setMessages(prev => [...prev, { type: 'ai', content: errorMessage }]);
      
      // Notify parent component about the error message
      if (onNewMessage) {
        onNewMessage(null, errorMessage);
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(input);
  };

  const handleFollowUpClick = (suggestion) => {
    setInput(suggestion);
    handleSubmit(suggestion);
  };

  const clearConversation = async () => {
    if (sessionId) {
      try {
        await axios.post('http://localhost:5001/api/ai/clear-session', {
          sessionId: sessionId
        });
        setMessages([]);
        setSessionData(null);
        setFollowUpSuggestions([]);
        
        // Generate new session ID for fresh start
        const newSessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        setSessionId(newSessionId);
        sessionStorage.setItem('pepeAiSessionId', newSessionId);
        
        // Notify parent that session data is cleared
        if (onSessionDataUpdate) {
          onSessionDataUpdate(null);
        }
        
        toast.success('Conversation cleared!');
      } catch (error) {
        console.error('Error clearing session:', error);
        toast.error('Failed to clear conversation');
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Display */}
      <div className="flex-1 overflow-hidden">
        <ConversationDisplay
          messages={messages}
          loading={loading}
          followUpSuggestions={followUpSuggestions}
          onFollowUpClick={handleFollowUpClick}
        />
      </div>

      {/* Input Form */}
      <div className="flex gap-3 mt-4">
        <form onSubmit={handleFormSubmit} className="flex gap-3 flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Pepe about hotels in Mexico... She's here to help!"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Send</span>
              </>
            )}
          </button>
        </form>
        
        {/* Clear Conversation Button */}
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors duration-200 flex items-center gap-2"
            title="Clear conversation"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatInterface;
