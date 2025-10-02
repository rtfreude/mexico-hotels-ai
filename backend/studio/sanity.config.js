import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import hotel from '../sanity-schema/hotel.js'
import region from '../sanity-schema/region.js'
import copyBlock from '../sanity-schema/copyBlock.js'
import siteSettings from '../sanity-schema/siteSettings.js'
import deskStructure from './deskStructure.js'

// Keep projectId/dataset in env; fallback will be overridden by your .env when running
export default defineConfig({
  name: 'default',
  title: 'Mexico Hotels Studio',
  projectId: process.env.SANITY_PROJECT_ID || 'xudqyvow',
  dataset: process.env.SANITY_DATASET || 'production',
  plugins: [deskTool({ structure: deskStructure }), visionTool()],
  schema: {
    // Register the project's schemas so Desk and document editors show up
    // Importing the project's schema index can pull in special `part:` imports
    // that sometimes fail to resolve during Vite analysis; register the
    // individual schema modules directly instead.
    types: [hotel, region, copyBlock, siteSettings]
  }
})
