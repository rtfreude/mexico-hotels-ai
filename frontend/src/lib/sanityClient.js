import { createClient } from '@sanity/client';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';

if (!projectId) {
  // Friendly runtime warning — avoid throwing so the app can still render in demos
  // eslint-disable-next-line no-console
  console.warn('[sanityClient] VITE_SANITY_PROJECT_ID is not set. Sanity client disabled.');
}

// Public read-only client (no token). Works for published documents. For previews/drafts
// you'll still need to use server-side endpoints that hold a read token.
export const sanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      // Use Sanity CDN only in production builds. In development we want
      // fresh data (no CDN caching) so edits made in Studio appear
      // immediately.
      useCdn: import.meta.env.DEV ? false : true,
    })
  : null;

// Small helper to run GROQ queries and return JSON, with a safe fallback if client isn't configured
export async function fetchGroq(query, params = {}) {
  if (!sanityClient) return null;
  try {
    return await sanityClient.fetch(query, params);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[sanityClient] GROQ fetch failed', err);
    return null;
  }
}

export default sanityClient;
