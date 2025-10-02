Render environment variables for mexico-hotels-backend

Required (or strongly recommended):
- SANITY_PROJECT_ID = xudqyvow
- SANITY_DATASET = production
- SANITY_API_TOKEN = <your-server-token> (secret)
- FRONTEND_URL = https://<your-frontend-domain>

Optional (features will be disabled if missing):
- SANITY_PREVIEW_TOKEN = <token for preview endpoints>
- SANITY_REINDEX_SECRET = <secret for reindex endpoint>
- REDIS_URL = redis://:<password>@<host>:6379 (or leave blank to not use Redis)
- OPENAI_API_KEY = <openai-key> (only if AI features used)
- PINECONE_API_KEY = <pinecone-key> (for vector search)
- PINECONE_ENVIRONMENT = <pinecone env e.g. us-west1-gcp>
- PINECONE_INDEX_NAME = mexico-hotels

Notes:
- Store sensitive values in Render Dashboard's Environment section, not in repo.
- After adding environment variables, trigger a deploy so the backend initializes with the correct config.
