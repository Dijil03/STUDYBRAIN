import express from 'express';
import {
    getBadgeCatalog,
    getUserBadges,
    computeUserBadges,
    getUserBadgeProgress,
    debugHomeworkData,
    debugStudyData
} from '../controllers/badge.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router();

// All badge routes require authentication
router.use(protectRoutes);

// GET /api/badges/catalog - Get all available badges
router.get('/catalog', getBadgeCatalog);

// GET /api/badges/:userId - Get user's earned badges
router.get('/:userId', getUserBadges);

// POST /api/badges/:userId/compute - Compute and award new badges
router.post('/:userId/compute', computeUserBadges);

// GET /api/badges/:userId/progress - Get user's badge progress
router.get('/:userId/progress', getUserBadgeProgress);

// GET /api/badges/:userId/debug - Debug homework data
router.get('/:userId/debug', debugHomeworkData);

// GET /api/badges/:userId/debug-study - Debug study data
router.get('/:userId/debug-study', debugStudyData);

export default router;
