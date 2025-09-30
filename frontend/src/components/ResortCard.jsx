import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  MapPin, 
  Users, 
  Wifi, 
  Car, 
  Utensils, 
  Waves, 
  Dumbbell,
  Flower2,
  Wine,
  Baby,
  Heart,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const ResortCard = ({ resort, index = 0 }) => {
  const [imageError, setImageError] = useState(false);

  // Amenity icons mapping
  const amenityIcons = {
    'Beach Access': <Waves className="w-4 h-4" />,
    'All-Inclusive': <Utensils className="w-4 h-4" />,
    'Adults Only': <Heart className="w-4 h-4" />,
    'Kids Club': <Baby className="w-4 h-4" />,
    'Spa': <Flower2 className="w-4 h-4" />,
    'Pool': <Waves className="w-4 h-4" />,
    'WiFi': <Wifi className="w-4 h-4" />,
    'Fitness Center': <Dumbbell className="w-4 h-4" />,
    'Restaurant': <Utensils className="w-4 h-4" />,
    'Bar': <Wine className="w-4 h-4" />,
    'Parking': <Car className="w-4 h-4" />
  };

  const getResortImage = (resort) => {
    if (imageError || !resort.imageUrl) {
      // Fallback to a beautiful resort image based on location
      const fallbackImages = {
        'Cancun': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
        'Riviera Maya': 'https://images.unsplash.com/photo-1570792328831-0c9ce06bf824?w=800&q=80',
        'Tulum': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80',
        'Playa del Carmen': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
        'Los Cabos': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=800&q=80',
        'Puerto Vallarta': 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&q=80'
      };
      
      return fallbackImages[resort.city] || 
             fallbackImages[resort.location] || 
             'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80';
    }
    return resort.imageUrl;
  };

  const renderRating = (rating) => {
    if (!rating) return null;
    const stars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(stars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
        ))}
        {hasHalfStar && <Star className="w-4 h-4 text-amber-400 fill-current opacity-50" />}
        <span className="text-sm font-medium text-gray-700 ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const renderPriceRange = (priceRange) => {
    if (!priceRange) return null;
    
    const priceLabels = {
      '$': 'Budget',
      '$$': 'Moderate',
      '$$$': 'Upscale',
      '$$$$': 'Luxury',
      '$$$$$': 'Ultra-Luxury'
    };
    
    return (
      <div className="flex items-center">
        <span className="text-lg font-bold text-green-600">{priceRange}</span>
        <span className="text-sm text-gray-600 ml-2">
          {priceLabels[priceRange] || 'Premium'}
        </span>
      </div>
    );
  };

  const handleBookingClick = () => {
    const bookingUrl = resort.affiliateLink && resort.affiliateLink !== '#' 
      ? resort.affiliateLink 
      : `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(resort.name + ' ' + resort.city)}`;
    
    window.open(bookingUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
    >
      {/* Resort Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={getResortImage(resort)}
          alt={resort.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Resort Type Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            {resort.type || 'Resort'}
          </span>
        </div>
        
        {/* Price Range Badge */}
        {resort.priceRange && (
          <div className="absolute top-4 right-4">
            <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
              {resort.priceRange}
            </div>
          </div>
        )}
        
        {/* Premium Resort Indicator */}
        {(resort.priceRange === '$$$$' || resort.priceRange === '$$$$$') && (
          <div className="absolute bottom-4 right-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Premium</span>
            </div>
          </div>
        )}
      </div>

      {/* Resort Info */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
            {resort.name}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">
                {resort.city}{resort.state ? `, ${resort.state}` : ''}
              </span>
            </div>
            {renderRating(resort.rating)}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {resort.description}
        </p>

        {/* Amenities */}
        {resort.amenities && resort.amenities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {resort.amenities.slice(0, 6).map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-gray-100 hover:bg-amber-100 px-2 py-1 rounded-full text-xs text-gray-700 transition-colors"
                >
                  {amenityIcons[amenity] || <Star className="w-3 h-3" />}
                  <span className="truncate max-w-20">{amenity}</span>
                </div>
              ))}
              {resort.amenities.length > 6 && (
                <div className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-full text-xs text-gray-600">
                  <span>+{resort.amenities.length - 6} more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nearby Attractions */}
        {resort.nearbyAttractions && resort.nearbyAttractions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Nearby</h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {resort.nearbyAttractions.slice(0, 3).join(' • ')}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            {renderPriceRange(resort.priceRange)}
            <span className="text-xs text-gray-500">per night</span>
          </div>
          
          <button
            onClick={handleBookingClick}
            className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
          >
            <span>View Resort</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResortCard;