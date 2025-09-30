import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Users, 
  Waves, 
  Palmtree, 
  MapPin, 
  Star, 
  ArrowRight,
  X,
  DollarSign,
  Eye
} from 'lucide-react';

const ResortLocationSelector = ({ selectedCategory = null, onClose }) => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [showResortPreview, setShowResortPreview] = useState(false);
  const [previewResorts, setPreviewResorts] = useState([]);
  const [loadingResorts, setLoadingResorts] = useState(false);
  const navigate = useNavigate();

  // Sample resort data for previews (in a real app, this would come from your API)
  const resortData = {
    'riviera-maya': [
      {
        id: 'grand-velas-rm',
        name: 'Grand Velas Riviera Maya',
        type: 'Luxury',
        rating: 4.9,
        priceRange: '$$$$$',
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80',
        description: 'Ultra-luxury all-inclusive with pristine beaches and world-class spa',
        amenities: ['All-Inclusive', 'Spa', 'Kids Club', 'Beach Access'],
        category: ['luxury', 'family']
      },
      {
        id: 'rosewood-mayakoba',
        name: 'Rosewood Mayakoba',
        type: 'Luxury',
        rating: 4.9,
        priceRange: '$$$$$',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80',
        description: 'Overwater suites and beachfront luxury in pristine lagoon setting',
        amenities: ['Golf Course', 'Spa', 'Marina', 'Fine Dining'],
        category: ['luxury', 'adults-only']
      },
      {
        id: 'hotel-xcaret',
        name: 'Hotel Xcaret Mexico',
        type: 'Resort',
        rating: 4.8,
        priceRange: '$$$$',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
        description: 'All-fun inclusive with unlimited access to adventure parks',
        amenities: ['Park Access', 'Multiple Restaurants', 'Kids Club', 'Entertainment'],
        category: ['family', 'eco-luxury']
      }
    ],
    'los-cabos': [
      {
        id: 'montage-los-cabos',
        name: 'Montage Los Cabos',
        type: 'Luxury',
        rating: 4.8,
        priceRange: '$$$$$',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80',
        description: 'Sophisticated desert luxury with ocean views',
        amenities: ['Golf Course', 'Spa', 'Fine Dining', 'Beach Club'],
        category: ['luxury', 'adults-only']
      },
      {
        id: 'pueblo-bonito-pacifica',
        name: 'Pueblo Bonito Pacifica',
        type: 'Resort',
        rating: 4.6,
        priceRange: '$$$$',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80',
        description: 'Adults-only all-inclusive with award-winning spa',
        amenities: ['Adults Only', 'All-Inclusive', 'Spa', 'Golf Nearby'],
        category: ['adults-only', 'luxury']
      }
    ],
    'puerto-vallarta': [
      {
        id: 'four-seasons-punta-mita',
        name: 'Four Seasons Resort Punta Mita',
        type: 'Luxury',
        rating: 4.9,
        priceRange: '$$$$$',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80',
        description: 'Championship golf and pristine beaches in Riviera Nayarit',
        amenities: ['Golf Course', 'Beach Access', 'Kids Club', 'Tennis Courts'],
        category: ['luxury', 'family']
      },
      {
        id: 'hyatt-ziva-vallarta',
        name: 'Hyatt Ziva Puerto Vallarta',
        type: 'Resort',
        rating: 4.5,
        priceRange: '$$$',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
        description: 'All-inclusive family resort with private beach cove',
        amenities: ['All-Inclusive', 'Kids Club', 'Multiple Pools', 'Entertainment'],
        category: ['family', 'luxury']
      }
    ],
    'tulum': [
      {
        id: 'azulik-tulum',
        name: 'Azulik Tulum',
        type: 'Boutique',
        rating: 4.7,
        priceRange: '$$$$$',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80',
        description: 'Adults-only eco-resort with unique treehouse villas',
        amenities: ['Adults Only', 'Eco-Friendly', 'Spa', 'Art Gallery'],
        category: ['adults-only', 'eco-luxury']
      },
      {
        id: 'be-tulum',
        name: 'Be Tulum',
        type: 'Resort',
        rating: 4.5,
        priceRange: '$$$$',
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80',
        description: 'Beachfront adults-only resort with bohemian luxury',
        amenities: ['Adults Only', 'Beach Access', 'Spa', 'Beach Club'],
        category: ['adults-only', 'luxury']
      }
    ],
    'cancun': [
      {
        id: 'ritz-carlton-cancun',
        name: 'The Ritz-Carlton Cancun',
        type: 'Luxury',
        rating: 4.7,
        priceRange: '$$$$$',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80',
        description: 'Iconic luxury with pristine beaches and Club Level service',
        amenities: ['Beach Access', 'Spa', 'Fine Dining', 'Kids Club'],
        category: ['luxury', 'family']
      },
      {
        id: 'moon-palace-cancun',
        name: 'Moon Palace Cancun',
        type: 'Resort',
        rating: 4.5,
        priceRange: '$$$$',
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80',
        description: 'Massive all-inclusive with water park and golf course',
        amenities: ['All-Inclusive', 'Water Park', 'Golf Course', 'Kids Club'],
        category: ['family', 'luxury']
      }
    ],
    'playa-del-carmen': [
      {
        id: 'grand-hyatt-playa',
        name: 'Grand Hyatt Playa del Carmen',
        type: 'Luxury',
        rating: 4.6,
        priceRange: '$$$$',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80',
        description: 'Modern luxury resort near Fifth Avenue shopping',
        amenities: ['Beach Access', 'Spa', 'Rooftop Pool', 'Restaurant'],
        category: ['luxury', 'adults-only']
      },
      {
        id: 'secrets-maroma',
        name: 'Secrets Maroma Beach',
        type: 'Resort',
        rating: 4.7,
        priceRange: '$$$$',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&q=80',
        description: 'Adults-only all-inclusive on world-renowned beach',
        amenities: ['Adults Only', 'All-Inclusive', 'Beach Access', 'Spa'],
        category: ['adults-only', 'luxury']
      }
    ]
  };

  // Mexico regions with resort data
  const regions = {
    'riviera-maya': {
      name: 'Riviera Maya',
      color: '#10B981',
      description: 'Premier beachfront destination with ancient Mayan heritage',
      resortCount: { luxury: 15, family: 12, adultsOnly: 8, ecoLuxury: 5 },
      highlights: ['Xcaret Parks', 'Cenotes', 'Mayan Ruins', 'White Sand Beaches'],
      topResorts: ['Grand Velas', 'Rosewood Mayakoba', 'Andaz Mayakoba']
    },
    'los-cabos': {
      name: 'Los Cabos',
      color: '#F59E0B',
      description: 'Desert meets ocean in sophisticated luxury',
      resortCount: { luxury: 12, family: 6, adultsOnly: 10, ecoLuxury: 3 },
      highlights: ['El Arco', 'World-Class Golf', 'Sport Fishing', 'Luxury Marinas'],
      topResorts: ['Montage Los Cabos', 'Four Seasons', 'One&Only Palmilla']
    },
    'puerto-vallarta': {
      name: 'Puerto Vallarta',
      color: '#EF4444',
      description: 'Authentic Mexican charm with modern luxury',
      resortCount: { luxury: 8, family: 15, adultsOnly: 6, ecoLuxury: 4 },
      highlights: ['Malecón Boardwalk', 'Colonial Architecture', 'Local Culture', 'Mountain Views'],
      topResorts: ['Four Seasons Punta Mita', 'Grand Velas Vallarta', 'Hyatt Ziva']
    },
    'tulum': {
      name: 'Tulum',
      color: '#8B5CF6',
      description: 'Bohemian luxury meets archaeological wonders',
      resortCount: { luxury: 6, family: 3, adultsOnly: 8, ecoLuxury: 12 },
      highlights: ['Tulum Ruins', 'Cenote Diving', 'Jungle Retreats', 'Beach Clubs'],
      topResorts: ['Azulik', 'Be Tulum', 'Casa Malca']
    },
    'cancun': {
      name: 'Cancún',
      color: '#06B6D4',
      description: 'Vibrant resort destination with endless entertainment',
      resortCount: { luxury: 10, family: 20, adultsOnly: 12, ecoLuxury: 2 },
      highlights: ['Hotel Zone', 'Nightlife', 'Water Parks', 'Shopping'],
      topResorts: ['Ritz-Carlton', 'Moon Palace', 'Le Blanc Spa Resort']
    },
    'playa-del-carmen': {
      name: 'Playa del Carmen',
      color: '#EC4899',
      description: 'Trendy beach town with European flair',
      resortCount: { luxury: 7, family: 8, adultsOnly: 9, ecoLuxury: 6 },
      highlights: ['Fifth Avenue', 'Cozumel Ferry', 'Beach Clubs', 'Cenotes'],
      topResorts: ['Rosewood', 'Grand Hyatt', 'Maroma Resort']
    }
  };

  // Resort category mappings
  const categoryInfo = {
    luxury: {
      title: 'Ultra-Luxury',
      icon: <Sparkles className="w-6 h-6" />,
      color: '#F59E0B',
      description: 'Exclusive ultra-premium resorts'
    },
    family: {
      title: 'Family Paradise',
      icon: <Users className="w-6 h-6" />,
      color: '#10B981',
      description: 'Perfect for all ages'
    },
    'adults-only': {
      title: 'Adults-Only',
      icon: <Waves className="w-6 h-6" />,
      color: '#8B5CF6',
      description: 'Sophisticated couple retreats'
    },
    'eco-luxury': {
      title: 'Eco-Luxury',
      icon: <Palmtree className="w-6 h-6" />,
      color: '#059669',
      description: 'Sustainable luxury experiences'
    }
  };

  const handleRegionSelect = async (regionId) => {
    setSelectedRegion(regionId);
    setLoadingResorts(true);
    setShowResortPreview(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter resorts based on selected category if provided
    let regionResorts = resortData[regionId] || [];
    if (selectedCategory) {
      regionResorts = regionResorts.filter(resort => 
        resort.category.includes(selectedCategory)
      );
    }
    
    setPreviewResorts(regionResorts);
    setLoadingResorts(false);
  };

  const handleSearchResorts = (regionId, category = selectedCategory) => {
    const searchParams = new URLSearchParams();
    searchParams.set('destination', regionId);
    if (category) {
      searchParams.set('type', category);
    }
    navigate(`/resorts/search?${searchParams.toString()}`);
  };

  const handleAIAssistant = (regionId, category = selectedCategory) => {
    const searchParams = new URLSearchParams();
    searchParams.set('region', regionId);
    if (category) {
      searchParams.set('category', category);
    }
    navigate(`/resorts/ai-assistant?${searchParams.toString()}`);
  };

  const handleViewAllResorts = () => {
    handleSearchResorts(selectedRegion);
  };

  const renderPriceRange = (priceRange) => {
    const dollarCount = priceRange ? priceRange.length : 3;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <DollarSign
            key={i}
            className={`h-3 w-3 ${
              i < dollarCount ? 'text-green-500' : 'text-gray-400'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRating = (rating) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 text-amber-400 fill-current" />
        <span className="text-sm font-medium text-white">{rating}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-light text-white mb-2">
              {showResortPreview ? `Resorts in ${regions[selectedRegion]?.name}` : 'Choose Your Destination'}
            </h2>
            {selectedCategory && (
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: categoryInfo[selectedCategory]?.color }}
                >
                  {categoryInfo[selectedCategory]?.icon}
                </div>
                <span className="text-amber-400 font-medium">
                  {categoryInfo[selectedCategory]?.title} Resorts
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showResortPreview && (
              <button
                onClick={() => {
                  setShowResortPreview(false);
                  setSelectedRegion(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                ← Back to Map
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {!showResortPreview ? (
            <>
              {/* Map Section */}
              <div className="flex-1 p-6">
                <div className="relative">
                  <svg
                    viewBox="0 0 600 400"
                    className="w-full h-auto bg-gradient-to-br from-blue-900/20 to-teal-900/20 rounded-xl border border-gray-700"
                    style={{ minHeight: '300px' }}
                  >
                    {/* Ocean background */}
                    <defs>
                      <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    <rect width="600" height="400" fill="url(#oceanGradient)" />

                    {/* Mexico Regions */}
                    {Object.entries(regions).map(([regionId, region]) => {
                      const isSelected = selectedRegion === regionId;
                      const isHovered = hoveredRegion === regionId;
                      
                      // Regional coordinates (approximate)
                      const regionCoords = {
                        'cancun': { x: 480, y: 180, w: 80, h: 60 },
                        'riviera-maya': { x: 460, y: 200, w: 100, h: 80 },
                        'tulum': { x: 440, y: 260, w: 70, h: 50 },
                        'playa-del-carmen': { x: 450, y: 220, w: 70, h: 50 },
                        'puerto-vallarta': { x: 180, y: 220, w: 90, h: 70 },
                        'los-cabos': { x: 80, y: 320, w: 120, h: 60 }
                      };

                      const coords = regionCoords[regionId];
                      if (!coords) return null;

                      return (
                        <g key={regionId}>
                          {/* Region Area */}
                          <rect
                            x={coords.x}
                            y={coords.y}
                            width={coords.w}
                            height={coords.h}
                            rx="8"
                            fill={isSelected ? region.color : 'rgba(255,255,255,0.1)'}
                            stroke={isHovered ? region.color : 'rgba(255,255,255,0.3)'}
                            strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                            className="cursor-pointer"
                            onClick={() => handleRegionSelect(regionId)}
                            onMouseEnter={() => setHoveredRegion(regionId)}
                            onMouseLeave={() => setHoveredRegion(null)}
                            style={{
                              filter: isSelected ? 'url(#glow)' : 'none',
                              opacity: isSelected ? 1 : isHovered ? 0.8 : 0.6,
                              transition: 'all 0.2s ease'
                            }}
                          />
                          
                          {/* Region Label */}
                          <text
                            x={coords.x + coords.w/2}
                            y={coords.y + coords.h/2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-sm font-medium pointer-events-none select-none"
                            fill={isSelected ? 'black' : 'white'}
                            style={{
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {region.name}
                          </text>

                          {/* Resort count indicator for selected category */}
                          {selectedCategory && (
                            <circle
                              cx={coords.x + coords.w - 10}
                              cy={coords.y + 10}
                              r="12"
                              fill={categoryInfo[selectedCategory]?.color}
                            />
                          )}
                          {selectedCategory && (
                            <text
                              x={coords.x + coords.w - 10}
                              y={coords.y + 15}
                              textAnchor="middle"
                              className="text-xs font-bold pointer-events-none"
                              fill="white"
                            >
                              {region.resortCount[selectedCategory] || 0}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Decorative elements */}
                    <g opacity="0.6">
                      {/* Sun */}
                      <circle cx="520" cy="40" r="20" fill="#FCD34D" opacity="0.8" />
                      
                      {/* Stars */}
                      {[...Array(8)].map((_, i) => (
                        <circle
                          key={i}
                          cx={50 + i * 70}
                          cy={30 + (i % 3) * 15}
                          r="1.5"
                          fill="#FCD34D"
                          opacity="0.7"
                        />
                      ))}
                    </g>
                  </svg>

                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-4 h-4 bg-gray-600 rounded border border-gray-500"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-4 h-4 bg-green-500 rounded border border-green-400"></div>
                      <span>Selected</span>
                    </div>
                    {selectedCategory && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-xs text-black font-bold">
                          #
                        </div>
                        <span>Resort Count</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-amber-400 font-medium">
                      <Eye className="w-4 h-4" />
                      <span>Click any location to preview resorts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Panel */}
              <div className="lg:w-96 border-l border-gray-700 bg-gray-800">
                <div className="p-6 text-center">
                  <div className="text-gray-400 mb-4">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-light text-white mb-2">
                      Select a Destination
                    </h3>
                    <p className="text-sm">
                      Click on any region to preview available resorts before making your final choice.
                    </p>
                  </div>

                  {selectedCategory && (
                    <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {categoryInfo[selectedCategory]?.icon}
                        <span className="text-amber-400 font-medium">
                          {categoryInfo[selectedCategory]?.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {categoryInfo[selectedCategory]?.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Resort Preview Section */
            <div className="flex-1 p-6">
              {loadingResorts ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading resort previews...</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-light text-white mb-2">
                      {selectedCategory ? categoryInfo[selectedCategory]?.title : 'Available'} Resorts in {regions[selectedRegion]?.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {previewResorts.length} resort{previewResorts.length !== 1 ? 's' : ''} found
                    </p>
                  </div>

                  {previewResorts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {previewResorts.map((resort) => (
                        <div
                          key={resort.id}
                          className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-amber-400/50 transition-colors"
                        >
                          <div className="relative h-32">
                            <img
                              src={resort.image}
                              alt={resort.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                              {resort.type}
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h4 className="font-medium text-white mb-2 line-clamp-1">
                              {resort.name}
                            </h4>
                            
                            <div className="flex items-center justify-between mb-2">
                              {renderRating(resort.rating)}
                              {renderPriceRange(resort.priceRange)}
                            </div>
                            
                            <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                              {resort.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {resort.amenities.slice(0, 3).map((amenity, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {resort.amenities.length > 3 && (
                                <span className="text-xs text-gray-500 px-2 py-1">
                                  +{resort.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">
                        No {selectedCategory ? categoryInfo[selectedCategory]?.title.toLowerCase() : ''} resorts found
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Try selecting a different region or resort type.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="border-t border-gray-700 pt-6 space-y-3">
                    <button
                      onClick={handleViewAllResorts}
                      className="w-full bg-gradient-to-r from-amber-400 to-yellow-600 text-black py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <span>View All Resorts & Book</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleAIAssistant(selectedRegion)}
                      className="w-full border border-amber-400/50 text-amber-400 py-3 rounded-lg font-light hover:bg-amber-400/10 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Get AI Recommendations</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResortLocationSelector;