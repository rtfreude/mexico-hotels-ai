import { useEffect, useRef, useState } from 'react';

function GoogleMap({ hotels = [], restaurants = [], activities = [] }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

    // Helper: load Google Maps script when component mounts
    useEffect(() => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setError('Missing Google Maps API key. Add VITE_GOOGLE_MAPS_API_KEY to frontend/.env (prefix with VITE_)');
        return;
      }

    // If script already loaded, just set loaded
    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }

    const existing = document.querySelector('script[data-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => setLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-google-maps', 'true');
    script.onload = () => setLoaded(true);
    script.onerror = () => setError('Failed to load Google Maps script. Check your API key and network.');
    document.head.appendChild(script);

    // cleanup: do not remove the script tag on unmount to allow reuse
  }, []);

  // Initialize map after script is loaded
  useEffect(() => {
    if (!loaded) return;
    if (!containerRef.current) return;

    const google = window.google;
    if (!google || !google.maps) {
      setError('Google Maps SDK not available.');
      return;
    }

    // Create map if doesn't exist
    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(containerRef.current, {
        center: { lat: 23.6345, lng: -102.5528 }, // Center of Mexico
        zoom: 5,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          // subtle modern style
          { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
          { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
          { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
          { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c8e6ff' }] }
        ]
      });
    }

    const map = mapRef.current;
    const geocoder = new google.maps.Geocoder();

    // Clear old markers
    markersRef.current.forEach(m => {
      try { m.setMap(null); } catch (err) { console.warn('Failed to remove marker', err); }
    });
    markersRef.current = [];

    // Check if we have any data to display
    const totalItems = hotels.length + restaurants.length + activities.length;
    if (totalItems === 0) {
      // No data: keep default view
      return;
    }

    // Helper function to create custom icon based on type
    const createCustomIcon = (type) => {
      const iconColor = {
        hotel: '#3B82F6', // blue
        restaurant: '#F97316', // orange  
        activity: '#10B981' // green
      }[type] || '#6B7280'; // gray fallback

      const iconSymbol = {
        hotel: '🏨',
        restaurant: '🍽️', 
        activity: '🎯'
      }[type] || '📍';

      return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="${iconColor}" stroke="white" stroke-width="3"/>
            <text x="20" y="26" text-anchor="middle" font-size="14" fill="white">${iconSymbol}</text>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20)
      };
    };

    // Helper function to create markers
    const createMarker = (item, type) => {
      const addressParts = [
        item.name, 
        item.location || '', 
        item.city || '', 
        item.state || ''
      ].filter(Boolean);
      const address = addressParts.join(', ');
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          const marker = new google.maps.Marker({
            position: loc,
            map,
            title: item.name,
            icon: createCustomIcon(type)
          });

          const content = document.createElement('div');
          content.style.maxWidth = '280px';
          
          let contentHTML = '';
          if (type === 'hotel') {
            contentHTML = `
              <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="font-size: 18px;">🏨</span>
                  <h3 style="margin:0; font-size:16px; font-weight: 600;">${item.name}</h3>
                </div>
                <p style="margin:0 0 6px 0; color:#555; font-size: 14px;">${item.location || item.city || ''}</p>
                <p style="margin:0; color:#333; font-size: 14px;">Rating: <strong>${item.rating ?? '—'}</strong></p>
                <p style="margin:4px 0 0 0; color:#666; font-size: 12px;">Price: ${item.priceRange || 'Contact for rates'}</p>
              </div>
            `;
          } else if (type === 'restaurant') {
            contentHTML = `
              <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="font-size: 18px;">🍽️</span>
                  <h3 style="margin:0; font-size:16px; font-weight: 600;">${item.name}</h3>
                </div>
                <p style="margin:0 0 6px 0; color:#555; font-size: 14px;">${item.location || ''}</p>
                <p style="margin:0 0 4px 0; color:#333; font-size: 14px;">Cuisine: <strong>${item.cuisine || 'Various'}</strong></p>
                <p style="margin:0; color:#333; font-size: 14px;">Rating: <strong>${item.rating ?? '—'}</strong></p>
                <p style="margin:4px 0 0 0; color:#666; font-size: 12px;">Price: ${item.priceRange || 'Varies'}</p>
              </div>
            `;
          } else if (type === 'activity') {
            contentHTML = `
              <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="font-size: 18px;">🎯</span>
                  <h3 style="margin:0; font-size:16px; font-weight: 600;">${item.name}</h3>
                </div>
                <p style="margin:0 0 6px 0; color:#555; font-size: 14px;">${item.location || ''}</p>
                <p style="margin:0 0 4px 0; color:#333; font-size: 14px;">Type: <strong>${item.type || 'Activity'}</strong></p>
                <p style="margin:0; color:#333; font-size: 14px;">Rating: <strong>${item.rating ?? '—'}</strong></p>
                ${item.duration ? `<p style="margin:4px 0 0 0; color:#666; font-size: 12px;">Duration: ${item.duration}</p>` : ''}
              </div>
            `;
          }
          
          content.innerHTML = contentHTML;
          const infowindow = new google.maps.InfoWindow({ content });

          marker.addListener('click', () => {
            infowindow.open(map, marker);
            map.panTo(marker.getPosition());
            map.setZoom(Math.max(map.getZoom(), 12));
          });

          markersRef.current.push(marker);
        } else {
          // geocode failure is okay; skip silently to avoid spam
          // console.warn('Geocode failed for', address, status);
        }
      });
    };

    // Create markers for hotels
    hotels.forEach((hotel) => {
      createMarker(hotel, 'hotel');
    });

    // Create markers for restaurants  
    restaurants.forEach((restaurant) => {
      createMarker(restaurant, 'restaurant');
    });

    // Create markers for activities
    activities.forEach((activity) => {
      createMarker(activity, 'activity');
    });

    // Optionally fit bounds to markers after a short delay (allow geocoding responses)
    setTimeout(() => {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach(m => bounds.extend(m.getPosition()));
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, 80);
      }
    }, 1200);
  }, [loaded, hotels, restaurants, activities]);

  return (
    <div className="relative">
      {!error ? (
        <div
          ref={containerRef}
          className="w-full h-[420px] md:h-[560px] lg:h-[640px] rounded-xl shadow-lg bg-gray-100 overflow-hidden"
          aria-label="Map showing hotel locations"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-72 p-6 bg-red-50 rounded-lg border border-red-100 text-red-700">
          {error}
        </div>
      )}
      {/* Floating hint */}
      <div className="absolute left-4 bottom-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 shadow">
        🏨 Hotels • 🍽️ Restaurants • 🎯 Activities
      </div>
    </div>
  );
}

export default GoogleMap;
