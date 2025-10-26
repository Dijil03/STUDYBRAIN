import express from 'express';
import { 
  getCommunityRankings, 
  getUserCommunityStats, 
  getCategoryLeaderboard 
} from '../controllers/community.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get community rankings (public)
router.get('/rankings', getCommunityRankings);

// Get user's community stats (protected)
router.get('/stats/:userId', authMiddleware, getUserCommunityStats);

// Get category leaderboard (public)
router.get('/leaderboard/:category', getCategoryLeaderboard);

export default router;
