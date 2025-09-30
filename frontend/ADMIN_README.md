Sanity Admin Page

To mount the admin UI, import the `SanityAdminPage` into your app's routing or a top-level page. Example (if you have a pages routing setup):

- Place `SanityAdminPage.jsx` under `src/pages` (done).
- Mount it at `/admin` by adding a route to your router or by creating an entry in your app that renders it.

Dev tips:
- The component prompts for the `x-reindex-secret` when listing jobs or triggering reindex. For local testing, copy the value from `backend/.env`.
- The admin page is intentionally minimal; secure the route with authentication before exposing it.

Running Redis locally with Docker (macOS):

```bash
# start a Redis container
docker run -d --name mh-redis -p 6379:6379 redis:7

# stop and remove when done
docker rm -f mh-redis
```

After Redis is running, restart the backend (from /backend):

```bash
npm --prefix backend run dev
```

Then open the admin page or use curl to list jobs:

```bash
curl -H "x-reindex-secret: <secret>" http://localhost:5001/api/sanity/jobs
```

Signed webhook helper (backend/scripts/send_signed_webhook.js) will POST a signed payload to your webhook endpoint; you can run it like:

```bash
node backend/scripts/send_signed_webhook.js http://localhost:5001/api/sanity/webhook
```

