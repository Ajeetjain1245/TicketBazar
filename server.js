import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Database and Config
import { connectDB } from './config/database.js';
import { configureCloudinary } from './config/cloudinary.js';
import { verifyConnection } from './config/mail.js';
import { seedDatabase } from './seed.js';
import { startCronJobs } from './utils/cronJobs.js';

// Middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Routes
import {
  authRoutes,
  ticketRoutes,
  orderRoutes,
  chatRoutes,
  adminRoutes,
  notificationRoutes,
  reviewRoutes,
} from './routes/index.js';

// Socket handlers
import { initializeSocket } from './socket/index.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// ── Reverse Proxy Trust ─────────────────────────────────────────────
// Render (and similar PaaS) terminates TLS at their load balancer and
// forwards requests with X-Forwarded-For / X-Forwarded-Proto headers.
// express-rate-limit v8+ throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR if
// it sees these headers without trust proxy being enabled.
// Setting "trust proxy" to 1 trusts the immediate upstream proxy only.
// ────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  console.log('[BOOT] trust proxy set to 1 (production / Render)');
} else {
  // In dev behind no proxy — keep default behavior
  app.set('trust proxy', false);
}

// ── CORS Configuration ──────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ticket-bazar.vercel.app',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is in our allowed list, or if it's a Vercel deployment preview url
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}`);
      callback(null, false); // Return false instead of an error to cleanly omit the CORS headers
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};
// ────────────────────────────────────────────────────────────────────

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: corsOptions,
});

// Make io accessible to routes
app.set('io', io);

// Connect to Database and handle auto-seeding
connectDB().then(async () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Checking database state for initial demo initialization...');
    try {
      await seedDatabase(false);
    } catch (err) {
      console.error('Database auto-seeding encountered an error:', err);
    }
  }
});

// Configure Cloudinary
configureCloudinary();

// Verify Mail connection on boot
// verifyConnection();

// Middleware
// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors(corsOptions));

// Global rate limiter: 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  // trust proxy is already configured above — skip ERL's own validation
  validate: { trustProxy: false, xForwardedForHeader: false },
});
app.use(globalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads (if needed locally)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route (includes proxy debug info in production)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    trustProxy: app.get('trust proxy'),
    clientIp: req.ip,
  });
});

// Auth-specific rate limiters (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false, xForwardedForHeader: false },
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Ticket Bazar API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// Initialize Socket.io handlers
initializeSocket(io);

// Start Cron Jobs
startCronJobs();

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║           🎫 Ticket Bazar Server Running               ║
║                                                        ║
║   Port:        ${PORT}                                   ║
║   Environment: ${env}${' '.repeat(Math.max(0, 16 - env.length))}║
║   Trust Proxy: ${app.get('trust proxy')}${' '.repeat(Math.max(0, 22 - String(app.get('trust proxy')).length))}║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error('Name:', err?.name);
  console.error('Message:', err?.message);
  console.error('Stack:', err?.stack);
  // Close server & exit process
  httpServer.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error('Name:', err?.name);
  console.error('Message:', err?.message);
  console.error('Stack:', err?.stack);
  process.exit(1);
});

export { io };
export default app;
