import { CogIcon } from '@sanity/icons'

// Export a function that receives the structure builder `S` from Sanity.
// Calling createStructureBuilder() at module load time causes a runtime
// error because Sanity provides the runtime context when invoking the
// structure factory. The desk tool will call this function with `S`.
export default (S) => {
  // Helper to open the singleton document
  const siteSettingsEditor = S.document().id('siteSettings-global').schemaType('siteSettings')

  return S.list()
    .title('Content')
    .items([
      // Top-level singleton for site settings
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(siteSettingsEditor),

      // Fallback to default document list (all other types)
      S.divider(),
      ...S.documentTypeListItems().filter(listItem => listItem.getId() !== 'siteSettings')
    ])
}
