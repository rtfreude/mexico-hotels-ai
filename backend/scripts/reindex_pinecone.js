#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import sanityService from '../services/sanity.service.js';
import ragService from '../services/rag-ultra-optimized.service.js';

async function main() {
  try {
    console.log('Fetching hotels from Sanity...');
    const hotels = await sanityService.getAllHotels();
    console.log(`Fetched ${hotels.length} hotels`);

    console.log('Storing hotel data to Pinecone via RAG service...');
    const ok = await ragService.storeHotelData(hotels);
    console.log('Store result:', ok);

    // Attempt to fetch a few vectors by id to verify metadata
    try {
      const sampleIds = hotels.slice(0, 5).map(h => h.id).filter(Boolean);
      if (ragService.index && sampleIds.length > 0) {
        console.log('Fetching sample vectors from Pinecone for ids:', sampleIds);
        // Some Pinecone clients expose fetch or similar API
        if (typeof ragService.index.fetch === 'function') {
          const fetched = await ragService.index.fetch({ ids: sampleIds });
          console.log('Fetched vectors:', JSON.stringify(fetched, null, 2));
        } else if (typeof ragService.index.query === 'function') {
          // Fallback: perform a metadata-filtered query for one id at a time
          for (const id of sampleIds) {
            try {
              const q = await ragService.index.query({ vector: Array(1536).fill(0), topK: 1, includeMetadata: true, filter: { id: { $eq: id } } });
              console.log(`Query result for ${id}:`, JSON.stringify(q, null, 2));
            } catch (e) {
              console.warn('Query fallback failed for id', id, e && e.message ? e.message : e);
            }
          }
        } else {
          console.warn('Pinecone index client does not support fetch/query in this context');
        }
      } else {
        console.warn('Pinecone index not initialized or no sample ids available to fetch');
      }
    } catch (e) {
      console.warn('Error while fetching sample vectors:', e && e.message ? e.message : e);
    }

    console.log('Reindex script complete');
  } catch (error) {
    console.error('Reindex failed:', error && error.message ? error.message : error);
    process.exitCode = 1;
  }
}

main();
