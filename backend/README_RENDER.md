Render deployment instructions

1) Connect your GitHub repo to Render (https://render.com).

2) Create a new Web Service with the following settings:
   - Name: mexico-hotels-backend
   - Environment: Node
   - Branch: main (or your deployment branch)
   - Root Directory: backend
   - Build Command: npm --prefix backend install
   - Start Command: npm --prefix backend start
   - Auto-Deploy: enabled (optional)

3) Add environment variables (in Render Dashboard -> Environment):
   - SANITY_PROJECT_ID = xudqyvow
   - SANITY_DATASET = production
   - SANITY_API_TOKEN = <your-server-token> (secret)
   - FRONTEND_URL = https://<your-frontend-domain>
   - REDIS_URL = <redis-connection-url> (if using external Redis)
   - OPENAI_API_KEY = <your-openai-key> (if used)
   - PINECONE_API_KEY = <your-pinecone-key> (if used)
   - SANITY_REINDEX_SECRET = <secret> (if used by scripts)

4) (Optional) Add a managed Redis instance using Render's Marketplace (or provide an external Redis URL in REDIS_URL).

5) After environment variables are set, deploy. The server listens on $PORT automatically.

6) Verify the /health endpoint:
   curl https://<your-backend-domain>/health

7) Update Vercel front-end project environment variables:
   - VITE_API_BASE_URL = https://<your-backend-domain>

8) Create a Sanity webhook that points to Vercel's deploy hook so published content triggers front-end rebuilds.

If you want, I can create the Render service manifest and help set the env vars interactively.
