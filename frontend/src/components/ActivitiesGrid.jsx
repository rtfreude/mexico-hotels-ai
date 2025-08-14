import { MapPin, Calendar, Camera, ExternalLink } from 'lucide-react';

function ActivitiesGrid({ activities }) {
  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Camera className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900">Recommended Activities</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
            <div className="p-5 flex flex-col flex-grow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                  {activity.name}
                </h3>
                {activity.type && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full ml-2">
                    {activity.type}
                  </span>
                )}
              </div>
              
              {activity.location && (
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{activity.location}</span>
                </div>
              )}

              {activity.description && (
                <p className="text-gray-600 text-sm mb-4">
                  {activity.description}
                </p>
              )}

              {activity.highlights && activity.highlights.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {activity.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activity.price && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">Price:</span>
                  <span className="text-sm text-purple-600">{activity.price}</span>
                </div>
              )}

              {/* Spacer to push button to bottom */}
              <div className="flex-grow"></div>

              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                <span>Learn More</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivitiesGrid;
