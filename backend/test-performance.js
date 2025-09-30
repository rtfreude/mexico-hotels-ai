import axios from 'axios';

const API_URL = 'http://localhost:5001/api/ai/chat';

// Test queries
const testQueries = [
  { query: "Hello", expectedType: "quick" },
  { query: "Hi!", expectedType: "quick" },
  { query: "Hotels in Cancun", expectedType: "hotel_search" },
  { query: "Best beach resorts in Playa del Carmen", expectedType: "hotel_search" },
  { query: "What's the weather like in Mexico?", expectedType: "general" },
  { query: "Tell me about Mexican food", expectedType: "general" },
  { query: "Luxury hotels in Tulum with spa", expectedType: "hotel_search" },
  { query: "Budget accommodations in Puerto Vallarta", expectedType: "hotel_search" }
];

// Performance test function
async function testPerformance() {
  console.log('🚀 Starting AI Performance Tests...\n');
  
  const results = [];
  let sessionId = null;
  
  for (const test of testQueries) {
    console.log(`Testing: "${test.query}"`);
    
    const startTime = Date.now();
    
    try {
      const response = await axios.post(API_URL, {
        query: test.query,
        sessionId: sessionId
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Store session ID for subsequent requests
      if (!sessionId && response.data.sessionId) {
        sessionId = response.data.sessionId;
      }
      
      results.push({
        query: test.query,
        responseTime: responseTime,
        hasHotels: response.data.hotels?.length > 0,
        messageLength: response.data.message?.length || 0,
        serverReportedTime: response.data.responseTime || 0,
        success: true
      });
      
      console.log(`✅ Response time: ${responseTime}ms (Server: ${response.data.responseTime || 'N/A'}ms)`);
      console.log(`   Hotels found: ${response.data.hotels?.length || 0}`);
      console.log(`   Message preview: ${response.data.message?.substring(0, 100)}...`);
      console.log('');
      
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      results.push({
        query: test.query,
        responseTime: responseTime,
        error: error.message,
        success: false
      });
      
      console.log(`❌ Error: ${error.message} (${responseTime}ms)`);
      console.log('');
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Test cache performance
  console.log('\n📊 Testing Cache Performance...\n');
  
  const cacheTest = "Hotels in Cancun"; // Same query as before
  console.log(`Repeating query: "${cacheTest}"`);
  
  const cacheStartTime = Date.now();
  try {
    const response = await axios.post(API_URL, {
      query: cacheTest,
      sessionId: sessionId
    });
    
    const cacheEndTime = Date.now();
    const cacheResponseTime = cacheEndTime - cacheStartTime;
    
    console.log(`✅ Cached response time: ${cacheResponseTime}ms (Server: ${response.data.responseTime || 'N/A'}ms)`);
    console.log('   This should be significantly faster than the first request\n');
    
    results.push({
      query: `${cacheTest} (CACHED)`,
      responseTime: cacheResponseTime,
      serverReportedTime: response.data.responseTime || 0,
      success: true,
      cached: true
    });
  } catch (error) {
    console.log(`❌ Cache test error: ${error.message}\n`);
  }
  
  // Summary statistics
  console.log('\n📈 Performance Summary:\n');
  
  const successfulResults = results.filter(r => r.success);
  const avgResponseTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length;
  const avgServerTime = successfulResults.filter(r => r.serverReportedTime).reduce((sum, r) => sum + r.serverReportedTime, 0) / successfulResults.filter(r => r.serverReportedTime).length;
  
  console.log(`Total tests: ${results.length}`);
  console.log(`Successful: ${successfulResults.length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  console.log(`Average response time: ${Math.round(avgResponseTime)}ms`);
  console.log(`Average server processing time: ${Math.round(avgServerTime)}ms`);
  
  // Find fastest and slowest
  const sortedByTime = successfulResults.sort((a, b) => a.responseTime - b.responseTime);
  console.log(`\nFastest query: "${sortedByTime[0].query}" - ${sortedByTime[0].responseTime}ms`);
  console.log(`Slowest query: "${sortedByTime[sortedByTime.length - 1].query}" - ${sortedByTime[sortedByTime.length - 1].responseTime}ms`);
  
  // Check if caching is working
  const originalQuery = results.find(r => r.query === "Hotels in Cancun" && !r.cached);
  const cachedQuery = results.find(r => r.cached);
  
  if (originalQuery && cachedQuery) {
    const improvement = ((originalQuery.responseTime - cachedQuery.responseTime) / originalQuery.responseTime * 100).toFixed(1);
    console.log(`\nCache improvement: ${improvement}% faster`);
  }
  
  // Performance recommendations
  console.log('\n💡 Performance Analysis:');
  
  if (avgResponseTime < 1000) {
    console.log('✅ Excellent! Average response time is under 1 second.');
  } else if (avgResponseTime < 2000) {
    console.log('⚡ Good performance. Average response time is under 2 seconds.');
  } else if (avgResponseTime < 3000) {
    console.log('⚠️  Acceptable performance. Average response time is under 3 seconds.');
  } else {
    console.log('❌ Poor performance. Average response time exceeds 3 seconds.');
  }
  
  // Check quick responses
  const quickResponses = results.filter(r => r.query.toLowerCase() === 'hello' || r.query.toLowerCase() === 'hi!');
  if (quickResponses.length > 0) {
    const avgQuickTime = quickResponses.reduce((sum, r) => sum + r.responseTime, 0) / quickResponses.length;
    console.log(`\nQuick responses (greetings) average: ${Math.round(avgQuickTime)}ms`);
    if (avgQuickTime < 200) {
      console.log('✅ Excellent! Greetings are nearly instant.');
    }
  }
}

// Run the test
console.log('Starting performance test in 3 seconds...\n');
setTimeout(testPerformance, 3000);
