export default {
  name: 'hotel',
  title: 'Hotel',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'city', title: 'City', type: 'string' },
    { name: 'state', title: 'State', type: 'string' },
    { name: 'location', title: 'Location / Address', type: 'string' },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'amenities', title: 'Amenities', type: 'array', of: [{ type: 'string' }] },
    { name: 'priceRange', title: 'Price Range', type: 'string' },
    { name: 'rating', title: 'Rating', type: 'number' },
    { name: 'type', title: 'Type', type: 'string' },
    { name: 'image', title: 'Image', type: 'image' },
    { name: 'imageUrl', title: 'Image URL', type: 'url' },
    { name: 'affiliateLink', title: 'Affiliate Link', type: 'url' },
    { name: 'nearbyAttractions', title: 'Nearby Attractions', type: 'array', of: [{ type: 'string' }] }
  ]
}
