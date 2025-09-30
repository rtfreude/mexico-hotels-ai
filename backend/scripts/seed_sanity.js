#!/usr/bin/env node
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@sanity/client';

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
    // Resolve the sample-hotels path relative to this script file
    const dataPath = path.join(path.dirname(import.meta.url.replace('file://', '')), '..', 'data', 'sample-hotels.js');
    // Convert file:// URL path to platform path
    const resolvedPath = dataPath;
    // Also try the previous path style for robustness
    const fallbackPath = path.join(process.cwd(), 'backend', 'data', 'sample-hotels.js');
    const finalPath = fs.existsSync(resolvedPath) ? resolvedPath : fallbackPath;
    if (!fs.existsSync(finalPath)) {
      console.error('sample-hotels.js not found at', finalPath);
      process.exit(1);
    }

    // Import the sample hotels module dynamically
    const { default: sampleHotels } = await import(`file://${finalPath}`);

    console.log(`Seeding ${sampleHotels.length} hotels to Sanity project ${projectId}/${dataset}...`);

    for (const hotel of sampleHotels) {
      const docId = hotel.id || `hotel-${Math.random().toString(36).slice(2,9)}`;
      const doc = {
        _id: docId,
        _type: 'hotel',
        name: hotel.name,
        city: hotel.city,
        state: hotel.state,
        location: hotel.location || '',
        description: hotel.description,
        amenities: hotel.amenities || [],
        priceRange: hotel.priceRange || '',
        rating: hotel.rating || 0,
        type: hotel.type || '',
        imageUrl: hotel.imageUrl || '',
        affiliateLink: hotel.affiliateLink || '',
        nearbyAttractions: hotel.nearbyAttractions || []
      };

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
