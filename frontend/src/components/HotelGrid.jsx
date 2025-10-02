import { Star, MapPin, DollarSign, ExternalLink, ImageIcon } from 'lucide-react';
import { srcSetFor, srcFor, PLACEHOLDER_IMAGE } from '../lib/sanityImage';
import { useState } from 'react';

function HotelGrid({ hotels }) {
  const [imageErrors, setImageErrors] = useState(new Set());

  // Filter out hotels with insufficient data
  const validHotels = hotels?.filter(hotel => 
    hotel && 
    hotel.name && 
    hotel.name.trim() !== '' &&
    hotel.name !== 'Sample Hotel' &&
    hotel.name !== 'Test Hotel' &&
    hotel.city &&
    hotel.description &&
    hotel.description.trim() !== ''
  ) || [];

  const handleImageError = (hotelId) => {
    setImageErrors(prev => new Set([...prev, hotelId]));
  };

  const renderPriceRange = (priceRange) => {
    // Handle undefined or null priceRange
    if (!priceRange) {
      return (
        <div className="flex items-center">
          <span className="text-sm text-gray-500">Contact for pricing</span>
        </div>
      );
    }
    
    // Handle different price formats
    let dollarCount = 3; // default
    if (typeof priceRange === 'string') {
      if (priceRange.includes('$')) {
        dollarCount = priceRange.length;
      } else if (priceRange.toLowerCase().includes('budget')) {
        dollarCount = 2;
      } else if (priceRange.toLowerCase().includes('luxury')) {
        dollarCount = 5;
      } else if (priceRange.toLowerCase().includes('mid')) {
        dollarCount = 3;
      }
    }
    
    // Ensure dollarCount is within valid range
    dollarCount = Math.max(1, Math.min(5, dollarCount));
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <DollarSign
            key={i}
            className={`h-4 w-4 ${
              i < dollarCount ? 'text-mexico-green' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRating = (rating) => {
    // Ensure rating is a valid number
    const numRating = parseFloat(rating) || 0;
    const displayRating = numRating > 0 ? numRating.toFixed(1) : 'N/A';
    
    return (
      <div className="flex items-center gap-1">
        <Star className="h-5 w-5 text-mexico-gold fill-current" />
        <span className="font-semibold">{displayRating}</span>
        {numRating > 0 && <span className="text-gray-500">/5</span>}
      </div>
    );
  };

  const getHotelImage = (hotel) => {
    // Curated high-quality hotel images for different types
    const hotelImages = {
      'Resort': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
      'Boutique': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'Luxury': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
      'Hotel': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'default': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80'
    };

    // Prefer Sanity-uploaded image asset URL if present
    if (hotel.images && hotel.images.length > 0 && hotel.images[0].url && !imageErrors.has(hotel.id)) {
      return hotel.images[0].url;
    }

    // If hotel has a valid image URL and it hasn't errored, use it
    if (hotel.imageUrl && !imageErrors.has(hotel.id)) {
      return hotel.imageUrl;
    }

    // Otherwise use a type-appropriate fallback
    return hotelImages[hotel.type] || hotelImages.default;
  };

  if (!validHotels || validHotels.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No hotels found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or ask Pepe for different recommendations.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {validHotels.map((hotel) => (
        <div key={hotel.id} className="card overflow-hidden group flex flex-col h-full">
          {/* Hotel Image */}
          <div className="relative h-48 overflow-hidden bg-gray-200">
            {(() => {
              const imgObj = hotel.images && hotel.images[0];
              if (imgObj && imgObj.asset) {
                const srcSet = srcSetFor(imgObj.asset);
                const src = srcFor(imgObj.asset, 800);

                // If srcFor couldn't produce a URL (e.g. Sanity not configured), fall back to curated images
                const finalSrc = src || getHotelImage(hotel) || PLACEHOLDER_IMAGE;

                return (
                  <img
                    src={finalSrc}
                    srcSet={srcSet || undefined}
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    alt={(imgObj && imgObj.alt) || hotel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={() => handleImageError(hotel.id)}
                    loading="lazy"
                  />
                );
              }

              return (
                <img
                  src={getHotelImage(hotel)}
                  alt={(hotel.images && hotel.images[0] && hotel.images[0].alt) || hotel.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={() => handleImageError(hotel.id)}
                  loading="lazy"
                />
              );
            })()}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-md">
              <span className="text-sm font-semibold text-mexico-green">
                {hotel.type || 'Hotel'}
              </span>
            </div>
            {/* Overlay gradient for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Hotel Info */}
          <div className="p-5 flex flex-col flex-grow">
            <h3 className="text-xl font-display font-bold text-gray-900 mb-2 line-clamp-2">
              {hotel.name}
            </h3>
            
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate">
                {hotel.city}{hotel.state ? `, ${hotel.state}` : ''}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
              {hotel.description}
            </p>

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {hotel.amenities.slice(0, 3).map((amenity, index) => (
                  <span
                    key={index}
                    className="text-xs bg-sand/50 text-gray-700 px-2 py-1 rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
                {hotel.amenities.length > 3 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{hotel.amenities.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Rating and Price */}
            <div className="flex items-center justify-between mb-4">
              {renderRating(hotel.rating)}
              {renderPriceRange(hotel.priceRange)}
            </div>

            {/* Nearby Attractions */}
            {hotel.nearbyAttractions && hotel.nearbyAttractions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Near:</p>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {hotel.nearbyAttractions.slice(0, 2).join(', ')}
                </p>
              </div>
            )}

            {/* CTA Button */}
            <div className="mt-auto">
              <a
                href={hotel.affiliateLink && hotel.affiliateLink !== '#' ? hotel.affiliateLink : `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name + ' ' + hotel.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
              >
                View Details
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Match Score if available */}
            {hotel.score && hotel.score > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Match Score</span>
                  <div className="flex items-center gap-1">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-mexico-green rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, hotel.score * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {Math.round(Math.min(100, hotel.score * 100))}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HotelGrid;
