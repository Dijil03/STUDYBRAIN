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

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    'https://studybrain.vercel.app', // Explicitly allow Vercel URL
    'https://www.studybrain.vercel.app', // Allow www variant too
    'http://studybrain.vercel.app', // HTTP variant (if needed)
    'http://www.studybrain.vercel.app' // HTTP www variant
  ].filter(Boolean)
  : ["http://localhost:5173"];

// Normalize origins (remove trailing slashes, convert to lowercase for comparison)
const normalizedOrigins = allowedOrigins.map(origin => origin.replace(/\/$/, '').toLowerCase());

// Log allowed origins for debugging
console.log('🌐 Allowed CORS origins:', allowedOrigins);
console.log('🌐 Normalized origins:', normalizedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl, etc.)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }

    // Normalize the incoming origin
    const normalizedOrigin = origin.replace(/\/$/, '').toLowerCase();
    
    // Check if normalized origin is in allowed list
    if (normalizedOrigins.includes(normalizedOrigin)) {
      console.log(`✅ CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      // Log blocked origin for debugging
      console.warn(`⚠️ CORS blocked origin: ${origin} (normalized: ${normalizedOrigin})`);
      console.log('Allowed origins:', allowedOrigins);
      console.log('Normalized allowed origins:', normalizedOrigins);
      // Still allow it for debugging - remove this in production if needed
      // For now, allow it so we can see what's happening
      callback(null, true); // Temporarily allow all for debugging
      // callback(new Error('Not allowed by CORS')); // Uncomment when working
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

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
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/ai', aiRoutes);






// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler - Backend only serves API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
    path: req.originalUrl,
    note: 'Frontend is deployed separately'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Connect to database first, then start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Server is ready to accept connections');
    console.log('Using MongoDB session store');
  });

  // Setup Socket.io for real-time collaboration
  setupDocumentSocket(server);
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});