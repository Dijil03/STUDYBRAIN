import express from 'express';
import authRoutes from './routes/auth.routes.js';
import homeworkRoutes from "./routes/homework.routes.js"
import myWorldRoutes from "./routes/myworld.routes.js"
import studyTimeRoutes from "./routes/study.routes.js";
import homeworkLogRoutes from "./routes/homeworkLog.routes.js";
import flashcardRoutes from "./routes/flashcard.routes.js";
import examRoutes from "./routes/exam.routes.js"
import assessmentRoutes from './routes/assessment.routes.js'
import badgeRoutes from './routes/badge.routes.js'
import folderRoutes from './routes/folder.routes.js'
import documentRoutes from './routes/document.routes.js'
import commentRoutes from './routes/comment.routes.js'
import versionRoutes from './routes/version.routes.js'
import stripeRoutes from './routes/stripe.routes.js'
import communityRoutes from './routes/community.routes.js'
import googleDocsRoutes from './routes/googleDocs.routes.js'
import googleClassroomRoutes from './routes/googleClassroom.routes.js'
import googleCalendarRoutes from './routes/googleCalendar.routes.js'
import studyPlanRoutes from './routes/studyplan.routes.js'
import aiRoutes from './routes/ai.routes.js'
import connectDB from './db/connection.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from './config/passport.js';
import { setupDocumentSocket } from './socket/documentSocket.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS headers MUST be set FIRST, before any other middleware
// This is a manual implementation to ensure it always works
// Define allowed origins
const getAllowedOrigins = () => {
  const allowed = [
    'https://studybrain.vercel.app',
    'https://www.studybrain.vercel.app',
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  // Add localhost for development
  if (process.env.NODE_ENV !== 'production') {
    allowed.push('http://localhost:5173', 'http://localhost:3000');
  }

  return allowed;
};

const allowedOrigins = getAllowedOrigins();
console.log('✅ Allowed CORS origins:', allowedOrigins);

app.use((req, res, next) => {
  // Log incoming request
  const origin = req.headers.origin;
  console.log(`📥 ${req.method} ${req.path} - Origin: ${origin || 'none'}`);

  // Check if origin is allowed
  // Allow requests with no origin (like mobile apps or curl requests) only in development
  const isAllowedOrigin = !origin
    ? (process.env.NODE_ENV !== 'production')
    : allowedOrigins.includes(origin);

  // Only set CORS headers if origin is allowed (or no origin in dev mode)
  if (isAllowedOrigin) {
    const requestOrigin = origin || '*';
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie, Set-Cookie, X-CSRF-Token');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization, Set-Cookie');
    res.setHeader('Access-Control-Max-Age', '86400');
  } else {
    console.warn(`⚠️ CORS: Blocked request from disallowed origin: ${origin}`);
  }

  // Handle preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    if (isAllowedOrigin) {
      console.log('✅ Handling OPTIONS preflight request from:', origin || 'no origin');
      return res.status(200).end();
    } else {
      console.warn('❌ Rejecting OPTIONS preflight from disallowed origin:', origin);
      return res.status(403).json({ error: 'CORS policy: Origin not allowed' });
    }
  }

  next();
});

// CORS configuration - Use the same allowed origins
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS: Origin not allowed: ${origin}`);
      // In production, be strict; in development, be permissive
      callback(null, process.env.NODE_ENV !== 'production');
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie', 'Set-Cookie', 'X-CSRF-Token'],
  exposedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 200
};

console.log('🌐 CORS: Using manual CORS headers (most reliable method)');

// Also use cors package as backup (after manual headers are set)
app.use(cors(corsOptions));

// Explicit OPTIONS handler for all routes (preflight requests)
// Note: Express 5 doesn't support wildcard '*', so we handle OPTIONS in the manual middleware
// The cors() middleware already handles OPTIONS requests automatically

app.use(cookieParser());

// Session configuration with MongoDB store
// Using mongoUrl so store can connect independently
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // 24 hours in seconds
    autoRemove: 'native'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5001;

app.use(bodyParser.json())

app.use(express.json());

// Serve static files for uploaded avatars
app.use('/uploads', express.static('uploads'));

// Frontend is deployed separately (Vercel), backend only serves API

app.use("/api/auth", authRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/myworld", myWorldRoutes);
app.use("/api/studytime", studyTimeRoutes);
app.use("/api/homeworklog", homeworkLogRoutes);
app.use("/api/examtime", examRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/badges", badgeRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/google-docs', googleDocsRoutes);
app.use('/api/google-classroom', googleClassroomRoutes);
app.use('/api/google-calendar', googleCalendarRoutes);
app.use('/api/study-plans', studyPlanRoutes);

// Register AI routes with error handling
try {
  app.use('/api/ai', aiRoutes);
  console.log('✅ AI routes registered successfully at /api/ai');
} catch (error) {
  console.error('❌ Failed to register AI routes:', error);
}

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  console.log('🧪 Test CORS endpoint called from origin:', req.headers.origin);
  res.status(200).json({
    success: true,
    message: 'CORS is working!',
    origin: req.headers.origin || 'none',
    timestamp: new Date().toISOString()
  });
});






// Health check endpoint - with explicit CORS
app.get('/health', (req, res) => {
  // Explicitly set CORS headers for health check
  const origin = req.headers.origin;
  const isAllowedOrigin = !origin || allowedOrigins.includes(origin);
  const requestOrigin = origin && isAllowedOrigin ? origin : (allowedOrigins[0] || '*');

  res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie, Set-Cookie, X-CSRF-Token');

  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    corsConfigured: true,
    allowedOrigins: allowedOrigins
  });
});

// 404 handler - Backend only serves API routes
app.use((req, res) => {
  // Ensure CORS headers are set for 404 responses too
  const origin = req.headers.origin;
  const isAllowedOrigin = !origin || allowedOrigins.includes(origin);
  const requestOrigin = origin && isAllowedOrigin ? origin : (allowedOrigins[0] || '*');

  res.header('Access-Control-Allow-Origin', requestOrigin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie, Set-Cookie, X-CSRF-Token');

  res.status(404).json({
    success: false,
    message: 'API route not found',
    path: req.originalUrl,
    note: 'Frontend is deployed separately'
  });
});

// Global error handler - Make sure CORS headers are set even on errors
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Ensure CORS headers are set before sending error response
  const origin = req.headers.origin;
  const isAllowedOrigin = !origin || allowedOrigins.includes(origin);
  const requestOrigin = origin && isAllowedOrigin ? origin : (allowedOrigins[0] || '*');

  res.header('Access-Control-Allow-Origin', requestOrigin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie, Set-Cookie, X-CSRF-Token');

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Connect to database first, then start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log('✅ Server is ready to accept connections');
    console.log('✅ Using MongoDB session store');
    console.log('✅ CORS configured with allowed origins:', allowedOrigins);
    console.log('✅ Test CORS endpoint: GET /api/test-cors');
    console.log('✅ AI routes: POST /api/ai/sessions');
  });

  // Setup Socket.io for real-time collaboration
  setupDocumentSocket(server);
}).catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});