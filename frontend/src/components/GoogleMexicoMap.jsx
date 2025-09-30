import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const GoogleMexicoMap = ({ selectedRegion, onRegionSelect, regions }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const overlaysRef = useRef([]);

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setIsLoaded(false);
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 23.6345, lng: -102.5528 }, // Center of Mexico
        zoom: 5,
        mapTypeId: 'terrain',
        restriction: {
          latLngBounds: {
            north: 32.7,
            south: 14.5,
            west: -118.4,
            east: -86.0,
          },
          strictBounds: false,
        },
        styles: [
          {
            featureType: 'administrative.country',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#4285f4' }, { weight: 2 }]
          }
        ]
      });

      mapInstanceRef.current = map;
      createRegionOverlays(map);
      setIsLoaded(true);
    };

    const createRegionOverlays = (map) => {
      // Clear existing overlays
      overlaysRef.current.forEach(overlay => overlay.setMap(null));
      overlaysRef.current = [];

      // Define approximate region boundaries (these are simplified but more realistic)
      const regionBounds = {
        'northern-mexico': [
          { lat: 32.5, lng: -117.0 },
          { lat: 32.5, lng: -97.0 },
          { lat: 22.0, lng: -97.0 },
          { lat: 22.0, lng: -109.0 },
          { lat: 25.0, lng: -112.0 },
          { lat: 29.0, lng: -115.0 },
          { lat: 32.5, lng: -117.0 }
        ],
        'central-mexico': [
          { lat: 22.0, lng: -104.0 },
          { lat: 22.0, lng: -97.0 },
          { lat: 17.0, lng: -97.0 },
          { lat: 17.0, lng: -104.0 },
          { lat: 22.0, lng: -104.0 }
        ],
        'pacific-coast': [
          { lat: 23.0, lng: -109.0 },
          { lat: 22.0, lng: -104.0 },
          { lat: 17.0, lng: -104.0 },
          { lat: 14.5, lng: -92.0 },
          { lat: 16.0, lng: -95.0 },
          { lat: 20.0, lng: -105.0 },
          { lat: 23.0, lng: -109.0 }
        ],
        'yucatan-peninsula': [
          { lat: 22.0, lng: -97.0 },
          { lat: 21.5, lng: -90.0 },
          { lat: 17.8, lng: -89.0 },
          { lat: 17.0, lng: -94.0 },
          { lat: 17.0, lng: -97.0 },
          { lat: 22.0, lng: -97.0 }
        ],
        'riviera-maya': [
          { lat: 21.5, lng: -87.5 },
          { lat: 21.5, lng: -86.7 },
          { lat: 18.5, lng: -87.5 },
          { lat: 18.5, lng: -88.0 },
          { lat: 21.5, lng: -87.5 }
        ],
        'los-cabos': [
          { lat: 28.0, lng: -115.0 },
          { lat: 28.0, lng: -109.3 },
          { lat: 22.8, lng: -109.3 },
          { lat: 22.8, lng: -112.0 },
          { lat: 25.0, lng: -112.0 },
          { lat: 28.0, lng: -115.0 }
        ]
      };

      Object.entries(regionBounds).forEach(([regionId, bounds]) => {
        const regionData = regions[regionId];
        if (!regionData) return;

        const polygon = new window.google.maps.Polygon({
          paths: bounds,
          strokeColor: regionData.color || '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: regionData.color || '#3B82F6',
          fillOpacity: selectedRegion === regionId ? 0.6 : 0.2,
          clickable: true,
        });

        polygon.setMap(map);
        overlaysRef.current.push(polygon);

        // Add event listeners
        polygon.addListener('click', () => {
          onRegionSelect(regionId);
        });

        polygon.addListener('mouseover', () => {
          setHoveredRegion(regionId);
          polygon.setOptions({ 
            fillOpacity: 0.5,
            strokeWeight: 3 
          });
        });

        polygon.addListener('mouseout', () => {
          setHoveredRegion(null);
          polygon.setOptions({ 
            fillOpacity: selectedRegion === regionId ? 0.6 : 0.2,
            strokeWeight: selectedRegion === regionId ? 3 : 2
          });
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 250px;">
              <h3 style="color: ${regionData.color}; margin: 0 0 8px 0; font-weight: bold;">
                ${regionData.name}
              </h3>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
                ${regionData.description}
              </p>
              <div style="font-size: 12px; color: #888;">
                <strong>Cities:</strong> ${regionData.cities.slice(0, 3).map(city => city.name).join(', ')}
                ${regionData.cities.length > 3 ? '...' : ''}
              </div>
            </div>
          `
        });

        polygon.addListener('click', (e) => {
          infoWindow.setPosition(e.latLng);
          infoWindow.open(map);
        });
      });
    };

    // Update overlays when selection changes
    if (mapInstanceRef.current && isLoaded) {
      overlaysRef.current.forEach((overlay, index) => {
        const regionIds = Object.keys(regions);
        const regionId = regionIds[index];
        const regionData = regions[regionId];
        
        if (regionData) {
          overlay.setOptions({
            fillOpacity: selectedRegion === regionId ? 0.6 : 0.2,
            strokeWeight: selectedRegion === regionId ? 3 : 2
          });
        }
      });
    }

    loadGoogleMaps();
  }, [selectedRegion, onRegionSelect, regions]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl overflow-hidden border border-gray-200">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Google Maps...</p>
            </div>
          </div>
        )}
        
        <div 
          ref={mapRef}
          style={{ height: '500px', width: '100%' }}
          className="rounded-xl"
        />

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="text-xs text-gray-600">
            <div className="font-semibold">🗺️ Google Maps - Mexico</div>
            <div className="text-xs opacity-75">Click regions to select</div>
          </div>
        </div>
      </div>

      {/* Selected Region Info */}
      {selectedRegion && regions[selectedRegion] && (
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

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-4">
          🌎 Powered by Google Maps with interactive region overlays
        </p>
        <p className="text-xs text-gray-500">
          Note: Requires Google Maps API key for full functionality
        </p>
      </div>
    </div>
  );
};

export default GoogleMexicoMap;