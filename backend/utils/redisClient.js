import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({
  url: REDIS_URL
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

let connected = false;
async function connect() {
  if (connected) return;
  try {
    await client.connect();
    connected = true;
    console.log('✅ Connected to Redis');
  } catch (e) {
    console.warn('⚠️  Redis connection failed:', e.message);
  }
}

// Helpers
async function get(key) {
  await connect();
  if (!connected) return null;
  try {
    return await client.get(key);
  } catch (e) {
    console.warn('Redis GET error', e);
    return null;
  }
}

async function set(key, value, ttlSeconds = null) {
  await connect();
  if (!connected) return;
  try {
    if (ttlSeconds) {
      await client.set(key, value, { EX: ttlSeconds });
    } else {
      await client.set(key, value);
    }
  } catch (e) {
    console.warn('Redis SET error', e);
  }
}

async function getJSON(key) {
  const v = await get(key);
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch (e) {
    return null;
  }
}

async function setJSON(key, obj, ttlSeconds = null) {
  try {
    await set(key, JSON.stringify(obj), ttlSeconds);
  } catch (e) {
    console.warn('Redis setJSON error', e);
  }
}

export default {
  connect,
  get,
  set,
  getJSON,
  setJSON,
  client
};
