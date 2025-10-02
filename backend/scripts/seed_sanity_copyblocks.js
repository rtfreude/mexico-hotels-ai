#!/usr/bin/env node
import dotenv from 'dotenv';
import { createClient } from '@sanity/client';

dotenv.config();

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error('SANITY_PROJECT_ID and SANITY_API_TOKEN must be set in your environment to run this script.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

const docs = [
  {
    _id: 'copyBlock-landing-hero',
    _type: 'copyBlock',
    key: 'landing:hero',
    title: "Mexico's Most Extraordinary Resorts",
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          { _type: 'span', text: 'From luxury escapes to family adventures, discover the perfect resort experience tailored to your unique travel dreams.' }
        ]
      }
    ],
    tags: ['landing', 'hero']
  },
  {
    _id: 'copyBlock-landing-destinations',
    _type: 'copyBlock',
    key: 'landing:destinations',
    title: "Mexico's Finest Locations",
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          { _type: 'span', text: 'Discover extraordinary destinations where luxury meets authentic Mexican culture.' }
        ]
      }
    ],
    tags: ['landing', 'destinations']
  }
  ,
  {
    _id: 'copyBlock-landing-nav',
    _type: 'copyBlock',
    key: 'landing:nav',
    title: 'Resorts of Mexico',
    body: [
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Destinations|Resort Types|Reviews|Find Your Resort' }] }
    ],
    tags: ['landing', 'nav']
  },
  {
    _id: 'copyBlock-landing-footer',
    _type: 'copyBlock',
    key: 'landing:footer',
    title: "Resorts of Mexico — Creating unforgettable resort experiences.",
    body: [
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: "Discovering extraordinary resort experiences across Mexico's most beautiful destinations." }] }
    ],
    tags: ['landing', 'footer']
  }
  ,
  // siteSettings singleton to control global footer and site title
  {
    _id: 'siteSettings-global',
    _type: 'siteSettings',
    siteTitle: 'Resorts of Mexico',
    siteDescription: [
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: "Discovering extraordinary resort experiences across Mexico's most beautiful destinations." }] }
    ],
    footerColumns: [
      { title: 'Destinations', links: [ { title: 'Riviera Maya', url: '/destinations/riviera-maya' }, { title: 'Los Cabos', url: '/destinations/los-cabos' } ] },
      { title: 'Resort Types', links: [ { title: 'Ultra-Luxury', url: '/types/ultra-luxury' }, { title: 'Adults-Only', url: '/types/adults-only' } ] },
      { title: 'Support', links: [ { title: 'Contact', url: '/contact' }, { title: 'Help', url: '/help' } ] }
    ],
    contact: { phone: '1-800-RESORTS', email: 'help@resortsofmexico.com', supportText: '24/7 Travel Support' },
    copyrightText: '© 2025 Resorts of Mexico. Creating unforgettable resort experiences.',
    bottomBody: [ { _type: 'block', style: 'normal', children: [{ _type: 'span', text: "© 2025 Resorts of Mexico. Creating unforgettable resort experiences." }] } ]
  }
];

async function run() {
  try {
    console.log(`Seeding ${docs.length} copyBlock documents to Sanity project ${projectId}/${dataset}...`);

    for (const doc of docs) {
      // createOrReplace is idempotent — it will insert or replace an existing doc with the same _id
      await client.createOrReplace(doc);
      console.log('Upserted (createOrReplace)', doc._id);

      // Also send a dataset-level mutate request to ensure the document is available
      try {
        const res = await client.request({
          method: 'POST',
          url: `/v2024-01-01/data/mutate/${dataset}`,
          body: { mutations: [{ createOrReplace: doc }] }
        });
        // res should contain results; log minimal confirmation
        console.log('Mutate response ok for', doc._id);
      } catch (mutErr) {
        console.warn('Sanity mutate publish attempt failed for', doc._id, mutErr && mutErr.message ? mutErr.message : mutErr);
      }
    }

    console.log('CopyBlock seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding copyBlocks:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();
