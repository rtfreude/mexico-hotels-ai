#!/usr/bin/env node
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { createClient } from '@sanity/client';
import axios from 'axios';
import { basename } from 'path';

dotenv.config();

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error('SANITY_PROJECT_ID and SANITY_API_TOKEN must be set in your environment to run the seed script.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false
});

async function run() {
  try {
    // Resolve the sample-hotels path relative to this script file and use a file URL for dynamic import
  const candidate1 = path.join(path.dirname(pathToFileURL(import.meta.url).pathname), '..', 'data', 'sample-hotels.js');
  const candidate2 = path.join(process.cwd(), 'backend', 'data', 'sample-hotels.js');
  const candidate3 = path.join(process.cwd(), 'data', 'sample-hotels.js');
  const finalPath = fs.existsSync(candidate1) ? candidate1 : (fs.existsSync(candidate2) ? candidate2 : candidate3);
    if (!fs.existsSync(finalPath)) {
      console.error('sample-hotels.js not found at', finalPath);
      process.exit(1);
    }

    // Import the sample hotels module dynamically using a file:// URL
    const { default: sampleHotels } = await import(pathToFileURL(finalPath).href);

  const seedLimit = parseInt(process.env.SEED_LIMIT || '0', 10) || 0;
  const toSeed = seedLimit > 0 ? sampleHotels.slice(0, seedLimit) : sampleHotels;
  console.log(`Seeding ${toSeed.length} hotels to Sanity project ${projectId}/${dataset}...`);

  for (const hotel of toSeed) {
      // prefer a stable id based on slug if available
      const safeSlug = (hotel.slug || hotel.name || `hotel-${Math.random().toString(36).slice(2,9)}`)
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 200);

      const docId = hotel.id || `hotel-${safeSlug}`;

      const doc = {
        _id: docId,
        _type: 'hotel',
        name: hotel.name,
        slug: { _type: 'slug', current: safeSlug },
        city: hotel.city,
        state: hotel.state,
        location: hotel.location || '',
        // convert simple description into portable text blocks if body not present
        body: hotel.body || (hotel.description ? [{ _type: 'block', children: [{ _type: 'span', text: hotel.description }] }] : []),
        description: hotel.description,
        amenities: hotel.amenities || [],
        priceRange: hotel.priceRange || '',
        rating: hotel.rating || 0,
        type: hotel.type || '',
        imageUrl: hotel.imageUrl || '',
        affiliateLink: hotel.affiliateLink || '',
        nearbyAttractions: hotel.nearbyAttractions || [],
        publishedAt: hotel.publishedAt || new Date().toISOString()
      };

      // If the sample data includes a plain region name, ensure a `region` document exists
      // and reference it from the hotel doc. This makes the seed idempotent and links hotels
      // to the `region` model if present.
      if (hotel.region && typeof hotel.region === 'string' && hotel.region.length > 0) {
        try {
          const regionSlug = hotel.region.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 100);
          const regionId = `region-${regionSlug}`;
          const regionDoc = {
            _id: regionId,
            _type: 'region',
            name: hotel.region,
            slug: { _type: 'slug', current: regionSlug }
          };
          // createOrReplace ensures idempotency
          await client.createOrReplace(regionDoc);
          doc.region = { _type: 'reference', _ref: regionId };
        } catch (regErr) {
          console.warn('Failed to create or link region for', docId, regErr && regErr.message ? regErr.message : regErr);
        }
      }

      // If the doc already exists and has images, preserve them. Otherwise, try to upload imageUrl into Sanity assets.
      try {
        const existing = await client.getDocument(docId).catch(() => null);
        if (existing && Array.isArray(existing.images) && existing.images.length > 0) {
          doc.images = existing.images;
        } else if (hotel.imageUrl && typeof hotel.imageUrl === 'string' && hotel.imageUrl.length > 0) {
          try {
            console.log(`Uploading image for ${docId} from ${hotel.imageUrl} ...`);
            const resp = await axios.get(hotel.imageUrl, { responseType: 'stream', timeout: 20000 });
            const filename = basename(new URL(hotel.imageUrl).pathname) || `${docId}.jpg`;
            const asset = await client.assets.upload('image', resp.data, { filename });
            // Attach the uploaded asset as the first image
            doc.images = [{ _type: 'image', asset: { _type: 'reference', _ref: asset._id }, caption: hotel.imageCaption || '', alt: hotel.imageAlt || '' }];
            // Also set imageUrl to the CDN url returned by Sanity for consistency
            if (asset.url) doc.imageUrl = asset.url;
            console.log(`Uploaded asset ${asset._id}`);
          } catch (imgErr) {
            console.warn(`Failed to upload image for ${docId}:`, imgErr.message || imgErr);
            // leave imageUrl as-is; editor can upload via Studio
          }
        }
      } catch (e) {
        console.warn('Error checking existing doc for images:', e && e.message ? e.message : e);
      }

      // Use createOrReplace to make the script idempotent
      await client.createOrReplace(doc);
      console.log('Upserted', docId);
    }

    console.log('Seeding complete.');
  } catch (error) {
    console.error('Error seeding Sanity:', error);
    process.exit(1);
  }
}

run();
