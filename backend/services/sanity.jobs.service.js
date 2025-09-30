import redisClient from '../utils/redisClient.js';

const JOBS_LIST_KEY = 'sanity:reindex:jobs:list:v1';
const JOB_HASH_PREFIX = 'sanity:reindex:job:';

// In-memory fallback structures
const inMemoryJobs = new Map();
const inMemoryOrder = [];

function makeJob(entry) {
  const now = Date.now();
  return {
    id: entry.id || `job-${now}-${Math.random().toString(36).slice(2,6)}`,
    timestamp: entry.timestamp || new Date().toISOString(),
    status: entry.status || 'unknown',
    durationMs: entry.durationMs ?? null,
    error: entry.error || null,
    startedAt: entry.startedAt || null,
    endedAt: entry.endedAt || null,
    // copy other metadata
    ...entry
  };
}

async function persistJobHash(job) {
  try {
    await redisClient.connect();
    if (!redisClient.client?.isOpen) throw new Error('redis not open');
    const key = JOB_HASH_PREFIX + job.id;
    // Flatten job values to strings suitable for HSET
    const flat = {};
    Object.entries(job).forEach(([k, v]) => {
      try { flat[k] = typeof v === 'string' ? v : JSON.stringify(v); } catch (e) { flat[k] = String(v); }
    });
    await redisClient.client.hSet(key, flat);
    // push ID to list (index), keep latest at head
    await redisClient.client.lPush(JOBS_LIST_KEY, job.id);
    await redisClient.client.lTrim(JOBS_LIST_KEY, 0, 99);
    return true;
  } catch (e) {
    // fall back to in-memory
    return false;
  }
}

async function updateJobHash(jobId, partial) {
  try {
    await redisClient.connect();
    if (!redisClient.client?.isOpen) throw new Error('redis not open');
    const key = JOB_HASH_PREFIX + jobId;
    const flat = {};
    Object.entries(partial).forEach(([k, v]) => {
      try { flat[k] = typeof v === 'string' ? v : JSON.stringify(v); } catch (e) { flat[k] = String(v); }
    });
    await redisClient.client.hSet(key, flat);
    return true;
  } catch (e) {
    return false;
  }
}

async function getJobHash(jobId) {
  try {
    await redisClient.connect();
    if (!redisClient.client?.isOpen) throw new Error('redis not open');
    const key = JOB_HASH_PREFIX + jobId;
    const obj = await redisClient.client.hGetAll(key);
    if (!obj || Object.keys(obj).length === 0) return null;
    const parsed = {};
    for (const [k, v] of Object.entries(obj)) {
      try { parsed[k] = JSON.parse(v); } catch (e) { parsed[k] = v; }
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

// Create or upsert a job record (persisted as hash + list index). Returns job object.
async function addJob(entry) {
  const job = makeJob(entry);
  const ok = await persistJobHash(job);
  if (!ok) {
    // in-memory fallback
    inMemoryJobs.set(job.id, job);
    inMemoryOrder.unshift(job.id);
    if (inMemoryOrder.length > 100) inMemoryOrder.length = 100;
  }
  return job;
}

// Record job run by creating initial running job and updating it on completion.
async function recordJobRun(meta, fn) {
  const startedAt = Date.now();
  const job = makeJob({ ...meta, status: 'running', startedAt: new Date(startedAt).toISOString() });

  // persist initial running job
  const persisted = await persistJobHash(job);
  if (!persisted) {
    inMemoryJobs.set(job.id, job);
    inMemoryOrder.unshift(job.id);
  }

  try {
    const result = await fn();
    const endedAt = Date.now();
    const updates = {
      status: 'ok',
      durationMs: endedAt - startedAt,
      endedAt: new Date(endedAt).toISOString(),
      error: null
    };
    await updateJobHash(job.id, updates);
    // update in-memory too
    if (inMemoryJobs.has(job.id)) {
      const j = inMemoryJobs.get(job.id);
      Object.assign(j, updates);
      inMemoryJobs.set(job.id, j);
    }
    return { job: { ...job, ...updates }, result };
  } catch (e) {
    const endedAt = Date.now();
    const updates = {
      status: 'error',
      durationMs: endedAt - startedAt,
      endedAt: new Date(endedAt).toISOString(),
      error: e?.message || String(e)
    };
    await updateJobHash(job.id, updates);
    if (inMemoryJobs.has(job.id)) {
      const j = inMemoryJobs.get(job.id);
      Object.assign(j, updates);
      inMemoryJobs.set(job.id, j);
    }
    throw e;
  }
}

// List jobs: fetch recent job IDs and assemble hashes, fallback to in-memory
async function listJobs(limit = 50) {
  try {
    await redisClient.connect();
    if (redisClient.client?.isOpen) {
      const ids = await redisClient.client.lRange(JOBS_LIST_KEY, 0, limit - 1);
      const jobs = [];
      for (const id of ids) {
        const j = await getJobHash(id);
        if (j) jobs.push(j);
      }
      return jobs;
    }
  } catch (e) {
    console.warn('Redis unavailable for listJobs, using in-memory fallback');
  }

  // in-memory fallback: return objects in order
  const arr = [];
  for (const id of inMemoryOrder.slice(0, limit)) {
    const j = inMemoryJobs.get(id);
    if (j) arr.push(j);
  }
  return arr;
}

export default { addJob, listJobs, recordJobRun };
