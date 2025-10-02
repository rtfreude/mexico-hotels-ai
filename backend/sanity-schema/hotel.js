import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'hotel',
  title: 'Hotel',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 200 }
    }),
    defineField({ name: 'city', title: 'City', type: 'string' }),
    defineField({ name: 'state', title: 'State', type: 'string' }),
    // Legacy simple location string for quick edits / backward compatibility
    defineField({ name: 'location', title: 'Location / Address', type: 'string' }),
    // Optional structured address object (non-breaking addition)
    defineField({
      name: 'address',
      title: 'Address (structured)',
      type: 'object',
      fields: [
        defineField({ name: 'street', title: 'Street', type: 'string' }),
        defineField({ name: 'city', title: 'City', type: 'string' }),
        defineField({ name: 'state', title: 'State', type: 'string' }),
        defineField({ name: 'postalCode', title: 'Postal Code', type: 'string' }),
        defineField({ name: 'country', title: 'Country', type: 'string' })
      ]
    }),
    // Portable Text body for rich descriptions (editable in Studio)
    defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] }),
    // Keep legacy short description for compatibility
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'amenities', title: 'Amenities', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'priceRange', title: 'Price Range', type: 'string' }),
    defineField({ name: 'rating', title: 'Rating', type: 'number' }),
    defineField({ name: 'type', title: 'Type', type: 'string' }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    // Support multiple images with alt text and hotspot
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
            defineField({ name: 'caption', type: 'string', title: 'Caption' })
          ]
        }
      ]
    }),
    defineField({ name: 'imageUrl', title: 'Image URL', type: 'url' }),
    defineField({ name: 'affiliateLink', title: 'Affiliate Link', type: 'url' }),
    defineField({ name: 'nearbyAttractions', title: 'Nearby Attractions', type: 'array', of: [{ type: 'string' }] }),
    // Optional geo point for map integration
    defineField({ name: 'locationGeo', title: 'Geolocation', type: 'geopoint' }),
    // Reference to a `region` document for grouping/filtering
    defineField({ name: 'region', title: 'Region', type: 'reference', to: [{ type: 'region' }] }),
    // SEO metadata
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'string' })
      ]
    }),
    // Published date for sorting / filtering
    defineField({ name: 'publishedAt', title: 'Published at', type: 'datetime' })
  ]
})
