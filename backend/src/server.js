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
import emailRoutes from './routes/email.routes.js'
import googleDocsRoutes from './routes/googleDocs.routes.js'
import googleClassroomRoutes from './routes/googleClassroom.routes.js'
import studyPlanRoutes from './routes/studyplan.routes.js'
import connectDB from './db/connection.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
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
  ? [process.env.FRONTEND_URL] 
  : ["http://localhost:5173"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
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

// Serve static files from the frontend build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
}

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
app.use('/api/email', emailRoutes);
app.use('/api/google-docs', googleDocsRoutes);
app.use('/api/google-classroom', googleClassroomRoutes);
app.use('/api/study-plans', studyPlanRoutes);






// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  // In production, serve the React app for client-side routing
  if (process.env.NODE_ENV === 'production' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  } else {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.originalUrl
    });
  }
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

connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Server is ready to accept connections');
});

// Setup Socket.io for real-time collaboration
setupDocumentSocket(server);