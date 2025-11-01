import express from 'express';
import {
    getPersonalizedSchedule,
    getActiveSchedule,
    generateOptimizedSchedule,
    createCustomSchedule,
    completeStudyBlock,
    getScheduleStatistics,
    updateScheduleSettings
} from '../controllers/schedule.controller.js';

const router = express.Router();

// Get personalized schedules
router.get('/:userId/personalized', getPersonalizedSchedule);
router.get('/personalized', getPersonalizedSchedule); // For query param userId

// Get active schedule
router.get('/:userId/active', getActiveSchedule);
router.get('/active', getActiveSchedule); // For query param userId

// Generate AI-optimized schedule
router.post('/generate', generateOptimizedSchedule);

// Create custom schedule
router.post('/custom', createCustomSchedule);

// Complete study block
router.post('/:scheduleId/complete/:day/:blockIndex', completeStudyBlock);

// Get schedule statistics
router.get('/:userId/statistics', getScheduleStatistics);
router.get('/statistics', getScheduleStatistics); // For query param userId

// Update schedule settings
router.put('/:scheduleId/settings', updateScheduleSettings);

export default router;


