import { motion } from 'framer-motion';
import ResortCard from './ResortCard';
import { MapPin, Sparkles } from 'lucide-react';

const ResortGrid = ({ resorts, title = "Available Resorts", showFilters = true }) => {
  // Filter out invalid resorts
  const validResorts = resorts?.filter(resort => 
    resort && 
    resort.name && 
    resort.name.trim() !== '' &&
    resort.name !== 'Sample Hotel' &&
    resort.name !== 'Test Hotel'
  ) || [];

  if (!validResorts || validResorts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No resorts found</h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your search criteria or explore different destinations.
          </p>
          <button className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto">
            <Sparkles className="w-4 h-4" />
            <span>Get AI Recommendations</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 text-lg"
        >
          {validResorts.length} resort{validResorts.length !== 1 ? 's' : ''} found
        </motion.p>
      </div>

      {/* Filters Bar */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors">
                All Resorts
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                Adults Only
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                Family Friendly
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                All-Inclusive
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                Luxury
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating: Highest</option>
                <option>Distance</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Resort Cards Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {validResorts.map((resort, index) => (
          <ResortCard
            key={resort.id || index}
            resort={resort}
            index={index}
          />
        ))}
      </motion.div>

      {/* Load More Button */}
      {validResorts.length >= 9 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-8"
        >
          <button className="bg-white border-2 border-amber-400 text-amber-600 px-8 py-3 rounded-xl font-semibold hover:bg-amber-50 transition-all duration-300 shadow-lg hover:shadow-xl">
            Load More Resorts
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ResortGrid;