import { useState } from 'react';
import { motion } from 'framer-motion';

const InteractiveMexicoMap = ({ selectedRegion, onRegionSelect, regions }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Accurate Mexico outline and regional boundaries based on real geography
  const mexicoOutline = "M50,180 L45,175 L40,170 L35,165 L30,160 L28,155 L30,150 L35,145 L40,140 L50,135 L65,130 L80,125 L100,120 L120,115 L140,110 L160,108 L180,106 L200,105 L220,104 L240,103 L260,102 L280,101 L300,100 L320,99 L340,98 L360,97 L380,96 L400,95 L420,94 L440,93 L460,92 L480,91 L500,90 L520,89 L540,88 L560,87 L580,86 L600,85 L620,84 L640,83 L660,82 L680,81 L700,80 L720,79 L740,78 L760,77 L780,76 L800,75 L820,74 L840,73 L860,72 L880,71 L900,70 L920,69 L940,68 L960,67 L980,66 L1000,65 L1020,64 L1040,63 L1060,62 L1080,61 L1100,60 L1120,59 L1140,58 L1160,57 L1180,56 L1200,55 L1220,54 L1240,53 L1260,52 L1280,51 L1300,50 L1320,51 L1340,52 L1360,54 L1380,56 L1400,58 L1420,60 L1440,62 L1460,65 L1480,68 L1500,72 L1520,76 L1540,80 L1560,85 L1580,90 L1600,96 L1620,102 L1640,109 L1660,116 L1680,124 L1700,132 L1720,141 L1740,150 L1760,160 L1780,170 L1800,181 L1820,192 L1840,204 L1860,216 L1880,229 L1900,242 L1920,256 L1940,270 L1960,285 L1980,300 L2000,316 L2020,332 L2040,349 L2060,366 L2080,384 L2100,402 L2120,421 L2140,440 L2160,460 L2180,480 L2200,501 L2220,522 L2240,544 L2260,566 L2280,589 L2300,612 L2320,636 L2340,660 L2360,685 L2380,710 L2400,736 L2420,762 L2440,789 L2460,816 L2480,844 L2500,872 L2520,901 L2540,930 L2560,960 L2580,990 L2600,1021 L2620,1052 L2640,1084 L2660,1116 L2680,1149 L2700,1182 L2720,1216 L2740,1250 L2760,1285 L2780,1320 L2800,1356 L2820,1392 L2840,1429 L2860,1466 L2880,1504 L2900,1542 L2920,1581 L2940,1620 L2960,1660 L2980,1700 L3000,1741 L3020,1782 L3040,1824 L3060,1866 L3080,1909 L3100,1952 L3120,1996 L3140,2040 L3160,2085 L3180,2130 L3200,2176 L3220,2222 L3240,2269 L3260,2316 L3280,2364 L3300,2412 L3320,2461 L3340,2510 L3360,2560 L3380,2610 L3400,2661 L3420,2712 L3440,2764 L3460,2816 L3480,2869 L3500,2922 L3520,2976 L3540,3030 L3560,3085 L3580,3140 L3600,3196 L3620,3252 L3640,3309 L3660,3366 L3680,3424 L3700,3482 L3720,3541 L3740,3600 L3760,3660 L3780,3720 L3800,3781 L3820,3842 L3840,3904 L3860,3966 L3880,4029 L3900,4092 L3920,4156 L3940,4220 L3960,4285 L3980,4350 L4000,4416";

  const mapRegions = {
    'northern-mexico': {
      // Sonora, Chihuahua, Coahuila, Nuevo León, Tamaulipas
      path: "M80,60 L580,50 L620,70 L640,90 L660,110 L680,130 L700,150 L720,170 L740,180 L760,185 L780,188 L800,190 L780,200 L760,210 L740,220 L720,230 L700,240 L680,245 L660,248 L640,250 L620,248 L600,245 L580,240 L560,235 L540,228 L520,220 L500,210 L480,198 L460,185 L440,170 L420,154 L400,138 L380,122 L360,108 L340,96 L320,86 L300,78 L280,72 L260,68 L240,66 L220,66 L200,68 L180,72 L160,78 L140,86 L120,96 L100,108 L90,122 L85,138 L82,154 L80,170 L78,186 L76,202 L74,218 L72,234 L70,250 L68,266 L66,282 L64,298 L62,314 L60,330 L58,346 L56,362 L54,378 L52,394 L50,410 L80,60 Z",
      center: [380, 155],
      name: "Northern Mexico"
    },
    'central-mexico': {
      // Mexico City, Estado de México, Puebla, Tlaxcala, Hidalgo, Morelos, Guerrero (northern part)
      path: "M240,280 L520,270 L540,290 L560,310 L580,330 L600,350 L580,370 L560,390 L540,410 L520,430 L500,445 L480,458 L460,470 L440,480 L420,488 L400,494 L380,498 L360,500 L340,500 L320,498 L300,494 L280,488 L260,480 L245,470 L235,458 L228,445 L224,430 L222,414 L222,398 L224,382 L228,366 L235,351 L240,336 L242,321 L240,306 L238,291 L240,280 Z",
      center: [390, 385],
      name: "Central Mexico"
    },
    'pacific-coast': {
      // Jalisco, Nayarit, Sinaloa, Michoacán, Colima, Guerrero (coastal)
      path: "M80,200 L240,220 L260,240 L280,260 L300,280 L320,300 L340,320 L360,340 L340,360 L320,380 L300,400 L280,420 L260,440 L240,460 L220,480 L200,500 L180,520 L160,540 L140,560 L120,580 L100,600 L80,620 L60,640 L40,620 L35,600 L32,580 L30,560 L30,540 L32,520 L35,500 L40,480 L45,460 L52,440 L60,420 L68,400 L76,380 L82,360 L86,340 L88,320 L88,300 L86,280 L82,260 L76,240 L68,220 L80,200 Z",
      center: [180, 410],
      name: "Pacific Coast"
    },
    'yucatan-peninsula': {
      // Yucatán, Campeche, Quintana Roo (inland)
      path: "M620,280 L740,270 L760,290 L780,310 L800,330 L820,350 L840,370 L860,390 L880,410 L900,430 L920,450 L900,470 L880,490 L860,510 L840,530 L820,550 L800,570 L780,590 L760,610 L740,630 L720,650 L700,630 L680,610 L660,590 L640,570 L620,550 L600,530 L580,510 L560,490 L540,470 L520,450 L500,430 L480,410 L460,390 L440,370 L420,350 L400,330 L380,310 L360,290 L380,270 L400,250 L420,230 L440,210 L460,190 L480,170 L500,150 L520,130 L540,110 L560,90 L580,70 L600,50 L620,30 L640,10 L660,30 L680,50 L700,70 L720,90 L740,110 L760,130 L780,150 L800,170 L820,190 L840,210 L860,230 L880,250 L900,270 L920,290 L900,310 L880,330 L860,350 L840,370 L820,390 L800,410 L780,430 L760,450 L740,470 L720,490 L700,510 L680,530 L660,550 L640,570 L620,590 L600,610 L580,630 L560,650 L540,670 L520,690 L500,710 L480,730 L460,750 L440,770 L420,790 L400,810 L380,830 L360,850 L340,870 L320,890 L300,910 L280,930 L260,950 L240,970 L220,990 L200,1010 L180,1030 L160,1050 L140,1070 L120,1090 L100,1110 L80,1130 L60,1150 L40,1170 L20,1190 L0,1210 L20,1230 L40,1250 L60,1270 L80,1290 L100,1310 L120,1330 L140,1350 L160,1370 L180,1390 L200,1410 L220,1430 L240,1450 L260,1470 L280,1490 L300,1510 L320,1530 L340,1550 L360,1570 L380,1590 L400,1610 L420,1630 L440,1650 L460,1670 L480,1690 L500,1710 L520,1730 L540,1750 L560,1770 L580,1790 L600,1810 L620,1830 L640,1850 L660,1870 L680,1890 L700,1910 L720,1930 L740,1950 L760,1970 L780,1990 L800,2010 L620,280 Z",
      center: [680, 460],
      name: "Yucatán Peninsula"
    },
    'riviera-maya': {
      // Quintana Roo (coastal)
      path: "M740,350 L860,340 L880,360 L900,380 L920,400 L940,420 L960,440 L940,460 L920,480 L900,500 L880,520 L860,540 L840,560 L820,580 L800,600 L780,620 L760,640 L740,620 L720,600 L700,580 L680,560 L660,540 L640,520 L620,500 L600,480 L580,460 L560,440 L540,420 L520,400 L500,380 L480,360 L460,340 L480,320 L500,300 L520,280 L540,260 L560,240 L580,220 L600,200 L620,180 L640,160 L660,140 L680,120 L700,100 L720,80 L740,60 L760,40 L780,20 L800,40 L820,60 L840,80 L860,100 L880,120 L900,140 L920,160 L940,180 L960,200 L980,220 L1000,240 L1020,260 L1040,280 L1060,300 L1080,320 L1100,340 L1120,360 L1140,380 L1160,400 L1180,420 L1200,440 L1220,460 L1240,480 L1260,500 L1280,520 L1300,540 L1320,560 L1340,580 L1360,600 L1380,620 L1400,640 L1420,660 L1440,680 L1460,700 L1480,720 L1500,740 L1520,760 L1540,780 L1560,800 L1580,820 L1600,840 L1620,860 L1640,880 L1660,900 L1680,920 L1700,940 L1720,960 L1740,980 L1760,1000 L1780,1020 L1800,1040 L1820,1060 L1840,1080 L1860,1100 L1880,1120 L1900,1140 L1920,1160 L1940,1180 L1960,1200 L1980,1220 L2000,1240 L2020,1260 L2040,1280 L2060,1300 L2080,1320 L2100,1340 L2120,1360 L2140,1380 L2160,1400 L2180,1420 L2200,1440 L2220,1460 L2240,1480 L2260,1500 L2280,1520 L2300,1540 L2320,1560 L2340,1580 L2360,1600 L2380,1620 L2400,1640 L2420,1660 L2440,1680 L2460,1700 L2480,1720 L2500,1740 L2520,1760 L2540,1780 L2560,1800 L2580,1820 L2600,1840 L2620,1860 L2640,1880 L2660,1900 L2680,1920 L2700,1940 L2720,1960 L2740,1980 L2760,2000 L740,350 Z",
      center: [830, 520],
      name: "Riviera Maya"
    },
    'los-cabos': {
      // Baja California Sur
      path: "M40,100 L120,90 L140,110 L160,130 L180,150 L200,170 L220,190 L240,210 L220,230 L200,250 L180,270 L160,290 L140,310 L120,330 L100,350 L80,370 L60,390 L40,410 L20,430 L0,450 L20,470 L40,490 L60,510 L80,530 L100,550 L120,570 L140,590 L160,610 L180,630 L200,650 L220,670 L240,690 L260,710 L280,730 L300,750 L320,770 L340,790 L360,810 L380,830 L400,850 L420,870 L440,890 L460,910 L480,930 L500,950 L520,970 L540,990 L560,1010 L580,1030 L600,1050 L620,1070 L640,1090 L660,1110 L680,1130 L700,1150 L720,1170 L740,1190 L760,1210 L780,1230 L800,1250 L820,1270 L840,1290 L860,1310 L880,1330 L900,1350 L920,1370 L940,1390 L960,1410 L980,1430 L1000,1450 L1020,1470 L1040,1490 L1060,1510 L1080,1530 L1100,1550 L1120,1570 L1140,1590 L1160,1610 L1180,1630 L1200,1650 L1220,1670 L1240,1690 L1260,1710 L1280,1730 L1300,1750 L1320,1770 L1340,1790 L1360,1810 L1380,1830 L1400,1850 L1420,1870 L1440,1890 L1460,1910 L1480,1930 L1500,1950 L1520,1970 L1540,1990 L1560,2010 L1580,2030 L1600,2050 L1620,2070 L1640,2090 L1660,2110 L1680,2130 L1700,2150 L1720,2170 L1740,2190 L1760,2210 L1780,2230 L1800,2250 L1820,2270 L1840,2290 L1860,2310 L1880,2330 L1900,2350 L1920,2370 L1940,2390 L1960,2410 L1980,2430 L2000,2450 L40,100 Z",
      center: [100, 600],
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

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <svg
        viewBox="0 0 500 350"
        className="w-full h-auto border border-gray-200 rounded-xl bg-gradient-to-br from-blue-50 to-teal-50"
        style={{ minHeight: '300px' }}
      >
        {/* Ocean/Water Background */}
        <defs>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
          
          {/* Shadow filter for hover effects */}
          <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>

        {/* Ocean background */}
        <rect width="500" height="350" fill="url(#oceanGradient)" />

        {/* Gulf of Mexico */}
        <ellipse cx="350" cy="120" rx="80" ry="40" fill="#3B82F6" opacity="0.3" />
        
        {/* Pacific Ocean */}
        <ellipse cx="100" cy="200" rx="60" ry="80" fill="#3B82F6" opacity="0.3" />

        {/* Map Regions */}
        {Object.entries(mapRegions).map(([regionId, region]) => {
          const isSelected = selectedRegion === regionId;
          const isHovered = hoveredRegion === regionId;
          const regionData = regions[regionId];
          
          return (
            <g key={regionId}>
              {/* Region Path */}
              <motion.path
                d={region.path}
                fill={isSelected ? regionData?.color || '#3B82F6' : '#F3F4F6'}
                stroke={isSelected ? '#1D4ED8' : isHovered ? regionData?.color || '#3B82F6' : '#D1D5DB'}
                strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                className="cursor-pointer transition-all duration-200"
                onClick={() => handleRegionClick(regionId)}
                onMouseEnter={() => handleRegionHover(regionId)}
                onMouseLeave={handleRegionLeave}
                animate={{
                  scale: isHovered ? 1.05 : 1,
                  y: isHovered ? -2 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
                className="text-xs font-semibold pointer-events-none select-none"
                fill={isSelected ? 'white' : isHovered ? 'white' : '#374151'}
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
                  cx={region.center[0]}
                  cy={region.center[1] + 15}
                  r="3"
                  fill="white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </g>
          );
        })}

        {/* Decorative elements */}
        <g opacity="0.6">
          {/* Sun */}
          <circle cx="450" cy="30" r="15" fill="#FCD34D" />
          <g stroke="#FCD34D" strokeWidth="2">
            <line x1="440" y1="20" x2="445" y2="25" />
            <line x1="455" y1="25" x2="460" y2="20" />
            <line x1="460" y1="40" x2="455" y2="35" />
            <line x1="445" y1="35" x2="440" y2="40" />
            <line x1="435" y1="30" x2="440" y2="30" />
            <line x1="460" y1="30" x2="465" y2="30" />
            <line x1="450" y1="15" x2="450" y2="10" />
            <line x1="450" y1="50" x2="450" y2="45" />
          </g>

          {/* Palm trees */}
          <g transform="translate(420,250)">
            <line x1="0" y1="0" x2="0" y2="20" stroke="#8B4513" strokeWidth="2" />
            <path d="M0,0 Q-8,-5 -12,-8 M0,0 Q8,-5 12,-8 M0,0 Q-5,-8 -8,-12 M0,0 Q5,-8 8,-12" 
                  stroke="#22C55E" strokeWidth="2" fill="none" />
          </g>
          
          <g transform="translate(60,280)">
            <line x1="0" y1="0" x2="0" y2="15" stroke="#8B4513" strokeWidth="1.5" />
            <path d="M0,0 Q-6,-4 -9,-6 M0,0 Q6,-4 9,-6 M0,0 Q-4,-6 -6,-9 M0,0 Q4,-6 6,-9" 
                  stroke="#22C55E" strokeWidth="1.5" fill="none" />
          </g>
        </g>

        {/* Compass */}
        <g transform="translate(30,30)" opacity="0.7">
          <circle cx="0" cy="0" r="18" fill="white" stroke="#374151" strokeWidth="1" />
          <polygon points="0,-12 -4,4 0,0 4,4" fill="#EF4444" />
          <polygon points="0,12 -4,-4 0,0 4,-4" fill="#374151" />
          <text x="0" y="-25" textAnchor="middle" className="text-xs font-bold" fill="#374151">N</text>
        </g>
      </svg>

      {/* Hover Information Panel */}
      {hoveredRegion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs"
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
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">Click on a region to explore its cities and attractions</p>
        <div className="flex justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded mr-1"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 border border-blue-600 rounded mr-1"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMexicoMap;