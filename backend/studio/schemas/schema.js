// Minimal schema index for local dev. The studio's config now imports
// the project's schema modules directly to avoid Vite resolving special
// Sanity `part:` imports during dev. Keep this file present but inert
// so the Studio dev server doesn't attempt to transform `all:part:`.

const schema = {
  name: 'default',
  types: []
}

export default schema
