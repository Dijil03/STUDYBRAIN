import express from 'express';
import {
    trackLearningSession,
    generatePerformanceMetrics,
    getAnalyticsDashboard,
    generateLearningInsights,
    getPredictiveAnalytics,
    generateAnalyticsReport
} from '../controllers/analytics.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Track Learning Session
router.post('/session/track', authMiddleware, trackLearningSession);

// Generate Performance Metrics
router.post('/metrics/generate', authMiddleware, generatePerformanceMetrics);

// Get Analytics Dashboard
router.get('/dashboard/:userId', authMiddleware, getAnalyticsDashboard);

// Generate Learning Insights
router.get('/insights/:userId', authMiddleware, generateLearningInsights);

// Get Predictive Analytics
router.get('/predictions/:userId', authMiddleware, getPredictiveAnalytics);

// Generate Analytics Report
router.post('/report/generate', authMiddleware, generateAnalyticsReport);

export default router;
