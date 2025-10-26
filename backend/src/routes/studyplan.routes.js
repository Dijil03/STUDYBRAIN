import express from 'express';
import {
  createStudyPlan,
  getStudyPlans,
  getStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
  getStudyPlanLimits
} from '../controllers/studyplan.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import StudyPlan from '../models/studyplan.model.js';
import User from '../models/auth.model.js';

const router = express.Router();

// Create a new study plan (protected route)
router.post('/:userId', authMiddleware, createStudyPlan);

// Get all study plans for a user (protected route)
router.get('/:userId', authMiddleware, getStudyPlans);

// Get study plan limits for a user (protected route)
router.get('/:userId/limits', authMiddleware, getStudyPlanLimits);

// Get a specific study plan (protected route)
router.get('/:userId/:planId', authMiddleware, getStudyPlan);

// Update a study plan (protected route)
router.put('/:userId/:planId', authMiddleware, updateStudyPlan);

// Delete a study plan (protected route)
router.delete('/:userId/:planId', authMiddleware, deleteStudyPlan);

// Test endpoint to create study plans without auth (for testing)
router.post('/:userId/test-create', async (req, res) => {
  try {
    const { userId } = req.params;
    const planData = req.body;

    // Get user subscription to check limits
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check study plan limits based on subscription
    const currentPlanCount = await StudyPlan.countDocuments({ userId });
    const maxPlans = user.subscription?.plan === 'free' ? 3 : -1; // -1 means unlimited

    if (maxPlans !== -1 && currentPlanCount >= maxPlans) {
      return res.status(403).json({
        success: false,
        message: 'Study plan limit reached. Upgrade to Pro for unlimited study plans.',
        limit: maxPlans,
        current: currentPlanCount,
        requiresUpgrade: true
      });
    }

    // Create the study plan
    const studyPlan = new StudyPlan({
      userId,
      ...planData
    });

    await studyPlan.save();

    res.status(201).json({
      success: true,
      message: 'Study plan created successfully',
      studyPlan,
      limits: {
        max: maxPlans,
        current: currentPlanCount + 1,
        remaining: maxPlans === -1 ? -1 : maxPlans - (currentPlanCount + 1)
      }
    });
  } catch (error) {
    console.error('Error creating study plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating study plan',
      error: error.message
    });
  }
});

export default router;
