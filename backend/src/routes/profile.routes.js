import express from 'express';
import {
    getCompleteProfile,
    updatePersonalInfo,
    updatePreferences,
    updateStudyGoal,
    completeStudyGoal,
    getPersonalizedRecommendations
} from '../controllers/profile.controller.js';

const router = express.Router();

// Get complete user profile
router.get('/:userId/complete', getCompleteProfile);
router.get('/complete', getCompleteProfile); // For query param userId

// Update personal information
router.put('/:userId/personal-info', updatePersonalInfo);
router.put('/personal-info', updatePersonalInfo); // For body userId

// Update user preferences
router.put('/:userId/preferences', updatePreferences);
router.put('/preferences', updatePreferences); // For body userId

// Study goals management
router.post('/:userId/study-goals', updateStudyGoal);
router.put('/:userId/study-goals/:goalId', updateStudyGoal);
router.post('/:userId/study-goals/:goalId/complete', completeStudyGoal);

// Get personalized recommendations
router.get('/:userId/recommendations', getPersonalizedRecommendations);
router.get('/recommendations', getPersonalizedRecommendations); // For query param userId

export default router;
