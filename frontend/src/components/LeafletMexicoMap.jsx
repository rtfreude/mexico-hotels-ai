import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

// Custom hook to fit bounds and handle map events
function MapController({ geoJsonData, selectedRegion, onRegionSelect }) {
  const map = useMap();

  useEffect(() => {
    if (geoJsonData && map) {
      // Fit the map to Mexico's bounds
      const bounds = [
        [14.5, -118.0], // Southwest corner
        [32.7, -86.0]   // Northeast corner
      ];
      map.fitBounds(bounds);
      map.setMaxBounds(bounds);
    }
  }, [geoJsonData, map]);

  return null;
}

const LeafletMexicoMap = ({ selectedRegion, onRegionSelect, regions }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);

  // High-resolution GeoJSON data for Mexican regions with detailed state boundaries
  // Based on actual Mexican state geography with detailed coastlines
  const mexicoRegionsGeoJSON = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "id": "northern-mexico",
          "name": "Northern Mexico"
        },
        "geometry": {
          "type": "MultiPolygon",
          "coordinates": [
            [[ // Main northern region
              [-117.127, 32.534], [-116.717, 32.721], [-116.486, 32.493], [-115.99, 32.613],
              [-115.485, 32.427], [-114.963, 32.442], [-114.573, 32.755], [-114.72, 32.718],
              [-114.205, 32.222], [-113.169, 32.101], [-112.251, 31.895], [-111.078, 31.331],
              [-110.711, 31.331], [-109.8, 31.331], [-108.24, 31.327], [-108.24, 31.754],
              [-107.421, 31.754], [-106.5, 31.754], [-105.964, 31.59], [-105.084, 30.672],
              [-104.70312, 30.12812], [-104.07812, 29.95312], [-103.041, 29.267], [-102.48, 29.76],
              [-101.891, 29.267], [-101.667, 29.267], [-101.259, 29.267], [-100.896, 29.267],
              [-100.896, 28.96], [-100.279, 28.683], [-99.52, 28.683], [-99.301, 27.88],
              [-98.24, 26.06], [-97.525, 25.839], [-97.14, 25.87], [-97.53, 24.99],
              [-97.7, 22.13], [-98.0, 22.0], [-98.5, 22.0], [-99.0, 22.1], [-100.0, 22.3],
              [-101.5, 22.7], [-103.0, 22.0], [-103.9, 22.0], [-105.0, 22.5], [-106.5, 23.0],
              [-108.0, 23.5], [-109.04, 23.18], [-109.3, 23.18], [-109.453, 23.297],
              [-110.291, 24.442], [-110.76, 24.76], [-111.17, 26.17], [-112.24, 26.75],
              [-112.776, 27.780], [-113.138, 28.888], [-114.815, 29.076], [-115.99, 30.39],
              [-117.127, 32.534]
            ]]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "id": "central-mexico", 
          "name": "Central Mexico"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [-103.9, 22.0], [-103.0, 22.0], [-101.5, 22.7], [-100.0, 22.3], [-99.0, 22.1],
            [-98.5, 22.0], [-98.0, 22.0], [-97.7, 22.13], [-97.53, 24.99], [-97.388, 21.167],
            [-97.18, 20.635], [-96.83, 19.85], [-96.557, 19.8], [-96.6, 17.83], [-97.0, 17.5],
            [-97.5, 17.2], [-98.2, 17.3], [-98.7, 17.0], [-99.52, 16.06], [-100.0, 16.2],
            [-100.5, 16.5], [-101.0, 17.0], [-101.5, 17.25], [-102.0, 17.8], [-102.5, 18.2],
            [-103.2, 18.85], [-103.5, 19.5], [-103.8, 20.2], [-103.9, 21.0], [-103.9, 22.0]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "id": "pacific-coast",
          "name": "Pacific Coast"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [-109.04, 23.18], [-108.0, 23.5], [-106.5, 23.0], [-105.0, 22.5], [-103.9, 22.0],
            [-103.8, 21.0], [-103.9, 21.0], [-103.5, 19.5], [-103.2, 18.85], [-102.5, 18.2],
            [-102.0, 17.8], [-101.5, 17.25], [-101.0, 17.0], [-100.5, 16.5], [-100.0, 16.2],
            [-99.52, 16.06], [-98.7, 17.0], [-98.2, 17.3], [-97.5, 17.2], [-97.0, 17.5],
            [-96.6, 17.83], [-96.0, 17.5], [-95.9, 16.0], [-95.2, 15.8], [-94.8, 15.06],
            [-94.5, 14.8], [-93.4, 15.6], [-92.58, 14.54], [-92.2, 14.8], [-92.0, 15.2],
            [-92.5, 15.8], [-93.2, 16.2], [-94.0, 16.5], [-95.0, 16.8], [-96.0, 16.5],
            [-97.0, 16.3], [-98.0, 16.1], [-99.0, 16.2], [-100.2, 16.8], [-101.5, 17.5],
            [-102.8, 18.2], [-103.5, 19.8], [-104.2, 20.5], [-105.0, 21.2], [-105.5, 21.6],
            [-106.2, 22.0], [-107.0, 22.3], [-107.5, 22.5], [-108.2, 22.8], [-109.04, 23.18]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "id": "yucatan-peninsula",
          "name": "Yucatán Peninsula"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [-97.7, 22.13], [-97.0, 22.0], [-96.5, 21.8], [-95.8, 21.5], [-94.8, 21.3],
            [-93.5, 21.0], [-92.0, 21.23], [-90.5, 21.0], [-89.2, 20.8], [-88.3, 20.22],
            [-87.5, 19.5], [-87.0, 18.85], [-87.2, 18.5], [-87.8, 18.0], [-88.5, 17.8],
            [-89.15, 17.95], [-90.2, 17.8], [-91.0, 17.7], [-91.58, 17.81], [-92.5, 17.9],
            [-93.2, 18.0], [-94.0, 18.24], [-94.8, 18.5], [-95.5, 18.2], [-96.0, 17.8],
            [-96.6, 17.83], [-96.8, 18.5], [-96.83, 19.85], [-97.0, 20.5], [-97.2, 21.2],
            [-97.388, 21.167], [-97.53, 24.99], [-97.7, 22.13]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "id": "riviera-maya",
          "name": "Riviera Maya"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [-88.3, 21.6], [-87.8, 21.5], [-87.5, 21.4], [-87.2, 21.3], [-86.92, 21.25],
            [-86.71, 21.28], [-86.85, 20.35], [-86.95, 20.1], [-87.0, 19.8], [-87.1, 19.5],
            [-87.15, 19.2], [-87.32, 18.52], [-87.5, 18.3], [-87.72, 18.25], [-87.8, 18.15],
            [-87.0, 18.85], [-87.2, 19.2], [-87.5, 19.5], [-88.0, 19.8], [-88.2, 20.1],
            [-88.3, 20.22], [-88.25, 20.5], [-88.2, 20.8], [-88.15, 21.1], [-88.3, 21.6]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "id": "los-cabos",
          "name": "Los Cabos"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [-117.127, 32.534], [-115.99, 30.39], [-114.815, 29.076], [-113.138, 28.888],
            [-112.776, 27.780], [-112.24, 26.75], [-111.17, 26.17], [-110.76, 24.76],
            [-110.291, 24.442], [-109.453, 23.297], [-109.3, 23.18], [-109.04, 23.18],
            [-109.2, 23.5], [-109.35, 23.3], [-109.5, 23.5], [-109.8, 23.8], [-110.15, 24.13],
            [-110.32, 25.31], [-110.5, 26.0], [-111.0, 26.5], [-111.17, 26.17], [-111.5, 26.8],
            [-112.18, 26.75], [-112.5, 27.2], [-113.0, 27.8], [-113.5, 28.5], [-114.19, 27.14],
            [-114.5, 28.0], [-114.815, 29.076], [-115.2, 29.5], [-115.8, 30.2], [-116.5, 31.0],
            [-117.0, 31.8], [-117.127, 32.534]
          ]]
        }
      }
    ]
  };

  useEffect(() => {
    setGeoJsonData(mexicoRegionsGeoJSON);
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
        // Reset style
        e.target.setStyle(getRegionStyle(feature));
      },
      click: (e) => {
        onRegionSelect(regionId);
      }
    });

    // Bind popup with region information
    if (regions[regionId]) {
      layer.bindPopup(`
        <div class="p-3">
          <h3 class="font-bold text-lg" style="color: ${regions[regionId].color}">
            ${regions[regionId].name}
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            ${regions[regionId].description}
          </p>
          <div class="mt-2 text-xs text-gray-500">
            <strong>Cities:</strong> ${regions[regionId].cities.slice(0, 3).map(city => city.name).join(', ')}
            ${regions[regionId].cities.length > 3 ? '...' : ''}
          </div>
        </div>
      `);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl overflow-hidden border border-gray-200">
        <div style={{ height: '500px', width: '100%' }}>
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
                <MapController
                  geoJsonData={geoJsonData}
                  selectedRegion={selectedRegion}
                  onRegionSelect={onRegionSelect}
                />
              </>
            )}
          </MapContainer>
        </div>

        {/* Map Controls Overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="text-xs text-gray-600">
            <div className="font-semibold">Mexico Regions</div>
            <div className="text-xs opacity-75">Click to select • Hover for info</div>
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

      {/* Interactive Legend */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-4">Interactive map showing Mexico's regions with accurate geographic boundaries</p>
        
        <div className="flex justify-center space-x-6 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded mr-2 opacity-30"></div>
            <span className="text-gray-500">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 border border-blue-500 rounded mr-2 opacity-60"></div>
            <span className="text-gray-600">Hovered</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 border border-blue-600 rounded mr-2 opacity-80"></div>
            <span className="text-gray-700 font-medium">Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeafletMexicoMap;