Operational & Security Recommendations — Sanity + Backend

This document collects practical, prioritized recommendations for running the Sanity integration and backend services in production (and improving the developer experience).

1) Webhook security
- Require HMAC signing in production: set SANITY_WEBHOOK_SIGNING_SECRET in production and reject requests that do not validate. Do not rely on the `x-reindex-secret` fallback in production.
- Validate raw body for HMAC: ensure the Express JSON/body parser captures the raw buffer (the project already uses `verify` to capture `req.rawBody`). Keep that.
- Rotate signing secrets periodically and update Sanity webhook configuration.
- Log verification failures (but do not leak secrets in logs).
- Rate limit incoming webhooks (per IP or per webhook signature) to guard against abuse.

2) Admin UI and access control
- Protect `/admin` UI with authentication (OAuth, SSO, or at minimum an API token + basic auth). The UI currently prompts for the `x-reindex-secret` — this is fine for local/dev testing only.
- Serve the admin UI behind a separate host or path restricted by a VPN or IP allowlist in production.
- Do not bake secrets into the frontend bundle.

3) Jobs and audit logging
- Use Redis hashes (current implementation) or a database for durable job objects and an index of recent job IDs. This makes jobs updatable (status/duration/error) and easy to query.
- Schema recommendations for job objects:
  - id: string (job-<ts>-<rand>)
  - type: enum [manual, webhook-full, webhook-partial]
  - status: enum [running, ok, error]
  - count: number (how many items reindexed)
  - ids: array (optional, list of doc ids)
  - triggeredBy: string (ip or user id)
  - startedAt, endedAt: ISO timestamps
  - durationMs: number
  - error: string | null
  - metadata: object (optional free-form)
- Keep job index capped (e.g., latest 100-1k) to avoid unbounded Redis memory growth.
- Optionally store job logs (stdout/stderr) as references to a log store (S3, LogDNA, Papertrail) rather than in Redis.

4) Redis
- Use a managed Redis in production, set AUTH and TLS, and provide a single REDIS_URL via env.
- Monitor Redis memory and eviction metrics; set reasonable maxmemory and eviction policies if you use self-hosted Redis.
- In dev, an in-memory fallback is convenient; in production, fail closed (return 5xx or queue) unless you explicitly want a fallback.

5) Pinecone / Vector DB
- Keep Pinecone API keys and index name in envs. On startup, verify the credentials and index health; fail early if critical features require Pinecone.
- The health endpoint should report Pinecone reachable/ok and index stats (if allowed by plan).
- If Pinecone is optional, clearly document the degraded behavior (search falls back to L2 or cached results).

6) Idempotency & retries
- Webhooks can be delivered multiple times. Make operations idempotent: upsert documents by stable id and deduplicate jobs by webhook event id when possible.
- If reindexing is long-running, consider making webhook handler enqueue a job (e.g., push job ID to queue) and return quickly (202 Accepted).

7) Observability
- Emit metrics and traces: job durations, reindex counts, webhook verifications, Redis/Pinecone latencies.
- Export logs with structured JSON and ship them to a log aggregator.
- Add a Prometheus-compatible metrics endpoint (or use your APM) and alert on failures/rate spikes.

8) Reliability & scaling
- If reindex/store operations are heavy, use a background worker or queue (BullMQ, RQ, or serverless functions) to process upserts so the web process can remain responsive.
- Add concurrency controls and backoff when calling external services (OpenAI/Pinecone) to avoid rate limits.

9) Deployment & process management
- Use a process manager (pm2, systemd) or container orchestration (Kubernetes) for production. Add a small `ecosystem.config.js` or `Procfile`/systemd unit for predictable start/restart and log rotation.
- Add an npm script for `start:prod` which uses `node server.js` (no watch) and sets NODE_ENV=production.

10) Secrets & config
- Keep all secrets out of git. Use a secrets manager or environment variables injected by the runtime (host, container platform or CI/CD secrets store).
- Validate required envs at startup and fail fast with clear error messages.

11) Tests & CI
- Add unit tests for `recordJobRun`, job persistence, HMAC verification, and the webhook handler. Add a small integration test that runs with a local Redis instance (e.g., via Docker in CI) to validate end-to-end behavior.

12) Small UX improvements to consider
- Replace the `window.prompt` in admin UI with a proper login modal and token storage in session/local storage (but minimize exposure to XSS).
- Add a single-job view that shows logs and any attached result artifacts.
- Add an optional webhook replay feature (replay last N events) guarded by admin auth.

Quick commands (dev)
- Start Redis locally (macOS):

```bash
docker run -d --name mh-redis -p 6379:6379 redis:7
# stop/remove
docker rm -f mh-redis
```

- Start backend from repo root (dev mode):

```bash
npm --prefix backend run dev
```

- Seed Sanity with sample data (if you need to re-seed):

```bash
npm --prefix backend run seed:sanity
```

- Send a signed/shared webhook (helper):

```bash
node backend/scripts/send_signed_webhook.js http://localhost:5001/api/sanity/webhook
```

Closing notes
- If you want, I can:
  - Add a persistent job store migration (move current list to hashes cleanly).
  - Add an endpoint to fetch a job by id for debugging.
  - Remove the in-memory fallback and fail fast if Redis is not reachable.
  - Wire the admin UI into a proper auth flow.

Pick any of the follow-ups and I will implement it next.
