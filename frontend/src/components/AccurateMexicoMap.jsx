import { useState } from 'react';
import { motion } from 'framer-motion';

const AccurateMexicoMap = ({ selectedRegion, onRegionSelect, regions }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Accurate Mexico regional boundaries based on real geography
  const mapRegions = {
    'northern-mexico': {
      // Sonora, Chihuahua, Coahuila, Nuevo León, Tamaulipas
      path: "M20,80 L100,70 L180,65 L260,60 L340,55 L420,50 L500,45 L580,40 L660,35 L740,30 L800,35 L840,45 L860,60 L870,80 L875,100 L870,120 L860,140 L840,155 L810,165 L780,170 L750,175 L720,180 L690,185 L660,190 L630,195 L600,200 L570,205 L540,210 L510,215 L480,220 L450,225 L420,230 L390,235 L360,240 L330,245 L300,250 L270,255 L240,260 L210,265 L180,270 L150,275 L120,280 L90,285 L60,290 L30,295 L15,280 L10,260 L8,240 L7,220 L8,200 L10,180 L12,160 L15,140 L17,120 L20,100 Z",
      center: [445, 167],
      name: "Northern Mexico",
      states: ["Sonora", "Chihuahua", "Coahuila", "Nuevo León", "Tamaulipas"]
    },
    'central-mexico': {
      // Mexico City area, Puebla, Hidalgo, Estado de México, Morelos
      path: "M180,270 L270,255 L360,240 L450,225 L540,210 L630,195 L650,220 L665,245 L675,270 L680,295 L675,320 L665,345 L650,370 L630,390 L605,405 L575,415 L545,420 L515,425 L485,430 L455,435 L425,440 L395,445 L365,450 L335,455 L305,460 L275,465 L245,470 L215,475 L185,480 L155,485 L125,490 L100,485 L80,475 L65,460 L55,440 L50,420 L48,400 L50,380 L55,360 L65,340 L80,325 L100,315 L125,310 L155,315 L180,320 L180,295 Z",
      center: [362, 358],
      name: "Central Mexico",
      states: ["Mexico City", "Estado de México", "Puebla", "Hidalgo", "Morelos", "Tlaxcala"]
    },
    'pacific-coast': {
      // Jalisco, Nayarit, Sinaloa, Michoacán, Colima, Guerrero (coastal)
      path: "M15,280 L60,290 L90,285 L120,280 L150,275 L180,270 L180,295 L180,320 L155,315 L125,310 L100,315 L80,325 L65,340 L55,360 L50,380 L48,400 L50,420 L55,440 L65,460 L80,475 L100,485 L125,490 L155,485 L185,480 L215,475 L245,470 L275,465 L305,460 L335,455 L365,450 L395,445 L365,470 L335,495 L305,520 L275,545 L245,570 L215,595 L185,620 L155,645 L125,670 L95,695 L65,720 L35,745 L10,720 L5,695 L3,670 L2,645 L3,620 L5,595 L8,570 L12,545 L15,520 L17,495 L18,470 L17,445 L15,420 L12,395 L8,370 L5,345 L3,320 L5,295 Z",
      center: [176, 498],
      name: "Pacific Coast",
      states: ["Jalisco", "Nayarit", "Sinaloa", "Michoacán", "Colima", "Guerrero"]
    },
    'yucatan-peninsula': {
      // Yucatán, Campeche, Quintana Roo (inland areas)
      path: "M650,220 L740,210 L830,200 L920,190 L980,200 L1020,220 L1040,250 L1045,280 L1040,310 L1020,340 L980,360 L930,375 L880,385 L830,390 L780,395 L730,400 L680,405 L630,410 L580,415 L530,420 L480,425 L450,400 L430,375 L420,350 L415,325 L420,300 L430,275 L450,250 L480,235 L515,225 L550,220 L585,215 L620,210 Z",
      center: [732, 312],
      name: "Yucatán Peninsula",
      states: ["Yucatán", "Campeche", "Quintana Roo (inland)"]
    },
    'riviera-maya': {
      // Quintana Roo coastal areas (Cancun, Playa del Carmen, Tulum)
      path: "M920,190 L1020,180 L1080,190 L1120,210 L1140,240 L1145,270 L1140,300 L1120,330 L1080,350 L1020,365 L980,360 L930,375 L920,350 L915,325 L920,300 L930,275 L950,250 L970,225 L990,200 Z",
      center: [1030, 277],
      name: "Riviera Maya",
      states: ["Quintana Roo (coastal)", "Caribbean Coast"]
    },
    'los-cabos': {
      // Baja California Sur
      path: "M20,80 L80,60 L140,40 L200,20 L260,0 L300,20 L320,50 L325,80 L320,110 L300,140 L260,160 L200,180 L140,200 L80,220 L20,240 L5,220 L0,200 L0,180 L0,160 L0,140 L0,120 L0,100 Z",
      center: [162, 120],
      name: "Los Cabos",
      states: ["Baja California Sur"]
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

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <svg
        viewBox="0 0 1200 500"
        className="w-full h-auto border border-gray-200 rounded-xl bg-gradient-to-br from-blue-50 to-teal-50"
        style={{ minHeight: '400px' }}
      >
        {/* Definitions for gradients and effects */}
        <defs>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
          
          <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="rgba(0,0,0,0.25)"/>
          </filter>

          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" opacity="0.4" />
            <stop offset="100%" stopColor="#1E40AF" opacity="0.6" />
          </linearGradient>
        </defs>

        {/* Ocean background */}
        <rect width="1200" height="500" fill="url(#oceanGradient)" />

        {/* Water bodies */}
        {/* Gulf of Mexico */}
        <ellipse cx="900" cy="150" rx="200" ry="80" fill="url(#waterGradient)" />
        <ellipse cx="1050" cy="250" rx="120" ry="60" fill="url(#waterGradient)" />
        
        {/* Pacific Ocean */}
        <ellipse cx="150" cy="400" rx="180" ry="120" fill="url(#waterGradient)" />
        <ellipse cx="50" cy="200" rx="80" ry="150" fill="url(#waterGradient)" />

        {/* Country outline for reference */}
        <path
          d="M20,80 Q100,70 260,60 Q500,45 800,35 Q870,40 875,100 Q870,140 810,165 Q630,195 450,225 Q365,450 275,465 Q125,490 65,720 Q35,745 10,720 Q2,645 5,295 Q8,200 20,80"
          stroke="#D1D5DB"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />

        {/* Map Regions */}
        {Object.entries(mapRegions).map(([regionId, region]) => {
          const isSelected = selectedRegion === regionId;
          const isHovered = hoveredRegion === regionId;
          const regionData = regions[regionId];
          
          return (
            <g key={regionId}>
              <motion.path
                d={region.path}
                fill={isSelected ? regionData?.color || '#3B82F6' : '#F9FAFB'}
                stroke={isSelected ? '#1D4ED8' : isHovered ? regionData?.color || '#3B82F6' : '#E5E7EB'}
                strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                className="cursor-pointer transition-all duration-200"
                onClick={() => handleRegionClick(regionId)}
                onMouseEnter={() => handleRegionHover(regionId)}
                onMouseLeave={handleRegionLeave}
                animate={{
                  scale: isHovered ? 1.02 : 1,
                  y: isHovered ? -1 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{
                  filter: isHovered ? 'url(#dropshadow)' : 'none',
                  transformOrigin: `${region.center[0]}px ${region.center[1]}px`
                }}
              />
              
              {/* Region Label */}
              <motion.text
                x={region.center[0]}
                y={region.center[1]}
                textAnchor="middle"
                className="text-sm font-semibold pointer-events-none select-none"
                fill={isSelected ? 'white' : isHovered ? 'white' : '#374151'}
                animate={{
                  scale: isHovered ? 1.05 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {region.name}
              </motion.text>
              
              {/* Selection indicator */}
              {isSelected && (
                <motion.circle
                  cx={region.center[0]}
                  cy={region.center[1] + 20}
                  r="4"
                  fill="white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
            </g>
          );
        })}

        {/* Decorative elements */}
        <g opacity="0.7">
          {/* Sun */}
          <circle cx="1100" cy="50" r="20" fill="#FCD34D" />
          <g stroke="#FCD34D" strokeWidth="2">
            <line x1="1085" y1="35" x2="1092" y2="42" />
            <line x1="1108" y1="42" x2="1115" y2="35" />
            <line x1="1115" y1="65" x2="1108" y2="58" />
            <line x1="1092" y1="58" x2="1085" y2="65" />
            <line x1="1075" y1="50" x2="1085" y2="50" />
            <line x1="1115" y1="50" x2="1125" y2="50" />
            <line x1="1100" y1="25" x2="1100" y2="15" />
            <line x1="1100" y1="85" x2="1100" y2="75" />
          </g>

          {/* Compass Rose */}
          <g transform="translate(50,50)" opacity="0.8">
            <circle cx="0" cy="0" r="25" fill="white" stroke="#374151" strokeWidth="2" />
            <polygon points="0,-18 -6,6 0,0 6,6" fill="#EF4444" />
            <polygon points="0,18 -6,-6 0,0 6,-6" fill="#6B7280" />
            <text x="0" y="-35" textAnchor="middle" className="text-sm font-bold" fill="#374151">N</text>
            <text x="35" y="5" textAnchor="middle" className="text-sm font-bold" fill="#374151">E</text>
            <text x="0" y="50" textAnchor="middle" className="text-sm font-bold" fill="#374151">S</text>
            <text x="-35" y="5" textAnchor="middle" className="text-sm font-bold" fill="#374151">W</text>
          </g>

          {/* Palm trees */}
          <g transform="translate(1050,400)" opacity="0.6">
            <line x1="0" y1="0" x2="0" y2="30" stroke="#8B4513" strokeWidth="3" />
            <path d="M0,0 Q-12,-8 -18,-12 M0,0 Q12,-8 18,-12 M0,0 Q-8,-12 -12,-18 M0,0 Q8,-12 12,-18" 
                  stroke="#22C55E" strokeWidth="3" fill="none" />
          </g>
          
          <g transform="translate(100,450)" opacity="0.6">
            <line x1="0" y1="0" x2="0" y2="20" stroke="#8B4513" strokeWidth="2" />
            <path d="M0,0 Q-8,-6 -12,-9 M0,0 Q8,-6 12,-9 M0,0 Q-6,-8 -9,-12 M0,0 Q6,-8 9,-12" 
                  stroke="#22C55E" strokeWidth="2" fill="none" />
          </g>
        </g>

        {/* Title */}
        <text x="600" y="30" textAnchor="middle" className="text-lg font-bold" fill="#1F2937">
          Mexico Regions
        </text>
      </svg>

      {/* Hover Information Panel */}
      {hoveredRegion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs z-10"
        >
          <h4 className="font-bold text-lg mb-2" style={{ color: regions[hoveredRegion]?.color }}>
            {regions[hoveredRegion]?.name}
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            {regions[hoveredRegion]?.description}
          </p>
          <div className="text-xs text-gray-500">
            <strong>Cities:</strong> {regions[hoveredRegion]?.cities.map(city => city.name).join(', ')}
          </div>
        </motion.div>
      )}

      {/* Map Legend */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-3">Click on a region to explore its cities and attractions</p>
        <div className="flex justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded mr-2"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded mr-2"></div>
            <span>Hovered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccurateMexicoMap;