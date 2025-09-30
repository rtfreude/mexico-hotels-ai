// Test script to verify adults-only resorts in Cancun
console.log('Testing adults-only resorts in Cancun...\n');

// Test 1: Check sample data directly
import sampleHotels from './data/sample-hotels.js';

const adultsOnlyHotels = sampleHotels.filter(hotel => 
  hotel.amenities && hotel.amenities.some(amenity => 
    amenity.toLowerCase().includes('adults only')
  )
);

console.log('Adults-only hotels in sample data:', adultsOnlyHotels.length);

const cancunAdultsOnly = adultsOnlyHotels.filter(hotel => 
  (hotel.city && hotel.city.toLowerCase().includes('cancun')) ||
  (hotel.location && hotel.location.toLowerCase().includes('cancun'))
);

console.log('Adults-only hotels in Cancun area:', cancunAdultsOnly.length);
console.log('Cancun adults-only hotels:');
cancunAdultsOnly.forEach((hotel, index) => {
  console.log(`${index + 1}. ${hotel.name} - ${hotel.city || hotel.location}`);
});

console.log('\nAll adults-only hotels by location:');
adultsOnlyHotels.forEach((hotel, index) => {
  console.log(`${index + 1}. ${hotel.name} - ${hotel.city || hotel.location}`);
});