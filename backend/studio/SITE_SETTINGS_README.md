Site Settings (singleton)

This studio includes a singleton document type `siteSettings` used for global site copy such as:

- Site title (`siteTitle`)
- Site description (`siteDescription`) — rich text
- Footer columns (`footerColumns`) — structured title + links
- Contact (`contact`) — phone, email, support text
- Bottom copyright/body (`copyrightText`, `bottomBody`)

How it works

- The Desk contains a top-level "Site Settings" menu item which opens the single document with _id `siteSettings-global`.
- The schema disables creating and deleting the document from the Studio (`__experimental_actions: ['update','publish']`).

Editing guidance

- Open "Site Settings" in the Studio.
- Edit the primary fields and publish.
- Footer columns accept arrays of link objects — add titles and URL paths. Set `external` = true to open links in a new tab.

Footer rendering notes

- The frontend renders a brand/description column (site title + `siteDescription`) first, followed by each object in `footerColumns`. To edit the brand paragraph, update `siteDescription` (rich text) or `bottomBody` for the small bottom row.
- If you need a simple fallback paragraph instead, edit the `Copy Block` with key `landing:footer` (visible in the Copy Block list). Site Settings takes priority when present.

Notes

- If you need to change the singleton ID or seeded defaults, update `backend/scripts/seed_sanity_copyblocks.js`.
- Frontend falls back to existing `copyBlock` documents or hard-coded strings if `siteSettings` isn't present.
