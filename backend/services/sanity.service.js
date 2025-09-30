import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import dotenv from 'dotenv';

dotenv.config();

let client = null;
function getClient() {
  if (!client) {
    const projectId = process.env.SANITY_PROJECT_ID;
    const dataset = process.env.SANITY_DATASET || 'production';
    const useCdn = process.env.NODE_ENV === 'production';

    if (!projectId) {
      throw new Error('SANITY_PROJECT_ID is not set');
    }

    client = createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      token: process.env.SANITY_API_TOKEN || undefined,
      useCdn,
    });
  }
  return client;
}

function getImageUrl(source) {
  try {
    const client = getClient();
    const builder = imageUrlBuilder(client);
    return builder.image(source).url();
  } catch (e) {
    // If anything goes wrong, return null so caller can fallback
    return null;
  }
}

// Simple GROQ queries for hotel documents. Expect documents of type `hotel`.
async function getAllHotels() {
  const client = getClient();
  // Basic projection - adapt to your Sanity schema
  const query = `*[_type == "hotel"]{_id, _createdAt, name, slug, city, state, location, description, amenities, priceRange, rating, type, imageUrl, affiliateLink, nearbyAttractions}`;
  const results = await client.fetch(query);
  // Normalize to the shape expected by the rest of the app
  return results.map(doc => ({
    id: doc._id || (doc.slug && doc.slug.current) || `sanity-${Math.random().toString(36).slice(2,9)}`,
    name: doc.name,
    city: doc.city || (doc.location && doc.location.city) || '',
    state: doc.state || '',
    location: typeof doc.location === 'string' ? doc.location : (doc.location && doc.location.address) || '',
    description: doc.description || '',
    amenities: Array.isArray(doc.amenities) ? doc.amenities : [],
    priceRange: doc.priceRange || '',
    rating: doc.rating || 0,
    type: doc.type || '',
    // Resolve Sanity image asset if present; otherwise prefer a simple imageUrl field
    imageUrl: (function() {
      if (doc.imageUrl && typeof doc.imageUrl === 'string' && doc.imageUrl.length > 0) return doc.imageUrl;
      if (doc.image) {
        const url = getImageUrl(doc.image);
        if (url) return url;
      }
      return '';
    })(),
    affiliateLink: doc.affiliateLink || '',
    nearbyAttractions: Array.isArray(doc.nearbyAttractions) ? doc.nearbyAttractions : []
  }));
}

async function getHotelById(id) {
  const client = getClient();
  const query = `*[_type == "hotel" && (_id == $id || slug.current == $id)][0]{_id, name, slug, city, state, location, description, amenities, priceRange, rating, type, imageUrl, affiliateLink, nearbyAttractions}`;
  const doc = await client.fetch(query, { id });
  if (!doc) return null;
  return {
    id: doc._id,
    name: doc.name,
    city: doc.city || (doc.location && doc.location.city) || '',
    state: doc.state || '',
    location: typeof doc.location === 'string' ? doc.location : (doc.location && doc.location.address) || '',
    description: doc.description || '',
    amenities: Array.isArray(doc.amenities) ? doc.amenities : [],
    priceRange: doc.priceRange || '',
    rating: doc.rating || 0,
    type: doc.type || '',
    imageUrl: doc.imageUrl || '',
    affiliateLink: doc.affiliateLink || '',
    nearbyAttractions: Array.isArray(doc.nearbyAttractions) ? doc.nearbyAttractions : []
  };
}

// Export
export default {
  getAllHotels,
  getHotelById,
};
