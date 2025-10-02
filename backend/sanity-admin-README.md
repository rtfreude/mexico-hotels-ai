Sanity Admin UI

A minimal React component is provided at `frontend/src/components/SanityAdmin.jsx`.

How to use:
1. Import and mount it in a page (e.g., in `frontend/src/pages/Admin.jsx`):

```jsx
import SanityAdmin from '../components/SanityAdmin';

export default function AdminPage(){
  return <SanityAdmin apiUrl={import.meta.env.VITE_API_URL || '/api'} />
}
```

2. Build/run frontend and open the Admin page. The component uses `window.prompt` to get the admin secret for listing jobs and triggering reindex.

Local Sanity Studio

If you prefer to run the full Sanity Studio locally, a minimal Studio scaffold has been added at `backend/studio`. It imports the canonical schemas from `backend/sanity-schema/`.

To run the Studio locally:

```bash
cd backend/studio
npm install
npm run dev
```

Security:
- This component is intentionally minimal and not production-ready. Protect the route (authentication) before exposing it publicly. Use environment secrets in your hosting provider instead of prompting in the browser.
