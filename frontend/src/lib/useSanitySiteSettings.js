import { fetchGroq } from './sanityClient';
import { blockArrayToPlainText } from './useSanityCopy';

// Fetch the singleton siteSettings document (assumes _id 'siteSettings-global')
export async function fetchSiteSettings() {
  const GROQ = `*[_type == "siteSettings" && _id == "siteSettings-global"][0]{_id, siteTitle, siteDescription, footerColumns, contact, copyrightText, bottomBody}`;
  const doc = await fetchGroq(GROQ);
  if (!doc) return null;

  return {
    id: doc._id,
    siteTitle: doc.siteTitle || '',
    siteDescription: doc.siteDescription || [],
    siteDescriptionPlain: blockArrayToPlainText(doc.siteDescription),
    footerColumns: Array.isArray(doc.footerColumns) ? doc.footerColumns : [],
    contact: doc.contact || {},
    copyrightText: doc.copyrightText || '',
    bottomBody: doc.bottomBody || [],
    bottomBodyPlain: blockArrayToPlainText(doc.bottomBody)
  };
}

export default fetchSiteSettings;
