import StudyPlan from '../models/studyplan.model.js';
import User from '../models/auth.model.js';

// Create a new study plan
export const createStudyPlan = async (req, res) => {
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
};

// Get all study plans for a user
export const getStudyPlans = async (req, res) => {
  try {
    const { userId } = req.params;

    const studyPlans = await StudyPlan.find({ userId }).sort({ createdAt: -1 });

    // Get user subscription for limit info
    const user = await User.findById(userId);
    const maxPlans = user?.subscription?.plan === 'free' ? 3 : -1;
    const currentCount = studyPlans.length;

    res.status(200).json({
      success: true,
      studyPlans,
      limits: {
        max: maxPlans,
        current: currentCount,
        remaining: maxPlans === -1 ? -1 : maxPlans - currentCount
      }
    });
  } catch (error) {
    console.error('Error fetching study plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching study plans',
      error: error.message
    });
  }
};

// Get a specific study plan
export const getStudyPlan = async (req, res) => {
  try {
    const { userId, planId } = req.params;

    const studyPlan = await StudyPlan.findOne({ _id: planId, userId });

    if (!studyPlan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found'
      });
    }

    res.status(200).json({
      success: true,
      studyPlan
    });
  } catch (error) {
    console.error('Error fetching study plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching study plan',
      error: error.message
    });
  }
};

// Update a study plan
export const updateStudyPlan = async (req, res) => {
  try {
    const { userId, planId } = req.params;
    const updateData = req.body;

    const studyPlan = await StudyPlan.findOneAndUpdate(
      { _id: planId, userId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!studyPlan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Study plan updated successfully',
      studyPlan
    });
  } catch (error) {
    console.error('Error updating study plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating study plan',
      error: error.message
    });
  }
};

// Delete a study plan
export const deleteStudyPlan = async (req, res) => {
  try {
    const { userId, planId } = req.params;

    const studyPlan = await StudyPlan.findOneAndDelete({ _id: planId, userId });

    if (!studyPlan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Study plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting study plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting study plan',
      error: error.message
    });
  }
};

// Get study plan limits for a user
export const getStudyPlanLimits = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentCount = await StudyPlan.countDocuments({ userId });
    const maxPlans = user.subscription?.plan === 'free' ? 3 : -1;

    res.status(200).json({
      success: true,
      limits: {
        max: maxPlans,
        current: currentCount,
        remaining: maxPlans === -1 ? -1 : maxPlans - currentCount,
        isUnlimited: maxPlans === -1,
        plan: user.subscription?.plan || 'free'
      }
    });
  } catch (error) {
    console.error('Error fetching study plan limits:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching study plan limits',
      error: error.message
    });
  }
};
