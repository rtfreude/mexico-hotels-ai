import { fetchGroq } from './sanityClient';
import { srcFor } from './sanityImage';

// Example GROQ used by the backend. This fetches published hotel docs only.
const HOTELS_GROQ = `*[_type == "hotel" && defined(publishedAt)] | order(publishedAt desc){_id, name, slug, city, state, location, description, amenities, priceRange, rating, type, images[]{..., asset->{_id, url}}, imageUrl, affiliateLink, nearbyAttractions}`;

// Lightweight normalizer to match the shape the frontend components expect
export async function fetchPublishedHotels() {
  const results = await fetchGroq(HOTELS_GROQ);
  if (!Array.isArray(results)) return [];

  return results.map(doc => ({
    id: doc._id || (doc.slug && doc.slug.current) || `sanity-${Math.random().toString(36).slice(2,9)}`,
    name: doc.name || 'Untitled',
    city: doc.city || '',
    state: doc.state || '',
    location: typeof doc.location === 'string' ? doc.location : (doc.location && doc.location.address) || '',
    description: doc.description || '',
    amenities: Array.isArray(doc.amenities) ? doc.amenities : [],
    priceRange: doc.priceRange || '',
    rating: doc.rating || 0,
    type: doc.type || '',
    images: Array.isArray(doc.images) ? doc.images.map(i => ({ ...i, url: (i && i.asset) ? (i.asset.url || srcFor(i.asset, 800)) : null })) : [],
    imageUrl: doc.imageUrl || (Array.isArray(doc.images) && doc.images[0] && doc.images[0].asset && doc.images[0].asset.url) || '',
    affiliateLink: doc.affiliateLink || '',
    nearbyAttractions: Array.isArray(doc.nearbyAttractions) ? doc.nearbyAttractions : []
  }));
}

export default fetchPublishedHotels;
