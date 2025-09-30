import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

// Component to handle map clicks and determine regions
function ClickHandler({ onRegionSelect, regions }) {
  const [clickedLocation, setClickedLocation] = useState(null);

  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setClickedLocation({ lat, lng });
      
      // Determine which region was clicked based on coordinates
      const regionId = determineRegionFromCoordinates(lat, lng);
      if (regionId && regions[regionId]) {
        onRegionSelect(regionId);
      }
    },
  });

  // Simple geographic boundaries for Mexican regions (approximate but reasonable)
  const determineRegionFromCoordinates = (lat, lng) => {
    // Northern Mexico (northern states)
    if (lat > 25 && lng > -117 && lng < -97) {
      return 'northern-mexico';
    }
    
    // Los Cabos (Baja California Sur)
    if (lat > 22 && lat < 29 && lng > -116 && lng < -109) {
      return 'los-cabos';
    }
    
    // Pacific Coast (western coastal states)
    if (lat > 14 && lat < 27 && lng > -110 && lng < -92) {
      return 'pacific-coast';
    }
    
    // Central Mexico (central states around Mexico City)
    if (lat > 17 && lat < 25 && lng > -104 && lng < -96) {
      return 'central-mexico';
    }
    
    // Riviera Maya (Caribbean coast - Quintana Roo)
    if (lat > 18 && lat < 22 && lng > -88 && lng < -86) {
      return 'riviera-maya';
    }
    
    // Yucatan Peninsula (southeastern states)
    if (lat > 17 && lat < 22 && lng > -95 && lng < -86) {
      return 'yucatan-peninsula';
    }
    
    return null;
  };

  return null;
}

// Component to fit map to Mexico bounds
function MapController() {
  const map = useMap();

  useEffect(() => {
    // Fit the map to Mexico's bounds
    const bounds = [
      [14.5, -118.4], // Southwest corner
      [32.7, -86.0]   // Northeast corner
    ];
    map.fitBounds(bounds, { padding: [20, 20] });
    map.setMinZoom(4);
    map.setMaxZoom(8);
  }, [map]);

  return null;
}

const SimpleClickableMexicoMap = ({ selectedRegion, onRegionSelect, regions }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl overflow-hidden border border-gray-200">
        <div style={{ height: '600px', width: '100%' }}>
          <MapContainer
            center={[23.6345, -102.5528]} // Center of Mexico
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <ClickHandler onRegionSelect={onRegionSelect} regions={regions} />
            <MapController />
          </MapContainer>
        </div>

        {/* Map Instructions Overlay */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200">
          <div className="text-sm text-gray-700">
            <div className="font-bold text-base mb-1 flex items-center">
              🇲🇽 <span className="ml-2">Mexico Tourism Regions</span>
            </div>
            <div className="text-xs text-gray-600">Click anywhere on Mexico to select a region</div>
            <div className="text-xs text-gray-500 mt-1">No overlays - pure geographic detection</div>
          </div>
        </div>

        {/* Region Info Box */}
        {selectedRegion && regions[selectedRegion] && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200 max-w-xs">
            <div className="text-sm">
              <div className="flex items-center mb-2">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: regions[selectedRegion].color }}
                ></div>
                <span className="font-bold text-gray-800">{regions[selectedRegion].name}</span>
              </div>
              <p className="text-xs text-gray-600">{regions[selectedRegion].description}</p>
            </div>
          </div>
        )}

        {/* Region Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
          <div className="text-xs text-gray-600">
            <div className="font-semibold mb-2">Available Regions:</div>
            <div className="space-y-1">
              {Object.entries(regions).map(([regionId, region]) => (
                <div key={regionId} className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: region.color }}
                  ></div>
                  <span className={`text-xs ${selectedRegion === regionId ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                    {region.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Region Enhanced Info */}
      {selectedRegion && regions[selectedRegion] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg"
        >
          <div className="flex items-center mb-4">
            <div 
              className="w-6 h-6 rounded-full mr-3 border-2 border-white shadow-sm"
              style={{ backgroundColor: regions[selectedRegion].color }}
            ></div>
            <h4 className="text-2xl font-bold text-gray-900">
              {regions[selectedRegion].name}
            </h4>
            <div className="ml-auto bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              ✓ Selected
            </div>
          </div>
          <p className="text-gray-700 mb-4 text-lg leading-relaxed">
            {regions[selectedRegion].description}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {regions[selectedRegion].cities.map((city) => (
              <div key={city.id} className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <span className="text-sm font-semibold text-gray-800">{city.name}</span>
                <div className="text-xs text-gray-500 mt-1">{city.description}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="mt-6 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            🗺️ <strong>Clean Map Interface:</strong> Click anywhere on the Mexico map to select a tourism region. 
            No overlays or drawn boundaries - just pure geographic detection based on your click location.
          </p>
          <p className="text-xs text-blue-600 mt-2">
            This approach lets you see the real Mexico geography without any visual interference.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleClickableMexicoMap;