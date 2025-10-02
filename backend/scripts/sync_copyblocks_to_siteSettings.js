#!/usr/bin/env node
import dotenv from 'dotenv';
import { createClient } from '@sanity/client';

dotenv.config();

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error('SANITY_PROJECT_ID and SANITY_API_TOKEN must be set in environment to run this script.');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false });

async function fetchCopyBlock(key) {
  const q = `*[_type == "copyBlock" && key == $key][0]{_id, key, title, body}`;
  return await client.fetch(q, { key });
}

function deriveSiteTitle(footerTitle, heroTitle) {
  if (footerTitle) {
    // split 'Resorts of Mexico — Creating...' -> 'Resorts of Mexico'
    return footerTitle.split('\u2014')[0].split('—')[0].trim();
  }
  if (heroTitle) return heroTitle.split('\n')[0].trim();
  return 'Resorts of Mexico';
}

async function run() {
  try {
    console.log('Fetching copyBlocks...');
    const [footerCb, heroCb, navCb, destCb] = await Promise.all([
      fetchCopyBlock('landing:footer'),
      fetchCopyBlock('landing:hero'),
      fetchCopyBlock('landing:nav'),
      fetchCopyBlock('landing:destinations')
    ]);

    if (!footerCb) {
      console.error('landing:footer copyBlock not found — aborting.');
      process.exit(1);
    }

    const siteTitle = deriveSiteTitle(footerCb.title, heroCb && heroCb.title);

    const siteSettings = {
      _id: 'siteSettings-global',
      _type: 'siteSettings',
      siteTitle,
      // Keep structured footerColumns if present; we won't overwrite them here unless not present
      siteDescription: footerCb.body || heroCb?.body || [],
      bottomBody: footerCb.body || heroCb?.body || [],
      // Copy other landing copy into named fields so Studio shows the same text (one-time sync)
      landingHeroBody: heroCb ? heroCb.body || [] : [],
      landingNavBody: navCb ? navCb.body || [] : [],
      landingDestinationsBody: destCb ? destCb.body || [] : [],
    };

    console.log('Upserting siteSettings-global with derived content...');
    const res = await client.createOrReplace(siteSettings);
    console.log('Upserted siteSettings-global:', res._id, res._rev);

    // Publish (if using datasets that require it)
    try {
      await client.request({ method: 'POST', url: `/v2024-01-01/data/mutate/${dataset}`, body: { mutations: [{ patch: { id: 'siteSettings-global', set: siteSettings } }] } });
      console.log('Published siteSettings-global via mutate API (best-effort).');
    } catch (pubErr) {
      console.warn('Publish attempt failed (non-fatal):', pubErr && pubErr.message ? pubErr.message : pubErr);
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing copyblocks to siteSettings:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();
