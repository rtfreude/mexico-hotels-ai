import imageUrlBuilder from '@sanity/image-url';
import { createClient } from '@sanity/client';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';

// Only create the Sanity client and image builder when a projectId is configured.
// When running locally without env vars (e.g. demo or tests), avoid throwing so the app can still render.
let client = null;
let builder = null;
if (projectId) {
  client = createClient({ projectId, dataset, apiVersion: '2024-01-01', useCdn: true });
  builder = imageUrlBuilder(client);
} else {
  // Friendly runtime warning in development to help the developer set up env vars
  try {
    // eslint-disable-next-line no-console
    console.warn('[sanityImage] VITE_SANITY_PROJECT_ID is not set. Sanity image builder disabled.');
  } catch {
    // ignore
  }
}

function normalizeSource(src) {
  if (!src) return null;

  // If it's a plain URL string
  if (typeof src === 'string') {
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return { isUrl: true, url: src };
    }
    // assume it's an asset id like 'image-...'
    return src;
  }

  // If it's an object with an asset property (Sanity image)
  if (src.asset) {
    const asset = src.asset;
    // Prefer an asset reference/id so the builder can generate resized URLs
    if (asset._ref) return asset._ref;
    if (asset._id) return asset._id;
    // Fallback to direct url when no id/ref available
    if (asset.url) return { isUrl: true, url: asset.url, fromAssetUrl: true };
  }

  // If it's already an asset-like object
  if (src._ref) return src._ref;
  if (src._id) return src._id;

  // As a last resort, return null
  return null;
}

export function urlFor(source) {
  const norm = normalizeSource(source);
  if (!norm) return null;
  if (norm.isUrl) return { url: () => norm.url, fromAssetUrl: norm.fromAssetUrl };
  // If the builder isn't available because projectId isn't configured, gracefully return null.
  if (!builder) return null;
  try {
    return builder.image(norm);
  } catch {
    // fallback
    return null;
  }
}

export function srcSetFor(source, widths = [320, 480, 768, 1024, 1600]) {
  const img = urlFor(source);
  if (!img) return null;
  // if urlFor returned a plain url wrapper
  if (typeof img.url === 'function' && img.width === undefined) {
    // If this came from a direct asset.url, construct query-based srcset
    if (img.fromAssetUrl) {
      const base = img.url();
      // strip existing query string to avoid duplication
      const [clean] = base.split('?');
      return widths.map(w => `${clean}?w=${w}&auto=format ${w}w`).join(', ');
    }
    return null;
  }
  return widths.map(w => `${img.width(w).auto('format').url()} ${w}w`).join(', ');
}

export function srcFor(source, width = 800) {
  const img = urlFor(source);
  if (!img) return null;
  if (typeof img.url === 'function' && img.width === undefined) {
    if (img.fromAssetUrl) {
      const base = img.url();
      const [clean] = base.split('?');
      return `${clean}?w=${width}&auto=format`;
    }
    return img.url();
  }
  return img.width(width).auto('format').url();
}

// Small inline SVG used as the LQIP (blurred low-quality image placeholder).
// We'll base64-encode it at runtime when possible to produce a compact data URI.
const lqipSvg = `
<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
  <defs>
    <linearGradient id='g' x1='0' x2='1'>
      <stop offset='0' stop-color='#f3f4f6'/>
      <stop offset='1' stop-color='#e6e7e8'/>
    </linearGradient>
    <filter id='b' x='-20%' y='-20%' width='140%' height='140%'>
      <feGaussianBlur stdDeviation='20' />
    </filter>
  </defs>
  <rect width='100%' height='100%' fill='url(#g)' />
  <g filter='url(#b)'>
    <rect x='80' y='120' width='1040' height='560' rx='20' fill='#d1d5db' />
  </g>
</svg>
`;

const encodeLqipBase64 = () => {
  // In the browser use btoa if available
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    try {
      return 'data:image/svg+xml;base64,' + window.btoa(lqipSvg);
    } catch {
      // fall through to other methods
    }
  }

  // In Node environments use Buffer
  try {
    if (typeof globalThis !== 'undefined' && typeof globalThis.Buffer !== 'undefined') {
      return 'data:image/svg+xml;base64,' + globalThis.Buffer.from(lqipSvg).toString('base64');
    }
  } catch {
    // fall through
  }

  // Final fallback to URI-encoded SVG (text-based)
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(lqipSvg);
};

export const PLACEHOLDER_IMAGE = encodeLqipBase64();
