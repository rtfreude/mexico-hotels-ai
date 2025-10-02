## Sanity Studio — local development & editor onboarding

This folder contains the Sanity Studio configuration for Mexico Hotels. The canonical schema files live in `backend/sanity-schema/` and are used by the Studio at runtime.

## Quick purpose

Make it easy for non-developers (editors) to add copy and images for hotels, regions, and reusable copy blocks.

## Files you should know

- `sanity.config.js` — studio configuration (projectId & dataset are read from env).
- `backend/sanity-schema/*.js` — canonical schemas (hotel, region, copyBlock).
- `.env.template` — this folder's environment variable template (safe to commit).

## Prerequisites

- Node.js (recommended v18+)
- A Sanity account and access to the project (projectId `xudqyvow`).

## Local setup (developer)

1. Create a local `.env` in this folder from the template:

```bash
cd backend/studio
cp .env.template .env
# Edit .env if you need to change values (do NOT add secrets into repo)
```

2. Install dependencies:

```bash
npm install
```

3. Run the Studio in development mode:

```bash
npm run dev
```

Studio typically opens at http://localhost:3333. Sign in with a Sanity account that has access to the `xudqyvow` project.

## Seeding initial content (optional)

If you want starter content (hotels, regions, copy blocks) you can run the project's seed script from the repo root:

```bash
cd backend
npm --prefix ./ run seed:sanity
# or
node ./scripts/seed_sanity.js
```

After seeding, open Studio and confirm the documents exist. Publish any drafted documents so the frontend can read them.

## Inviting editors (your wife)

1. Go to https://manage.sanity.io and sign in.
2. Select project `xudqyvow`.
3. Invite by email and assign the "Editor" role (or a custom role with write + publish permissions).

Editors will then sign in to the Studio UI and can create/modify content.

## Uploading images and editing content

- `hotel` schema includes an `images` array (image blocks with hotspot, `alt`, and `caption` fields). In Studio:
	- Open a Hotel document → Images → Add image → Upload / Select from media library → fill `alt` and `caption`.
- `copyBlock` documents are reusable copy pieces (unique `key`). Editors can modify them to change text site-wide.

## Publishing & frontend integration

- Documents must be *published* in Studio to be served from the public dataset (unless your frontend uses an API token and reads drafts).
- Add your front-end origin to Sanity CORS origins in the dashboard (Manage → API → CORS origins). For local dev add `http://localhost:5173`.
- Ensure the frontend has matching `SANITY_PROJECT_ID` and `SANITY_DATASET`.

## Changing schemas

- Edit schemas in `backend/sanity-schema/`. After changes, restart the Studio (`npm run dev`) for them to be picked up.
- For a production-ready Studio build, run `npm run build` in this folder.

## Security notes

- Never commit API tokens or other secrets to git. If a token was accidentally committed, rotate it in the Sanity dashboard.
- Use minimal scopes for programmatic tokens (read-only where possible).

## Troubleshooting

- Sanity CLI missing? `npm install` in this folder will install a local `sanity` binary used by the scripts.
- Schema errors on startup: check `backend/sanity-schema/*.js` for syntax issues and restart Studio.
- If images won't upload, check your Sanity project's media settings and network access.

## Next steps I can help with

- I can start the Studio dev server here and confirm it serves locally.
- I can add a short editor-facing step-by-step guide (screenshots or PDF).
- I can create a small `.env.example` in the repo root referencing Studio variables.

If you'd like one of those, tell me which and I'll make it.
