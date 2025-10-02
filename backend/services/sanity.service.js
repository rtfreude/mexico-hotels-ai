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

// Create a client that can optionally read drafts (requires a token with read access to drafts)
function getClientForPreview() {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET || 'production';
  if (!projectId) throw new Error('SANITY_PROJECT_ID is not set');
  // Use a specific token for preview if provided, otherwise fall back to general token
  const token = process.env.SANITY_PREVIEW_TOKEN || process.env.SANITY_API_TOKEN || undefined;
  return createClient({ projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false });
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
  const query = `*[_type == "hotel" && defined(publishedAt)] | order(publishedAt desc){_id, _createdAt, name, slug, city, state, location, description, body, amenities, priceRange, rating, type, images[]{..., asset->{_id, url, metadata, extension, mimeType, originalFilename}}, imageUrl, affiliateLink, nearbyAttractions, seo, locationGeo, region->{_id, name, slug}}`;
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

// Get all hotels including drafts (preview). Requires SANITY_PREVIEW_TOKEN or SANITY_API_TOKEN
async function getAllHotelsPreview() {
  const client = getClientForPreview();
  const query = `*[_type == "hotel"] | order(coalesce(publishedAt, _createdAt) desc){_id, _createdAt, name, slug, city, state, location, description, body, amenities, priceRange, rating, type, images[]{..., asset->{_id, url, metadata, extension, mimeType, originalFilename}}, imageUrl, affiliateLink, nearbyAttractions, seo, locationGeo, region->{_id, name, slug}}`;
  const results = await client.fetch(query);
  return results.map(normalizeDoc);
}

async function getHotelById(id) {
  const client = getClient();
  const query = `*[_type == "hotel" && (_id == $id || slug.current == $id) && defined(publishedAt)][0]{_id, name, slug, city, state, location, description, body, amenities, priceRange, rating, type, images[]{..., asset->{_id, url, metadata, extension, mimeType, originalFilename}}, imageUrl, affiliateLink, nearbyAttractions, seo, locationGeo, region->{_id, name, slug}}`;
  const doc = await client.fetch(query, { id });
  if (!doc) return null;
  return normalizeDoc(doc);
}

// Preview getter for single hotel (includes drafts)
async function getHotelByIdPreview(id) {
  const client = getClientForPreview();
  const query = `*[_type == "hotel" && (_id == $id || slug.current == $id)][0]{_id, name, slug, city, state, location, description, body, amenities, priceRange, rating, type, images[]{..., asset->{_id, url, metadata, extension, mimeType, originalFilename}}, imageUrl, affiliateLink, nearbyAttractions, seo, locationGeo, region->{_id, name, slug}}`;
  const doc = await client.fetch(query, { id });
  if (!doc) return null;
  return normalizeDoc(doc);
}

function normalizeDoc(doc) {
  return {
    id: doc._id || (doc.slug && doc.slug.current) || `sanity-${Math.random().toString(36).slice(2,9)}`,
    name: doc.name,
    city: doc.city || '',
    state: doc.state || '',
    location: typeof doc.location === 'string' ? doc.location : (doc.location && doc.location.address) || '',
    description: doc.description || '',
    body: doc.body || [],
    amenities: Array.isArray(doc.amenities) ? doc.amenities : [],
    priceRange: doc.priceRange || '',
    rating: doc.rating || 0,
    type: doc.type || '',
  images: Array.isArray(doc.images) ? doc.images.map(i => ({ ...i, url: getImageUrl(i), asset: (i.asset && i.asset._id) ? i.asset : i.asset })) : [],
    imageUrl: (function() {
      if (doc.imageUrl && typeof doc.imageUrl === 'string' && doc.imageUrl.length > 0) return doc.imageUrl;
      // if images array exists, return first image URL
      if (Array.isArray(doc.images) && doc.images.length > 0) {
        const url = getImageUrl(doc.images[0]);
        if (url) return url;
      }
      return '';
    })(),
    affiliateLink: doc.affiliateLink || '',
    nearbyAttractions: Array.isArray(doc.nearbyAttractions) ? doc.nearbyAttractions : [],
    seo: doc.seo || {},
    locationGeo: doc.locationGeo || null,
    // If region was projected, include a friendly object { id, name, slug }
    region: (function() {
      if (!doc.region) return null;
      // doc.region may already be an expanded object if queried as region->{...}
      if (doc.region.name || (doc.region._id && typeof doc.region._id === 'string')) {
        return {
          id: doc.region._id || (doc.region._ref ? doc.region._ref : null),
          name: doc.region.name || null,
          slug: (doc.region.slug && doc.region.slug.current) || (doc.region._id ? doc.region._id.replace(/^region-/, '') : null)
        };
      }
      // fallback for plain reference
      if (doc.region._ref) return { id: doc.region._ref };
      return null;
    })()
  };
}

// Export
export default {
  getAllHotels,
  getAllHotelsPreview,
  getHotelById,
  getHotelByIdPreview,
};
