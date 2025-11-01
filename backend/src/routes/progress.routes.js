import express from 'express';
import {
  getStreak,
  recordActivity,
  getProgress,
  updateProgress
} from '../controllers/streak.controller.js';

const router = express.Router();

// Streak routes
router.get('/streak/:userId', getStreak);
router.post('/activity/:userId', recordActivity);

// Progress routes
router.get('/:userId', getProgress);
router.put('/:userId', updateProgress);

export default router;
