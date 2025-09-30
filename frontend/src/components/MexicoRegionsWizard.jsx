import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, MapPin, Calendar, Users, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import AccurateMexicoOverlays from './AccurateMexicoOverlays';

const MexicoRegionsWizard = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchPreferences, setSearchPreferences] = useState({
    dates: { checkin: '', checkout: '' },
    guests: 2,
    budget: 'mid-range'
  });

  // Mexico regions with their cities
  const regions = {
    'riviera-maya': {
      name: 'Riviera Maya',
      description: 'Crystal clear waters, white sand beaches, and ancient Mayan ruins',
      color: '#3B82F6', // blue
      cities: [
        { id: 'cancun', name: 'Cancún', description: 'Party capital with luxury resorts' },
        { id: 'playa-del-carmen', name: 'Playa del Carmen', description: 'Bohemian vibe meets beach luxury' },
        { id: 'tulum', name: 'Tulum', description: 'Ancient ruins with boutique beach clubs' },
        { id: 'cozumel', name: 'Cozumel', description: 'World-class diving paradise' },
        { id: 'isla-mujeres', name: 'Isla Mujeres', description: 'Laid-back island escape' }
      ],
      coordinates: [20.6296, -87.0739],
      image: 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80'
    },
    'pacific-coast': {
      name: 'Pacific Coast',
      description: 'Dramatic coastlines, golden sunsets, and vibrant culture',
      color: '#F97316', // orange
      cities: [
        { id: 'puerto-vallarta', name: 'Puerto Vallarta', description: 'Charming colonial architecture' },
        { id: 'mazatlan', name: 'Mazatlán', description: 'Historic port city with great seafood' },
        { id: 'acapulco', name: 'Acapulco', description: 'Classic Mexican beach destination' },
        { id: 'zihuatanejo', name: 'Zihuatanejo', description: 'Fishing village turned beach paradise' }
      ],
      coordinates: [20.6534, -105.2253],
      image: 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&q=80'
    },
    'los-cabos': {
      name: 'Los Cabos',
      description: 'Desert meets ocean with luxury resorts and world-class golf',
      color: '#10B981', // green
      cities: [
        { id: 'cabo-san-lucas', name: 'Cabo San Lucas', description: 'Party scene and dramatic rock formations' },
        { id: 'san-jose-del-cabo', name: 'San José del Cabo', description: 'Art galleries and fine dining' },
        { id: 'todos-santos', name: 'Todos Santos', description: 'Artistic colonial town' }
      ],
      coordinates: [23.0545, -109.7035],
      image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80'
    },
    'central-mexico': {
      name: 'Central Mexico',
      description: 'Rich history, colonial architecture, and cultural treasures',
      color: '#8B5CF6', // purple
      cities: [
        { id: 'mexico-city', name: 'Mexico City', description: 'Vibrant capital with museums and cuisine' },
        { id: 'guadalajara', name: 'Guadalajara', description: 'Birthplace of mariachi music' },
        { id: 'san-miguel-de-allende', name: 'San Miguel de Allende', description: 'UNESCO World Heritage colonial gem' },
        { id: 'guanajuato', name: 'Guanajuato', description: 'Colorful hillside mining town' }
      ],
      coordinates: [19.4326, -99.1332],
      image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80'
    },
    'yucatan-peninsula': {
      name: 'Yucatán Peninsula',
      description: 'Mayan culture, cenotes, and colonial cities',
      color: '#EC4899', // pink
      cities: [
        { id: 'merida', name: 'Mérida', description: 'Cultural capital of Yucatán' },
        { id: 'chichen-itza', name: 'Chichen Itzá', description: 'Ancient wonder of the world' },
        { id: 'valladolid', name: 'Valladolid', description: 'Colonial charm near cenotes' }
      ],
      coordinates: [20.9674, -89.5926],
      image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80'
    },
    'northern-mexico': {
      name: 'Northern Mexico',
      description: 'Desert landscapes, wine country, and border culture',
      color: '#F59E0B', // amber
      cities: [
        { id: 'tijuana', name: 'Tijuana', description: 'Border city with amazing food scene' },
        { id: 'ensenada', name: 'Ensenada', description: 'Wine country and coastal beauty' },
        { id: 'monterrey', name: 'Monterrey', description: 'Industrial hub with mountain views' }
      ],
      coordinates: [25.6866, -100.3161],
      image: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80'
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegionSelect = (regionId) => {
    setSelectedRegion(regionId);
    setSelectedCity(null); // Reset city selection
  };

  const handleCitySelect = (cityId) => {
    setSelectedCity(cityId);
  };

  const handleSearch = () => {
    // Navigate to search page with selected parameters
    const searchParams = new URLSearchParams({
      city: selectedCity,
      region: selectedRegion,
      checkin: searchPreferences.dates.checkin,
      checkout: searchPreferences.dates.checkout,
      guests: searchPreferences.guests,
      budget: searchPreferences.budget
    });
    
    // Close wizard and navigate
    onClose();
    window.location.href = `/search?${searchParams.toString()}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Discover Mexico</h2>
              <p className="text-blue-100">Find your perfect destination in 3 easy steps</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold ${
                  currentStep >= step 
                    ? 'bg-white text-blue-600 border-white' 
                    : 'border-white/50 text-white/50'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <ChevronRight className={`w-5 h-5 mx-2 ${
                    currentStep > step ? 'text-white' : 'text-white/50'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-2 text-sm text-blue-100">
            {currentStep === 1 && 'Choose a Region'}
            {currentStep === 2 && 'Pick a City'}
            {currentStep === 3 && 'Set Preferences'}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {/* Step 1: Region Selection */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Which region of Mexico calls to you?</h3>
                  <p className="text-gray-600">Click on the map to explore different regions and their unique attractions</p>
                </div>

                <div className="flex justify-center">
                  <AccurateMexicoOverlays
                    selectedRegion={selectedRegion}
                    onRegionSelect={handleRegionSelect}
                    regions={regions}
                  />
                </div>

                {/* Selected Region Info */}
                {selectedRegion && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-200"
                  >
                    <div className="flex items-center mb-4">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: regions[selectedRegion].color }}
                      ></div>
                      <h4 className="text-xl font-bold text-gray-900">
                        {regions[selectedRegion].name}
                      </h4>
                    </div>
                    <p className="text-gray-700 mb-4">
                      {regions[selectedRegion].description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {regions[selectedRegion].cities.map((city) => (
                        <div key={city.id} className="bg-white rounded-lg p-2 text-center">
                          <span className="text-sm font-medium text-gray-800">{city.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: City Selection */}
            {currentStep === 2 && selectedRegion && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Choose your city in {regions[selectedRegion].name}</h3>
                  <p className="text-gray-600">Each city has its own character and attractions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {regions[selectedRegion].cities.map((city) => (
                    <motion.div
                      key={city.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCitySelect(city.id)}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition ${
                        selectedCity === city.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{city.name}</h4>
                          <p className="text-gray-600 mt-1">{city.description}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedCity === city.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedCity === city.id && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Tell us about your trip</h3>
                  <p className="text-gray-600">Help us find the perfect accommodations for you</p>
                </div>

                <div className="space-y-6">
                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        value={searchPreferences.dates.checkin}
                        onChange={(e) => setSearchPreferences(prev => ({
                          ...prev,
                          dates: { ...prev.dates, checkin: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        value={searchPreferences.dates.checkout}
                        onChange={(e) => setSearchPreferences(prev => ({
                          ...prev,
                          dates: { ...prev.dates, checkout: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Number of Guests
                    </label>
                    <select
                      value={searchPreferences.guests}
                      onChange={(e) => setSearchPreferences(prev => ({
                        ...prev,
                        guests: parseInt(e.target.value)
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>1 Guest</option>
                      <option value={2}>2 Guests</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4 Guests</option>
                      <option value={5}>5+ Guests</option>
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Budget Range
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { value: 'budget', label: 'Budget', desc: 'Under $150/night' },
                        { value: 'mid-range', label: 'Mid-Range', desc: '$150-400/night' },
                        { value: 'luxury', label: 'Luxury', desc: '$400+/night' }
                      ].map((option) => (
                        <div
                          key={option.value}
                          onClick={() => setSearchPreferences(prev => ({ ...prev, budget: option.value }))}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition text-center ${
                            searchPreferences.budget === option.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <h4 className="font-semibold">{option.label}</h4>
                          <p className="text-sm text-gray-600 mt-1">{option.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {selectedRegion && selectedCity && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Your Selection:</h4>
                    <p className="text-gray-700">
                      Looking for <span className="font-medium">{searchPreferences.budget}</span> accommodations 
                      in <span className="font-medium">{regions[selectedRegion].cities.find(c => c.id === selectedCity)?.name}</span>, 
                      <span className="font-medium"> {regions[selectedRegion].name}</span>
                      {searchPreferences.dates.checkin && searchPreferences.dates.checkout && (
                        <span> from {searchPreferences.dates.checkin} to {searchPreferences.dates.checkout}</span>
                      )}
                      <span> for {searchPreferences.guests} guest{searchPreferences.guests !== 1 ? 's' : ''}</span>
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !selectedRegion) ||
                  (currentStep === 2 && !selectedCity)
                }
                className={`flex items-center px-6 py-2 rounded-lg font-medium transition ${
                  (currentStep === 1 && !selectedRegion) ||
                  (currentStep === 2 && !selectedCity)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSearch}
                disabled={!selectedRegion || !selectedCity}
                className={`flex items-center px-6 py-2 rounded-lg font-medium transition ${
                  !selectedRegion || !selectedCity
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:shadow-lg'
                }`}
              >
                Start Searching
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MexicoRegionsWizard;