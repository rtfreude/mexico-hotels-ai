import { MapPin, Star, Utensils, ExternalLink } from 'lucide-react';

function RestaurantGrid({ restaurants }) {
  if (!restaurants || restaurants.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Utensils className="h-6 w-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-900">Recommended Restaurants</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
            <div className="p-5 flex flex-col flex-grow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                  {restaurant.name}
                </h3>
                {restaurant.cuisine && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                    {restaurant.cuisine}
                  </span>
                )}
              </div>
              
              {restaurant.location && (
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{restaurant.location}</span>
                </div>
              )}

              {restaurant.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {restaurant.description}
                </p>
              )}

              {restaurant.priceRange && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">Price:</span>
                  <span className="text-sm text-orange-600">{restaurant.priceRange}</span>
                </div>
              )}

              {restaurant.highlights && restaurant.highlights.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {restaurant.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Spacer to push button to bottom */}
              <div className="flex-grow"></div>

              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                <span>View Details</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RestaurantGrid;
