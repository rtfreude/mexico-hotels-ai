// Simple in-memory status tracker for Sanity indexing operations
// This is intentionally minimal; in production you may persist this to Redis or a DB.

import redisClient from '../utils/redisClient.js';

let lastIndexedAt = null;
let lastIndexedCount = 0;
const REDIS_KEY = 'sanity:index:status:v1';

export async function setStatus(count) {
  lastIndexedAt = new Date().toISOString();
  lastIndexedCount = typeof count === 'number' ? count : 0;
  // Persist to Redis for durability if available
  try {
    await redisClient.connect();
    if (redisClient.client?.isOpen) {
      await redisClient.setJSON(REDIS_KEY, { lastIndexedAt, lastIndexedCount }, 60 * 60 * 24 * 7); // 7 days
    }
  } catch (e) {
    // ignore and keep using in-memory values
    console.warn('Redis unavailable for setStatus, keeping in-memory status');
  }
}

export async function getStatus() {
  // Try Redis first if available
  try {
    await redisClient.connect();
    if (redisClient.client?.isOpen) {
      const cached = await redisClient.getJSON(REDIS_KEY);
      if (cached && cached.lastIndexedAt) return cached;
    }
  } catch (e) {
    // ignore and return in-memory
    console.warn('Redis unavailable for getStatus, returning in-memory status');
  }

  return {
    lastIndexedAt,
    lastIndexedCount
  };
}

export default { setStatus, getStatus };
