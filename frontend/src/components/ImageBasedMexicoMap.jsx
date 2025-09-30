import { useState } from 'react';
import { motion } from 'framer-motion';

const ImageBasedMexicoMap = ({ selectedRegion, onRegionSelect, regions }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Regional coordinates based on actual Mexico map geography
  // These coordinates are percentages matching the Wikipedia Mexico map
  const regionOverlays = {
    'northern-mexico': {
      // Northern states: Sonora, Chihuahua, Coahuila, Nuevo León, Tamaulipas
      coordinates: [
        { x: 20, y: 15 }, // Northwest (Sonora)
        { x: 85, y: 20 }, // Northeast (Tamaulipas)  
        { x: 80, y: 45 }, // Southeast (Nuevo León/Coahuila border)
        { x: 25, y: 40 }, // Southwest (Sonora/Sinaloa border)
      ],
      center: { x: 52, y: 30 },
      name: "Northern Mexico"
    },
    'central-mexico': {
      // Central states: Mexico City area, Puebla, Hidalgo, Estado de México
      coordinates: [
        { x: 35, y: 45 }, // Northwest
        { x: 70, y: 40 }, // Northeast
        { x: 65, y: 65 }, // Southeast
        { x: 30, y: 70 }, // Southwest
      ],
      center: { x: 50, y: 55 },
      name: "Central Mexico"
    },
    'pacific-coast': {
      // Western coastal states: Jalisco, Nayarit, Sinaloa, Michoacán, Colima
      coordinates: [
        { x: 20, y: 40 }, // North (Sinaloa)
        { x: 35, y: 45 }, // Northeast (Jalisco)
        { x: 30, y: 70 }, // Southeast (Michoacán)
        { x: 15, y: 85 }, // South (Guerrero coast)
        { x: 10, y: 65 }, // Southwest coast
      ],
      center: { x: 25, y: 60 },
      name: "Pacific Coast"
    },
    'yucatan-peninsula': {
      // Yucatan Peninsula inland areas
      coordinates: [
        { x: 70, y: 40 }, // West border
        { x: 90, y: 35 }, // North coast
        { x: 95, y: 50 }, // East inland
        { x: 85, y: 65 }, // South
        { x: 70, y: 60 }, // Southwest
      ],
      center: { x: 80, y: 50 },
      name: "Yucatán Peninsula"
    },
    'riviera-maya': {
      // Caribbean coastal area - Quintana Roo coast
      coordinates: [
        { x: 85, y: 35 }, // North (Cancún area)
        { x: 95, y: 35 }, // Northeast coast
        { x: 95, y: 60 }, // Southeast coast
        { x: 90, y: 65 }, // South (Tulum area)
        { x: 85, y: 50 }, // West border
      ],
      center: { x: 90, y: 48 },
      name: "Riviera Maya"
    },
    'los-cabos': {
      // Baja California Sur - southern tip
      coordinates: [
        { x: 8, y: 20 }, // North
        { x: 15, y: 18 }, // Northeast
        { x: 18, y: 75 }, // Southeast tip
        { x: 5, y: 80 }, // Southwest tip
        { x: 3, y: 45 }, // West coast
      ],
      center: { x: 11, y: 50 },
      name: "Los Cabos"
    }
  };

  const handleRegionClick = (regionId) => {
    onRegionSelect(regionId);
  };

  const handleRegionHover = (regionId) => {
    setHoveredRegion(regionId);
  };

  const handleRegionLeave = () => {
    setHoveredRegion(null);
  };

  // Convert percentage coordinates to actual coordinates for the current image size
  const createPolygonPoints = (coords) => {
    return coords.map(coord => `${coord.x}%,${coord.y}%`).join(' ');
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl overflow-hidden border border-gray-200">
        {/* Mexico Map Image */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Mexico_blank_map.svg/800px-Mexico_blank_map.svg.png"
          alt="Mexico Map"
          className="w-full h-auto opacity-90"
          style={{ minHeight: '400px', objectFit: 'contain' }}
        />

        {/* Overlay SVG for clickable regions */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {Object.entries(regionOverlays).map(([regionId, region]) => {
            const isSelected = selectedRegion === regionId;
            const isHovered = hoveredRegion === regionId;
            const regionData = regions[regionId];

            return (
              <g key={regionId}>
                {/* Clickable region overlay */}
                <motion.polygon
                  points={createPolygonPoints(region.coordinates)}
                  fill={
                    isSelected 
                      ? regionData?.color + '80' || '#3B82F680'
                      : isHovered 
                        ? regionData?.color + '60' || '#3B82F660'
                        : 'transparent'
                  }
                  stroke={
                    isSelected 
                      ? regionData?.color || '#3B82F6'
                      : isHovered 
                        ? regionData?.color || '#3B82F6'
                        : 'transparent'
                  }
                  strokeWidth={isSelected ? "0.8" : isHovered ? "0.6" : "0"}
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => handleRegionClick(regionId)}
                  onMouseEnter={() => handleRegionHover(regionId)}
                  onMouseLeave={handleRegionLeave}
                  animate={{
                    scale: isHovered ? 1.02 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{
                    transformOrigin: `${region.center.x}% ${region.center.y}%`,
                    filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none'
                  }}
                />

                {/* Region label */}
                <motion.text
                  x={`${region.center.x}%`}
                  y={`${region.center.y}%`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-bold pointer-events-none select-none"
                  fill={isSelected || isHovered ? 'white' : '#1F2937'}
                  style={{
                    textShadow: isSelected || isHovered ? '1px 1px 2px rgba(0,0,0,0.5)' : '1px 1px 2px rgba(255,255,255,0.8)',
                    fontSize: '0.8rem'
                  }}
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {region.name}
                </motion.text>

                {/* Selection indicator */}
                {isSelected && (
                  <motion.circle
                    cx={`${region.center.x}%`}
                    cy={`${region.center.y + 8}%`}
                    r="0.8"
                    fill="white"
                    stroke={regionData?.color || '#3B82F6'}
                    strokeWidth="0.2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Compass overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-400 rounded-full relative">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">N</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scale indicator */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="text-xs text-gray-600">
            <div className="font-semibold">Mexico Regions</div>
            <div className="text-xs opacity-75">Click to select</div>
          </div>
        </div>
      </div>

      {/* Hover Information Panel */}
      {hoveredRegion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 max-w-xs z-10 border border-gray-200"
        >
          <h4 className="font-bold text-lg mb-2" style={{ color: regions[hoveredRegion]?.color }}>
            {regions[hoveredRegion]?.name}
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            {regions[hoveredRegion]?.description}
          </p>
          <div className="text-xs text-gray-500">
            <strong>Major Cities:</strong> {regions[hoveredRegion]?.cities.slice(0, 3).map(city => city.name).join(', ')}
            {regions[hoveredRegion]?.cities.length > 3 && '...'}
          </div>
        </motion.div>
      )}

      {/* Interactive Legend */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-4">Hover over regions to explore, click to select your destination</p>
        
        <div className="flex justify-center space-x-6 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-transparent border border-gray-300 rounded mr-2"></div>
            <span className="text-gray-500">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500/50 border border-blue-500 rounded mr-2"></div>
            <span className="text-gray-600">Hovered</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600/80 border border-blue-600 rounded mr-2"></div>
            <span className="text-gray-700 font-medium">Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageBasedMexicoMap;