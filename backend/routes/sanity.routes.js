import express from 'express';
import sanityService from '../services/sanity.service.js';
import ragService from '../services/rag-ultra-optimized.service.js';
import statusTracker from '../services/sanity.index.status.js';
import jobsService from '../services/sanity.jobs.service.js';
import crypto from 'crypto';

const router = express.Router();

// Simple secret-based protection for reindex endpoint (set SANITY_REINDEX_SECRET in env)
function verifySecret(req) {
  const secret = process.env.SANITY_REINDEX_SECRET;
  if (!secret) return true; // no shared secret configured
  const header = req.get('x-reindex-secret') || req.body.secret || req.query.secret;
  return header === secret;
}

function verifyHmac(req) {
  const signingSecret = process.env.SANITY_WEBHOOK_SIGNING_SECRET;
  if (!signingSecret) return true; // no signing secret configured
  const signature = req.get('sanity-signature') || req.get('x-sanity-signature');
  if (!signature || !req.rawBody) return false;

  // Sanity signs payload as hex HMAC sha256 of the raw body
  const h = crypto.createHmac('sha256', signingSecret);
  h.update(req.rawBody);
  const expected = h.digest('hex');
  // signature may come prefixed, accept contains
  return signature.includes(expected) || signature === expected;
}

// Manual reindex - fetch all hotels from Sanity and store in vector DB
router.post('/reindex', async (req, res) => {
  try {
    if (!verifySecret(req)) return res.status(403).json({ error: 'Unauthorized (secret)' });

    const hotels = await sanityService.getAllHotels();
    if (!hotels || hotels.length === 0) {
      return res.status(200).json({ message: 'No hotels found to index' });
    }

    // perform and record the job
    await jobsService.recordJobRun({ type: 'manual', count: hotels.length, triggeredBy: req.ip || 'unknown' }, async () => {
      await ragService.storeHotelData(hotels);
      // update status after successful store
      await statusTracker.setStatus(hotels.length).catch(() => {});
      return { reindexed: hotels.length };
    });
    res.json({ message: `Reindexed ${hotels.length} hotels` });
  } catch (error) {
    console.error('Sanity reindex failed:', error);
    res.status(500).json({ error: 'Reindex failed', details: error.message });
  }
});

// Webhook receiver (Sanity can POST here). Expects payload with IDs or full document patches.
router.post('/webhook', async (req, res) => {
  try {
    // If you configured a secret in Sanity webhook, verify it here
    // Prefer verifying HMAC signature if configured
    if (process.env.SANITY_WEBHOOK_SIGNING_SECRET) {
      // HMAC-based verification is enabled — require it.
      if (!verifyHmac(req)) {
        console.warn('Webhook rejected: HMAC verification failed');
        return res.status(403).json({ error: 'Unauthorized (hmac)' });
      }
      console.log('Webhook verified via HMAC');
    } else if (process.env.NODE_ENV === 'production') {
      // In production ensure operator has set HMAC signing secret for safety
      console.warn('No SANITY_WEBHOOK_SIGNING_SECRET set in production — rejecting webhook');
      return res.status(503).json({ error: 'Webhook signing not configured' });
    } else {
      // Development fallback to shared secret
      if (!verifySecret(req)) {
        console.warn('Webhook rejected: shared secret mismatch');
        return res.status(403).json({ error: 'Unauthorized (secret)' });
      }
      console.log('Webhook verified via shared secret (dev fallback)');
    }

    // Sanity webhook payload varies depending on configuration. Try to handle common cases.
    const body = req.body || {};

    // If webhook sends `ids` or `documents`, fetch them and reindex
    let ids = [];
    if (Array.isArray(body.ids) && body.ids.length > 0) ids = body.ids;
    if (Array.isArray(body.documents) && body.documents.length > 0) ids = ids.concat(body.documents.map(d => d._id || d.id).filter(Boolean));

    if (ids.length === 0) {
      // Fallback: just reindex all hotels (cheap for small datasets)
      console.log('Sanity webhook received without ids; reindexing all hotels');
      const hotels = await sanityService.getAllHotels();
      await jobsService.recordJobRun({ type: 'webhook-full', count: hotels.length, webhook: true }, async () => {
        await ragService.storeHotelData(hotels);
        await statusTracker.setStatus(hotels.length).catch(() => {});
        return { reindexed: hotels.length };
      });
      return res.json({ message: `Reindexed ${hotels.length} hotels (full)` });
    }

    // Fetch individual docs and upsert to vector DB
    const fetched = [];
    for (const id of ids) {
      const doc = await sanityService.getHotelById(id);
      if (doc) fetched.push(doc);
    }

    if (fetched.length > 0) {
      await jobsService.recordJobRun({ type: 'webhook-partial', count: fetched.length, ids }, async () => {
        await ragService.storeHotelData(fetched);
        await statusTracker.setStatus(fetched.length).catch(() => {});
        return { reindexed: fetched.length };
      });
      return res.json({ message: `Reindexed ${fetched.length} hotels` });
    }

    res.json({ message: 'No matching hotel documents found' });
  } catch (error) {
    console.error('Sanity webhook handler error:', error);
    res.status(500).json({ error: 'Webhook processing failed', details: error.message });
  }
});

// Status endpoint
router.get('/status', (req, res) => {
  statusTracker.getStatus().then(status => res.json(status)).catch(err => res.status(500).json({ error: err.message }));
});

// Preview endpoints - these return drafts and unpublished content.
// Requires SANITY_PREVIEW_TOKEN or SANITY_API_TOKEN to be set on the server.
router.get('/preview/hotels', async (req, res) => {
  try {
    const preview = await sanityService.getAllHotelsPreview();
    res.json(preview);
  } catch (err) {
    console.error('Preview hotels error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/preview/hotel/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await sanityService.getHotelByIdPreview(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error('Preview hotel error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Jobs list (admin) - protected with same secret
router.get('/jobs', async (req, res) => {
  if (!verifySecret(req)) return res.status(403).json({ error: 'Unauthorized' });
  const list = await jobsService.listJobs(50);
  res.json(list);
});

export default router;
