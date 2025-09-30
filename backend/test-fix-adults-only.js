// Direct test to force re-seed with sample data
import fetch from 'node-fetch';

async function testAndFixAdultsOnly() {
  console.log('🔧 Diagnosing adults-only resort issue...\n');
  
  try {
    // 1. Check if backend is responding
    console.log('1. Testing backend connectivity...');
    const healthResponse = await fetch('http://localhost:5001/api/ai/health');
    if (healthResponse.ok) {
      console.log('✅ Backend is responding');
    } else {
      console.log('❌ Backend health check failed');
      return;
    }

    // 2. Force re-seed with sample data
    console.log('\n2. Force re-seeding with sample data...');
    const seedResponse = await fetch('http://localhost:5001/api/hotels/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ useSampleData: true })
    });
    
    const seedResult = await seedResponse.json();
    console.log('Seed result:', seedResult);

    // 3. Test adults-only search
    console.log('\n3. Testing adults-only Cancun search...');
    const searchResponse = await fetch('http://localhost:5001/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'Show me adults only resorts in Cancun',
        sessionId: 'test-session-' + Date.now()
      })
    });
    
    const searchResult = await searchResponse.json();
    console.log('Search returned', searchResult.hotels?.length || 0, 'hotels');
    
    if (searchResult.hotels) {
      console.log('Adults-only hotels found:');
      searchResult.hotels.forEach((hotel, index) => {
        const isAdultsOnly = hotel.amenities?.some(a => a.toLowerCase().includes('adults only'));
        const location = hotel.city || hotel.location || 'Unknown';
        console.log(`${index + 1}. ${hotel.name} - ${location} ${isAdultsOnly ? '✅ Adults Only' : '❌ Not Adults Only'}`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAndFixAdultsOnly();