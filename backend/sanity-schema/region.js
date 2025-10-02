import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'region',
  title: 'Region',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 100 }
    }),
    defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'center', title: 'Center (geopoint)', type: 'geopoint' }),
    // Optional bounding box or geojson (store as text for now)
    defineField({ name: 'boundsGeoJson', title: 'Bounds (GeoJSON)', type: 'text' })
  ]
})
