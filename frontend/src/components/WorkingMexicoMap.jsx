import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

// Custom hook to fit bounds and handle map events
function MapController({ geoJsonData }) {
  const map = useMap();

  useEffect(() => {
    if (geoJsonData && map) {
      // Fit the map to Mexico's bounds
      const bounds = [
        [14.5, -118.4], // Southwest corner
        [32.7, -86.0]   // Northeast corner
      ];
      map.fitBounds(bounds, { padding: [20, 20] });
      map.setMinZoom(4);
      map.setMaxZoom(8);
    }
  }, [geoJsonData, map]);

  return null;
}

const WorkingMexicoMap = ({ selectedRegion, onRegionSelect, regions }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create working regions using simplified but accurate boundaries
    // These are based on actual Mexico geography but simplified for reliability
    const mexicoRegions = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            id: 'northern-mexico',
            name: 'Northern Mexico',
            states: 'Baja California, Sonora, Chihuahua, Coahuila, Nuevo León, Tamaulipas'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-117.0, 32.5], [-109.0, 31.5], [-106.0, 31.5], [-103.0, 29.0], 
              [-100.5, 29.0], [-98.0, 26.0], [-97.0, 25.8], [-97.5, 22.2],
              [-103.0, 22.0], [-109.0, 23.0], [-112.0, 26.5], [-115.0, 29.0], 
              [-117.0, 32.5]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: {
            id: 'central-mexico',
            name: 'Central Mexico', 
            states: 'Mexico City, Estado de México, Hidalgo, Puebla, Tlaxcala, Morelos, Querétaro, Guanajuato'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-103.0, 22.0], [-97.5, 22.2], [-97.0, 20.5], [-96.5, 18.0],
              [-99.0, 16.2], [-102.0, 17.5], [-103.5, 19.0], [-103.0, 22.0]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: {
            id: 'pacific-coast',
            name: 'Pacific Coast',
            states: 'Sinaloa, Nayarit, Jalisco, Colima, Michoacán, Guerrero, Oaxaca'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-109.0, 23.0], [-103.0, 22.0], [-103.5, 19.0], [-102.0, 17.5],
              [-99.0, 16.2], [-96.5, 16.0], [-94.5, 15.0], [-92.2, 14.5],
              [-95.0, 16.5], [-105.5, 21.0], [-108.0, 22.5], [-109.0, 23.0]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: {
            id: 'yucatan-peninsula',
            name: 'Yucatán Peninsula',
            states: 'Yucatán, Campeche, Tabasco, Chiapas'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-97.5, 22.2], [-92.0, 21.2], [-89.0, 20.0], [-87.5, 18.0],
              [-89.0, 17.8], [-92.2, 14.5], [-94.5, 15.0], [-96.5, 16.0],
              [-96.5, 18.0], [-97.0, 20.5], [-97.5, 22.2]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: {
            id: 'riviera-maya',
            name: 'Riviera Maya',
            states: 'Quintana Roo (Caribbean Coast)'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-87.5, 21.5], [-86.7, 21.3], [-86.8, 18.2], [-87.8, 18.0],
              [-87.5, 21.5]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: {
            id: 'los-cabos',
            name: 'Los Cabos',
            states: 'Baja California Sur'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-115.0, 29.0], [-112.0, 26.5], [-109.0, 23.0], [-108.0, 22.5],
              [-110.0, 24.0], [-112.5, 27.0], [-115.0, 29.0]
            ]]
          }
        }
      ]
    };

    setGeoJsonData(mexicoRegions);
    setLoading(false);
  }, []);

  const getRegionStyle = (feature) => {
    const regionId = feature.properties.id;
    const regionData = regions[regionId];
    const isSelected = selectedRegion === regionId;
    const isHovered = hoveredRegion === regionId;

    return {
      fillColor: isSelected 
        ? regionData?.color || '#3B82F6'
        : isHovered 
          ? regionData?.color || '#3B82F6'
          : '#E5E7EB',
      weight: isSelected ? 3 : isHovered ? 2 : 1,
      opacity: 1,
      color: isSelected 
        ? regionData?.color || '#3B82F6'
        : isHovered 
          ? regionData?.color || '#3B82F6'
          : '#9CA3AF',
      dashArray: '',
      fillOpacity: isSelected ? 0.8 : isHovered ? 0.6 : 0.3
    };
  };

  const onEachFeature = (feature, layer) => {
    const regionId = feature.properties.id;
    
    layer.on({
      mouseover: (e) => {
        setHoveredRegion(regionId);
        e.target.setStyle({
          weight: 3,
          fillOpacity: 0.7
        });
      },
      mouseout: (e) => {
        setHoveredRegion(null);
        e.target.setStyle(getRegionStyle(feature));
      },
      click: (e) => {
        onRegionSelect(regionId);
      }
    });

    // Enhanced popup with region information
    if (regions[regionId]) {
      layer.bindPopup(`
        <div class="p-4 max-w-sm">
          <h3 class="font-bold text-lg mb-2" style="color: ${regions[regionId].color}">
            ${regions[regionId].name}
          </h3>
          <p class="text-sm text-gray-600 mb-3">
            ${regions[regionId].description}
          </p>
          <div class="mb-3">
            <div class="text-xs font-semibold text-gray-700 mb-1">States/Regions:</div>
            <div class="text-xs text-gray-600">${feature.properties.states}</div>
          </div>
          <div class="text-xs text-gray-500">
            <strong>Major Cities:</strong> ${regions[regionId].cities.slice(0, 3).map(city => city.name).join(', ')}
            ${regions[regionId].cities.length > 3 ? '...' : ''}
          </div>
          <div class="mt-3 text-center">
            <button onclick="window.selectRegion('${regionId}')" 
                    class="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
              Select This Region
            </button>
          </div>
        </div>
      `, {
        maxWidth: 300,
        className: 'custom-popup'
      });
    }
  };

  // Global function for popup button
  useEffect(() => {
    window.selectRegion = (regionId) => {
      onRegionSelect(regionId);
    };
    
    return () => {
      delete window.selectRegion;
    };
  }, [onRegionSelect]);

  if (loading) {
    return (
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 text-center border border-gray-200">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Mexico map...</p>
        </div>
      </div>
    );
  }

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
            
            {geoJsonData && (
              <>
                <GeoJSON
                  data={geoJsonData}
                  style={getRegionStyle}
                  onEachFeature={onEachFeature}
                />
                <MapController geoJsonData={geoJsonData} />
              </>
            )}
          </MapContainer>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200">
          <div className="text-sm text-gray-700">
            <div className="font-bold text-base mb-1 flex items-center">
              🇲🇽 <span className="ml-2">Mexico Tourism Regions</span>
            </div>
            <div className="text-xs text-gray-600">Interactive regional map</div>
            <div className="text-xs text-gray-500 mt-1">Click regions to select • Hover for details</div>
          </div>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="font-semibold mb-2">Map Legend</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-gray-200 border border-gray-400 rounded mr-2 opacity-30"></div><span>Available</span></div>
            <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 border border-blue-500 rounded mr-2 opacity-60"></div><span>Hovered</span></div>
            <div className="flex items-center"><div className="w-3 h-3 bg-blue-600 border border-blue-600 rounded mr-2 opacity-80"></div><span>Selected</span></div>
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

      {/* Interactive Legend */}
      <div className="mt-6 text-center">
        <p className="text-lg font-semibold text-gray-800 mb-2">
          🗺️ Interactive Mexico Tourism Map
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Explore Mexico's regions with accurate geographic boundaries. Click any region to learn more about its cities and attractions.
        </p>
        
        <div className="flex justify-center space-x-8 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded mr-2 opacity-30"></div>
            <span className="text-gray-500">Available Regions</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 border border-blue-500 rounded mr-2 opacity-60"></div>
            <span className="text-gray-600">Hover State</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 border border-blue-600 rounded mr-2 opacity-80"></div>
            <span className="text-gray-700 font-medium">Selected Region</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingMexicoMap;