#!/usr/bin/env node
const crypto = require('crypto');
const { createClient } = require('redis');

(async () => {
  try {
    const q = 'Hotels in Cancun';
    const hash = crypto.createHash('sha256').update(q.toLowerCase().trim()).digest('hex');
    const key = `rag:search:v1:${hash}:top5`;
    const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    client.on('error', (e) => console.error('Redis error', e));

    await client.connect();
    const v = await client.get(key);
    console.log('REDIS_KEY:', key);
    if (!v) {
      console.log('VALUE: <null>');
    } else {
      try {
        console.log('VALUE (raw):', v);
        const parsed = JSON.parse(v);
        console.log('VALUE (parsed):', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('VALUE (non-json):', v);
      }
    }
    await client.disconnect();
  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
