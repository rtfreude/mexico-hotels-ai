import { useState } from 'react';
import { Hotel, Utensils, MapPin, ChevronDown, ChevronUp, Package } from 'lucide-react';
import HotelGrid from './HotelGrid';
import RestaurantGrid from './RestaurantGrid';
import ActivitiesGrid from './ActivitiesGrid';

function CategorizedResults({ sessionData }) {
  const [expandedCategories, setExpandedCategories] = useState({
    hotels: true,
    restaurants: true,
    activities: true
  });


  const hotels = sessionData?.hotels || [];
  const restaurants = sessionData?.restaurants || [];
  const activities = sessionData?.activities || [];

  const hasHotels = hotels.length > 0;
  const hasRestaurants = restaurants.length > 0;
  const hasActivities = activities.length > 0;


  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const categories = [
    {
      id: 'hotels',
      name: 'Hotels & Accommodations',
      icon: Hotel,
      color: 'blue',
      count: hotels.length,
      hasData: hasHotels,
      component: <HotelGrid hotels={hotels} />
    },
    {
      id: 'restaurants',
      name: 'Restaurants & Dining',
      icon: Utensils,
      color: 'orange',
      count: restaurants.length,
      hasData: hasRestaurants,
      component: <RestaurantGrid restaurants={restaurants} />
    },
    {
      id: 'activities',
      name: 'Activities & Excursions',
      icon: MapPin,
      color: 'green',
      count: activities.length,
      hasData: hasActivities,
      component: <ActivitiesGrid activities={activities} />
    }
  ];

  return (
    <div className="mt-8 space-y-6">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">Search Results</h2>
            <p className="text-blue-100 mt-1">
              Click on any category below to explore your personalized recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {categories.map((category, index) => {

          const isExpanded = expandedCategories[category.id];
          const Icon = category.icon;
          const colorClasses = {
            blue: {
              bg: 'bg-blue-50',
              border: 'border-blue-200',
              text: 'text-blue-700',
              hover: 'hover:bg-blue-100',
              icon: 'text-blue-600',
              badge: 'bg-blue-600 text-white'
            },
            orange: {
              bg: 'bg-orange-50',
              border: 'border-orange-200',
              text: 'text-orange-700',
              hover: 'hover:bg-orange-100',
              icon: 'text-orange-600',
              badge: 'bg-orange-600 text-white'
            },
            green: {
              bg: 'bg-green-50',
              border: 'border-green-200',
              text: 'text-green-700',
              hover: 'hover:bg-green-100',
              icon: 'text-green-600',
              badge: 'bg-green-600 text-white'
            }
          };

          const colors = colorClasses[category.color];

          return (
            <div key={category.id} className={index > 0 ? 'border-t' : ''}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full px-6 py-4 flex items-center justify-between transition-colors duration-200 ${colors.bg} ${colors.hover}`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                  <h3 className={`text-lg font-semibold ${colors.text}`}>
                    {category.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}>
                    {category.count} {category.count === 1 ? 'result' : 'results'}
                  </span>
                </div>
                <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className={`h-5 w-5 ${colors.text}`} />
                </div>
              </button>

              {/* Category Content */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
              >
                <div className="p-6 bg-gray-50">
                  {category.hasData ? (
                    category.component
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center">
                      <p className="text-gray-600">
                        No {category.id} yet. Use Pepe AI to search and see results here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info Sections */}
      {(sessionData?.transportation?.length > 0 || sessionData?.general?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transportation Tips */}
          {sessionData?.transportation?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span>🚗</span>
                Transportation Tips
              </h3>
              <div className="space-y-4">
                {sessionData.transportation.map((transport, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">{transport.type}</h4>
                    <p className="text-blue-800 text-sm mb-2">{transport.description}</p>
                    {transport.tips && transport.tips.length > 0 && (
                      <ul className="text-blue-700 text-sm space-y-1">
                        {transport.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Tips */}
          {sessionData?.general?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span>💡</span>
                Travel Tips & Insights
              </h3>
              <div className="space-y-4">
                {sessionData.general.map((generalInfo, index) => (
                  <div key={index} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    {generalInfo.tips && generalInfo.tips.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-semibold text-yellow-900 mb-2">Tips:</h4>
                        <ul className="text-yellow-800 text-sm space-y-1">
                          {generalInfo.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2">
                              <span className="text-yellow-600">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {generalInfo.insights && generalInfo.insights.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-2">Insights:</h4>
                        <ul className="text-yellow-800 text-sm space-y-1">
                          {generalInfo.insights.map((insight, insightIndex) => (
                            <li key={insightIndex} className="flex items-start gap-2">
                              <span className="text-yellow-600">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CategorizedResults;
