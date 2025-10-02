import { fetchGroq } from './sanityClient';

// Convert Sanity Portable Text block array to plain text (safe, minimal renderer)
export function blockArrayToPlainText(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .map(block => {
      if (block == null) return '';
      if (block._type === 'block' && Array.isArray(block.children)) {
        return block.children.map(child => child.text || '').join('');
      }
      // For non-block types (images, etc) ignore
      return '';
    })
    .filter(Boolean)
    .join('\n\n');
}

// Fetch a copyBlock by key (expects backend Sanity schema `copyBlock` with field `key`)
export async function fetchCopyBlock(key) {
  if (!key) return null;
  const GROQ = `*[_type == "copyBlock" && key == $key][0]{_id, key, title, body, tags}`;
  const doc = await fetchGroq(GROQ, { key });
  if (!doc) return null;
  return {
    id: doc._id,
    key: doc.key,
    title: doc.title || '',
    body: doc.body || [],
    bodyPlain: blockArrayToPlainText(doc.body),
    tags: Array.isArray(doc.tags) ? doc.tags : []
  };
}

export default fetchCopyBlock;
