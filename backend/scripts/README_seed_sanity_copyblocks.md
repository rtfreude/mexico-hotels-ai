Seed Sanity copyBlocks

This small script upserts two `copyBlock` documents into your Sanity dataset so the frontend can render editable landing page copy.

Files

- `backend/scripts/seed_sanity_copyblocks.js` — idempotent script that calls `createOrReplace` and performs a dataset-level mutate for extra assurance.

Required environment variables (local)

- SANITY_PROJECT_ID — your Sanity project id
- SANITY_API_TOKEN — a token with write/create permissions
- SANITY_DATASET — (optional) dataset name, defaults to `production`

Install dependencies (backend studio uses @sanity/client already):

# from repo root
cd backend
npm install

Run the seed script (zsh):

export SANITY_PROJECT_ID=yourProjectId
export SANITY_API_TOKEN=yourWriteToken
export SANITY_DATASET=production
node backend/scripts/seed_sanity_copyblocks.js

Notes

- The script uses `createOrReplace` which is idempotent. You can safely run it multiple times.
- Do NOT commit your SANITY_API_TOKEN to source control.
- After the script runs you can open your Sanity Studio (if running locally at `backend/studio`) to verify and further edit the content.

Frontend changes

- The frontend now renders rich Portable Text for landing copy when present. Install the new dependency and rebuild the frontend:

cd frontend
npm install
npm run dev

If you want the script to explicitly call Sanity's publish APIs in a different workflow, I can extend it further — but `createOrReplace` will write the documents into the dataset and they should appear in Studio by default.
