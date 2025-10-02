import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import performanceMonitor from './utils/performance.js';
import healthService from './services/health.service.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import aiRoutes from './routes/ai.routes.js';
import hotelRoutes from './routes/hotel.routes.js';
import searchRoutes from './routes/search.routes.js';
import sanityRoutes from './routes/sanity.routes.js';

// Import services and data
import ragService from './services/rag-ultra-optimized.service.js';
import sampleHotels from './data/sample-hotels.js';
import sanityService from './services/sanity.service.js';
import statusTracker from './services/sanity.index.status.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const PORT = process.env.PORT || 5000;

// Correlation ID middleware for performance monitoring
app.use((req, res, next) => {
  const correlationId = `req-${Date.now()}-${Math.random().toString(16).slice(2,8)}`;
  performanceMonitor.setCorrelationId(correlationId);
  res.setHeader('X-Correlation-ID', correlationId);
  next();
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow any localhost port for development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Allow the configured frontend URL
    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // Reject all other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
// Capture raw body for webhook HMAC verification
app.use(express.json({
  verify: (req, res, buf) => {
    try { req.rawBody = buf; } catch (e) {}
  }
}));
app.use(express.urlencoded({ extended: true, verify: (req, res, buf) => { try { req.rawBody = buf; } catch(e){} } }));
app.use(morgan('dev'));

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/sanity', sanityRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  (async () => {
    try {
      const services = await healthService.getHealth();
      res.json({ status: 'OK', timestamp: new Date().toISOString(), services });
    } catch (e) {
      res.status(500).json({ status: 'ERROR', error: e.message });
    }
  })();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize data on server start
async function initializeData() {
  try {
    console.log('🏨 Initializing hotel data...');

    let hotelsToStore = sampleHotels;

    // If Sanity is configured, try to load hotels from the CMS. This allows using Sanity as the source of truth.
    if (process.env.SANITY_PROJECT_ID) {
      try {
        console.log('Fetching hotels from Sanity...');
        const sanityHotels = await sanityService.getAllHotels();
        if (Array.isArray(sanityHotels) && sanityHotels.length > 0) {
          hotelsToStore = sanityHotels;
          console.log(`Loaded ${sanityHotels.length} hotels from Sanity`);
        } else {
          console.log('No hotels found in Sanity; falling back to local sample data');
        }
      } catch (e) {
        console.warn('Failed to fetch hotels from Sanity, falling back to sample data:', e && e.message ? e.message : e);
      }
    }

  await ragService.storeHotelData(hotelsToStore);
  // update status tracker
  try { statusTracker.setStatus(Array.isArray(hotelsToStore) ? hotelsToStore.length : 0); } catch(e) {}
  console.log('✅ Hotel data initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing hotel data:', error);
    // Don't crash the server, just log the error
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize data after server starts
  await initializeData();
  
  // Diagnostic: log the public outbound IP so you can add it to external allowlists
  (async function logOutboundIP(){
    try {
      // Use a public service to report the caller's IP. Node 18+ has global fetch.
      const res = await fetch('https://api.ipify.org?format=json');
      if (res && res.ok) {
        const body = await res.json();
        console.log('🌐 Public outbound IP (for allowlist testing):', body.ip);
      } else {
        console.log('Unable to determine public outbound IP for allowlist testing');
      }
    } catch (e) {
      console.warn('Error fetching public outbound IP:', e && e.message ? e.message : e);
    }
  })();
});

export default app;
