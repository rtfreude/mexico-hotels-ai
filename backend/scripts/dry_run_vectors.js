#!/usr/bin/env node
import sampleHotels from '../data/sample-hotels.js';

function buildVectorPayload(hotel) {
  const amenitiesList = Array.isArray(hotel.amenities) ? hotel.amenities : [];

  const location = typeof hotel.location === 'object'
    ? `${hotel.location.address || ''}, ${hotel.location.city || ''}, ${hotel.location.state || ''}`
    : hotel.location || '';

  const city = hotel.location?.city || hotel.city || 'Unknown';
  const state = hotel.location?.state || hotel.state || 'Mexico';

  const regionName = (hotel.region && typeof hotel.region === 'object') ? (hotel.region.name || hotel.regionName || '') : (hotel.region || hotel.regionName || '');
  const regionId = (hotel.region && typeof hotel.region === 'object') ? (hotel.region.id || hotel.region._id || hotel.region._ref || null) : (hotel.regionId || null);
  const regionSlug = (hotel.region && typeof hotel.region === 'object') ? (hotel.region.slug || hotel.regionSlug || '') : (hotel.regionSlug || '');

  const textToEmbed = `Hotel: ${hotel.name}\nLocation: ${location}\nCity: ${city}\nState: ${state}\nRegion: ${regionName}\nDescription: ${hotel.description || ''}\nAmenities: ${amenitiesList.join(', ')}\nPrice Range: ${hotel.priceRange || ''}\nRating: ${hotel.rating || ''}\nType: ${hotel.type || ''}`;

  const metadata = {
    name: hotel.name,
    location: location,
    city: city,
    state: state,
    description: hotel.description || '',
    amenities: JSON.stringify(amenitiesList),
    priceRange: hotel.priceRange || '',
    rating: hotel.rating || 0,
    reviewCount: hotel.reviewCount || 0,
    type: hotel.type || 'Hotel',
    imageUrl: hotel.imageUrl || (hotel.images?.[0]?.url) || '',
    affiliateLink: hotel.affiliateLink || hotel.bookingUrl || '',
    nearbyAttractions: JSON.stringify(hotel.nearbyAttractions || []),
    latitude: hotel.location?.latitude || 0,
    longitude: hotel.location?.longitude || 0,
    regionName: regionName || '',
    regionId: regionId || null,
    regionSlug: regionSlug || ''
  };

  return { id: hotel.id || `hotel-${Math.random()}`, textToEmbed, metadata };
}

function main() {
  const subset = sampleHotels.slice(0, 5);
  const results = subset.map(buildVectorPayload);
  console.log(JSON.stringify(results, null, 2));
}

main();
