import { vi, test, expect } from 'vitest';
import fetchPublishedHotels from '../useSanityHotels';

// Mock fetchGroq used by the module
vi.mock('../sanityClient', () => ({
  fetchGroq: vi.fn(() => Promise.resolve([
    {
      _id: 'hotel-001',
      name: 'Test Hotel',
      city: 'Test City',
      state: 'TS',
      description: 'A lovely test hotel',
      amenities: ['Pool', 'WiFi'],
      priceRange: '$$$',
      rating: 4.5,
      type: 'Resort',
      images: [{ asset: { _id: 'image-1', url: 'https://example.com/img1.jpg' } }],
      imageUrl: 'https://example.com/cover.jpg',
      affiliateLink: '#',
      nearbyAttractions: ['Beach']
    }
  ]))
}));

test('fetchPublishedHotels normalizes results', async () => {
  const hotels = await fetchPublishedHotels();
  expect(Array.isArray(hotels)).toBe(true);
  expect(hotels.length).toBe(1);
  const h = hotels[0];
  expect(h.id).toBe('hotel-001');
  expect(h.name).toBe('Test Hotel');
  expect(h.images && h.images[0] && h.images[0].url).toBeDefined();
});

test('fetchPublishedHotels returns empty array when no docs', async () => {
  // Remock to return empty array for this test
  const client = await import('../sanityClient');
  client.fetchGroq = vi.fn(() => Promise.resolve([]));
  const hotels = await fetchPublishedHotels();
  expect(Array.isArray(hotels)).toBe(true);
  expect(hotels.length).toBe(0);
});
