import { createClient } from 'redis';

(async () => {
  try {
    const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    client.on('error', (e) => console.error('Redis error', e));
    await client.connect();

    const pattern = 'rag:search:v1:*';
    const keys = await client.keys(pattern);
    console.log('Found keys:', keys.length);
    if (keys.length === 0) {
      console.log('No keys matching', pattern);
    } else {
      for (const k of keys) {
        const v = await client.get(k);
        console.log('---', k);
        if (!v) {
          console.log('  VALUE: <null>');
          continue;
        }
        try {
          const parsed = JSON.parse(v);
          console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log('  VALUE (raw):', v);
        }
      }
    }

    await client.disconnect();
  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
