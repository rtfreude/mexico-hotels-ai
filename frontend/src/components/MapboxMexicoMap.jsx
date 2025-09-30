import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Note: In production, you'd set this via environment variable
// For demo purposes, using public token (replace with your own)
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

const MapboxMexicoMap = ({ selectedRegion, onRegionSelect, regions }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Mapbox map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11', // Clean, professional style
      center: [-102.5528, 23.6345], // Center of Mexico
      zoom: 4.5,
      maxBounds: [
        [-125.0, 12.0], // Southwest coordinates
        [-80.0, 35.0]   // Northeast coordinates
      ]
    });

    mapRef.current = map;

    map.on('load', () => {
      // Load Mexico administrative boundaries from Mapbox's built-in data
      // This uses Mapbox's professional geographic data
      
      // Add Mexico country boundary
      map.addSource('mexico-admin', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
      });

      // Add Mexico states from Mapbox administrative data
      map.addSource('mexico-states', {
        type: 'vector', 
        url: 'mapbox://mapbox.boundaries-adm1-v3'
      });

      // Filter for Mexico only and add country outline
      map.addLayer({
        id: 'mexico-country-fill',
        type: 'fill',
        source: 'mexico-admin',
        'source-layer': 'country_boundaries',
        filter: ['==', 'iso_3166_1_alpha_3', 'MEX'],
        paint: {
          'fill-color': '#f8f9fa',
          'fill-opacity': 0.1
        }
      });

      map.addLayer({
        id: 'mexico-country-line',
        type: 'line',
        source: 'mexico-admin', 
        'source-layer': 'country_boundaries',
        filter: ['==', 'iso_3166_1_alpha_3', 'MEX'],
        paint: {
          'line-color': '#666',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });

      // Add tourism regions based on Mexican states
      addTourismRegions(map);
      setIsLoaded(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Update region styling when selection changes
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    Object.keys(regions).forEach(regionId => {
      const layerId = `region-${regionId}`;
      if (mapRef.current.getLayer(layerId)) {
        const regionData = regions[regionId];
        const isSelected = selectedRegion === regionId;
        const isHovered = hoveredRegion === regionId;

        mapRef.current.setPaintProperty(layerId, 'fill-color', regionData.color || '#3B82F6');
        mapRef.current.setPaintProperty(layerId, 'fill-opacity', 
          isSelected ? 0.8 : isHovered ? 0.6 : 0.3
        );
        mapRef.current.setPaintProperty(`${layerId}-line`, 'line-width',
          isSelected ? 3 : isHovered ? 2 : 1
        );
      }
    });
  }, [selectedRegion, hoveredRegion, regions, isLoaded]);

  const addTourismRegions = (map) => {
    // Define Mexican states grouped by tourism regions
    const stateGroupings = {
      'northern-mexico': [
        'Baja California', 'Sonora', 'Chihuahua', 'Coahuila de Zaragoza', 
        'Nuevo León', 'Tamaulipas'
      ],
      'central-mexico': [
        'Aguascalientes', 'Ciudad de México', 'México', 'Hidalgo', 
        'Puebla', 'Tlaxcala', 'Morelos', 'Querétaro', 'Guanajuato'
      ],
      'pacific-coast': [
        'Sinaloa', 'Nayarit', 'Jalisco', 'Colima', 'Michoacán de Ocampo', 
        'Guerrero', 'Oaxaca'
      ],
      'yucatan-peninsula': [
        'Yucatán', 'Campeche', 'Tabasco', 'Chiapas'
      ],
      'riviera-maya': [
        'Quintana Roo'
      ],
      'los-cabos': [
        'Baja California Sur'
      ]
    };

    // Add each tourism region
    Object.entries(stateGroupings).forEach(([regionId, stateNames]) => {
      const regionData = regions[regionId];
      if (!regionData) return;

      // Create filter for states in this region
      const stateFilter = ['in', ['get', 'name'], ['literal', stateNames]];
      
      // Add region fill layer
      map.addLayer({
        id: `region-${regionId}`,
        type: 'fill',
        source: 'mexico-states',
        'source-layer': 'boundaries_admin_1',
        filter: ['all', ['==', 'iso_3166_1', 'MX'], stateFilter],
        paint: {
          'fill-color': regionData.color || '#3B82F6',
          'fill-opacity': selectedRegion === regionId ? 0.8 : 0.3
        }
      });

      // Add region outline layer
      map.addLayer({
        id: `region-${regionId}-line`,
        type: 'line', 
        source: 'mexico-states',
        'source-layer': 'boundaries_admin_1',
        filter: ['all', ['==', 'iso_3166_1', 'MX'], stateFilter],
        paint: {
          'line-color': regionData.color || '#3B82F6',
          'line-width': selectedRegion === regionId ? 3 : 1,
          'line-opacity': 0.8
        }
      });

      // Add click and hover events
      map.on('click', `region-${regionId}`, (e) => {
        onRegionSelect(regionId);
        
        // Show popup with region info
        const popup = new mapboxgl.Popup({ offset: [0, -15] })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="padding: 12px; max-width: 300px;">
              <h3 style="color: ${regionData.color}; margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">
                ${regionData.name}
              </h3>
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; line-height: 1.4;">
                ${regionData.description}
              </p>
              <div style="font-size: 12px; color: #888;">
                <div style="margin-bottom: 4px;"><strong>States:</strong> ${stateNames.join(', ')}</div>
                <div><strong>Major Cities:</strong> ${regionData.cities.slice(0, 3).map(city => city.name).join(', ')}
                ${regionData.cities.length > 3 ? '...' : ''}</div>
              </div>
            </div>
          `)
          .addTo(map);
      });

      map.on('mouseenter', `region-${regionId}`, () => {
        map.getCanvas().style.cursor = 'pointer';
        setHoveredRegion(regionId);
      });

      map.on('mouseleave', `region-${regionId}`, () => {
        map.getCanvas().style.cursor = '';
        setHoveredRegion(null);
      });
    });
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl overflow-hidden border border-gray-200">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10 rounded-xl">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading Professional Map Data...</p>
              <p className="text-sm text-gray-500 mt-1">Using Mapbox geographic boundaries</p>
            </div>
          </div>
        )}
        
        <div 
          ref={mapContainerRef}
          style={{ height: '600px', width: '100%' }}
          className="rounded-xl"
        />

        {/* Professional Map Controls */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200">
          <div className="text-sm text-gray-700">
            <div className="font-bold text-base mb-1 flex items-center">
              🗺️ <span className="ml-2">Mexico Tourism Regions</span>
            </div>
            <div className="text-xs text-gray-600">Professional Mapbox boundaries</div>
            <div className="text-xs text-gray-500 mt-1">Click regions • Zoom & pan • Real geography</div>
          </div>
        </div>

        {/* Map Attribution */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
          <div className="text-xs text-gray-600">
            <div className="font-semibold mb-1">Powered by Mapbox</div>
            <div>Professional geographic data</div>
          </div>
        </div>
      </div>

      {/* Enhanced Selected Region Info */}
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

      {/* Professional Map Legend */}
      <div className="mt-6 text-center">
        <p className="text-lg font-semibold text-gray-800 mb-2">
          🌎 Professional Interactive Mexico Map
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Built with Mapbox professional geographic data and real Mexican state boundaries. 
          Click any region to explore cities and attractions.
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

        <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          <strong>Note:</strong> This map uses Mapbox's professional geographic data with accurate Mexican state boundaries. 
          For production use, replace the demo token with your own Mapbox API key.
        </div>
      </div>
    </div>
  );
};

export default MapboxMexicoMap;