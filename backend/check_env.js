import dotenv from 'dotenv';
dotenv.config();

const required = [
  'SANITY_PROJECT_ID',
  'SANITY_DATASET',
  // SANITY_API_TOKEN is optional for read-only access, but required for seeding and some routes
];

const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.warn('Warning: Missing env vars:', missing.join(', '));
} else {
  console.log('All required env vars present');
}

// Print optional vars presence
['SANITY_API_TOKEN','OPENAI_API_KEY','PINECONE_API_KEY','REDIS_URL'].forEach(k => {
  console.log(`${k}: ${process.env[k] ? 'set' : 'NOT SET'}`);
});
