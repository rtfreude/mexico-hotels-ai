import { Bot, User, Loader } from 'lucide-react';
import { useEffect, useRef } from 'react';
import FollowUpSuggestions from './FollowUpSuggestions';

function ConversationDisplay({ 
  messages, 
  loading, 
  followUpSuggestions, 
  onFollowUpClick 
}) {
  const containerRef = useRef(null);
  const lastAIRef = useRef(null);
  const lastAIIndex = messages && messages.length ? messages.map(m => m.type).lastIndexOf('ai') : -1;

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.type === 'ai' && lastAIRef.current) {
      lastAIRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col">
      {/* Chat Messages */}
      <div ref={containerRef} className="bg-gray-50 rounded-xl p-6 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="flex justify-start">
              <div className="flex max-w-[80%] flex-row">
                <div className="flex-shrink-0 mr-3">
                  <Bot className="h-8 w-8 text-green-600" />
                </div>
                <div className="px-4 py-3 rounded-lg bg-white border border-gray-200">
                  <p className="whitespace-pre-wrap">¡Hola amigo! I'm Pepe, your personal travel assistant specializing in Mexico vacations. I'm here to help you find the perfect hotels, plan amazing excursions, and share insider tips about Mexico's best destinations. Whether you're looking for a romantic getaway, family adventure, or solo exploration, I've got you covered! What brings you to Mexico?</p>
                </div>
              </div>
            </div>
            <div className="text-center text-gray-500 py-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Try asking:</p>
                <p className="text-sm italic">"Find me a beachfront resort in Cancun with a kids club"</p>
                <p className="text-sm italic">"What are the best restaurants in Tulum?"</p>
                <p className="text-sm italic">"What activities can I do in Puerto Vallarta?"</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                ref={index === lastAIIndex ? lastAIRef : null}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                    {message.type === 'user' ? (
                      <User className="h-8 w-8 text-blue-600" />
                    ) : (
                      <Bot className="h-8 w-8 text-green-600" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center">
                  <Bot className="h-8 w-8 text-green-600 mr-3" />
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg">
                    <Loader className="h-5 w-5 animate-spin text-green-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Follow-up Suggestions */}
      {followUpSuggestions && followUpSuggestions.length > 0 && (
        <FollowUpSuggestions 
          suggestions={followUpSuggestions}
          onSuggestionClick={onFollowUpClick}
          loading={loading}
        />
      )}
    </div>
  );
}

export default ConversationDisplay;
