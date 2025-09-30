import { useState } from 'react';

const InteractiveRegionMap = ({ onRegionSelect, selectedRegion }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  const regions = [
    {
      id: 'caribbean',
      name: 'Caribbean Coast',
      description: 'Cancún, Playa del Carmen, Tulum',
      position: { top: '25%', left: '78%' },
      color: 'rgba(59, 130, 246, 0.8)'
    },
    {
      id: 'pacific',
      name: 'Pacific Coast', 
      description: 'Puerto Vallarta, Mazatlán, Acapulco',
      position: { top: '50%', left: '22%' },
      color: 'rgba(245, 158, 11, 0.8)'
    },
    {
      id: 'interior',
      name: 'Interior Mexico',
      description: 'Mexico City, Guadalajara, Puebla', 
      position: { top: '45%', left: '50%' },
      color: 'rgba(16, 185, 129, 0.8)'
    }
  ];

  const handleRegionClick = (region) => {
    onRegionSelect?.(region);
  };

  const handleRegionHover = (regionId) => {
    setHoveredRegion(regionId);
  };

  const handleRegionLeave = () => {
    setHoveredRegion(null);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
      {/* Realistic coastline background image */}
      <div 
        className="relative aspect-[4/3] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80')`
        }}
      >
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Mexico outline/silhouette */}
        <svg 
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Mexico country outline */}
          <path
            d="M 150 200 L 200 150 L 280 140 L 360 145 L 420 150 L 480 155 L 540 160 L 600 170 L 650 175 L 700 180 L 740 185 L 770 200 L 785 220 L 790 250 L 785 280 L 775 310 L 760 335 L 740 355 L 715 375 L 685 390 L 650 400 L 610 405 L 570 408 L 530 410 L 490 412 L 450 415 L 410 418 L 370 420 L 330 418 L 290 415 L 250 410 L 210 400 L 180 385 L 160 365 L 145 340 L 135 315 L 130 290 L 132 265 L 138 240 L 145 215 Z"
            fill="rgba(255, 255, 255, 0.3)"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="2"
            className="drop-shadow-lg"
          />
          
          {/* Additional Mexico geographic features for realism */}
          <path
            d="M 650 175 L 680 165 L 710 170 L 730 180 L 740 200 L 735 220 L 720 235 L 700 240 L 680 235 L 665 220 L 655 200 L 650 180 Z"
            fill="rgba(255, 255, 255, 0.2)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1"
          />
          
          {/* Yucatan Peninsula */}
          <path
            d="M 700 180 L 750 170 L 780 175 L 790 190 L 785 210 L 770 225 L 750 230 L 725 225 L 710 210 L 705 195 Z"
            fill="rgba(255, 255, 255, 0.2)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1"
          />
          
          {/* Baja California Peninsula */}
          <path
            d="M 150 200 L 130 180 L 125 160 L 130 140 L 140 120 L 155 105 L 175 95 L 195 100 L 210 115 L 215 135 L 210 155 L 200 175 L 185 190 L 170 200 Z"
            fill="rgba(255, 255, 255, 0.2)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1"
          />
        </svg>
        
        {/* Interactive region hotspots */}
        {regions.map((region) => {
          const isSelected = selectedRegion?.id === region.id;
          const isHovered = hoveredRegion === region.id;
          
          return (
            <div
              key={region.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                top: region.position.top,
                left: region.position.left
              }}
              onClick={() => handleRegionClick(region)}
              onMouseEnter={() => handleRegionHover(region.id)}
              onMouseLeave={handleRegionLeave}
            >
              {/* Region marker */}
              <div className={`relative transition-all duration-300 ${
                isSelected || isHovered ? 'scale-125' : 'scale-100'
              }`}>
                {/* Pulsing background circle */}
                <div 
                  className={`w-16 h-16 rounded-full transition-all duration-300 ${
                    isSelected || isHovered ? 'animate-pulse' : ''
                  }`}
                  style={{ backgroundColor: region.color }}
                ></div>
                
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"></div>
                
                {/* Region name label */}
                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 ${
                  isSelected || isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}>
                  <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                    {region.name}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Region info panel */}
        {(selectedRegion || hoveredRegion) && (
          <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/20 transition-all duration-300">
            {(() => {
              const region = regions.find(r => r.id === (selectedRegion?.id || hoveredRegion));
              return region ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {region.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {region.description}
                    </p>
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: region.color }}
                  />
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Instructions overlay */}
        {!selectedRegion && !hoveredRegion && (
          <div className="absolute top-6 left-6 right-6 text-center">
            <div className="inline-block bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
              <p className="text-sm text-gray-700 font-medium">
                Click on any region to explore resorts and hotels
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveRegionMap;