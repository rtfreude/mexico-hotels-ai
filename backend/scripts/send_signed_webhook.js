#!/usr/bin/env node
import crypto from 'crypto';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const url = process.argv[2] || process.env.SANITY_WEBHOOK_TEST_URL || 'http://localhost:5001/api/sanity/webhook';
const signingSecret = process.env.SANITY_WEBHOOK_SIGNING_SECRET || '';
const sharedSecret = process.env.SANITY_REINDEX_SECRET || '';

const payload = { ids: ['hotel-001','hotel-002'] };
const body = JSON.stringify(payload);

let headers = { 'Content-Type': 'application/json' };

if (signingSecret) {
  const h = crypto.createHmac('sha256', signingSecret);
  h.update(body);
  headers['sanity-signature'] = h.digest('hex');
} else if (sharedSecret) {
  headers['x-reindex-secret'] = sharedSecret;
}

(async () => {
  try {
    const res = await fetch(url, { method: 'POST', body, headers });
    const text = await res.text();
    console.log('status', res.status);
    console.log(text);
  } catch (e) {
    console.error('error', e.message || e);
  }
})();
