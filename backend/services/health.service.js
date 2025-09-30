import redisClient from '../utils/redisClient.js';
import { Pinecone } from '@pinecone-database/pinecone';

// Initialize Pinecone client only when an API key is provided. This keeps
// the health service safe to import/start in environments without Pinecone
// credentials (e.g., local development where Pinecone is optional).
let pinecone = null;
if (process.env.PINECONE_API_KEY) {
  try {
    pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  } catch (e) {
    // Don't throw during module import - log and keep pinecone disabled.
    console.warn('Pinecone client initialization failed:', e && e.message ? e.message : e);
    pinecone = null;
  }
}

export async function getHealth() {
  const results = {
    redis: { ok: false, details: null },
    pinecone: { ok: false, details: null }
  };

  // Redis
  try {
    await redisClient.connect();
    const pong = await redisClient.client.ping();
    results.redis.ok = pong === 'PONG' || !!pong;
    results.redis.details = { pong };
  } catch (e) {
    results.redis.ok = false;
    results.redis.details = { error: e.message };
  }

  // Pinecone - check index info (optional)
  try {
    if (pinecone && process.env.PINECONE_INDEX_NAME) {
      const idx = pinecone.index(process.env.PINECONE_INDEX_NAME);
      // Attempt a small metadata query or describeIndex if available
      const stats = await idx.describeIndexStats?.();
      results.pinecone.ok = true;
      results.pinecone.details = { stats };
    } else {
      results.pinecone.ok = false;
      results.pinecone.details = { error: 'PINECONE_API_KEY or PINECONE_INDEX_NAME not set or Pinecone client not initialized' };
    }
  } catch (e) {
    results.pinecone.ok = false;
    results.pinecone.details = { error: e.message };
  }

  return results;
}

export default { getHealth };
