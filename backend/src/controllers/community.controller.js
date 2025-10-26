import User from '../models/auth.model.js';

// Get community rankings
export const getCommunityRankings = async (req, res) => {
  try {
    console.log('Fetching community rankings...');
    
    // Get all users with their progress data
    const users = await User.find({}).select('username email subscription createdAt');
    
    // Calculate rankings for each user
    const usersWithRankings = await Promise.all(
      users.map(async (user, index) => {
        // Calculate user's total score based on various factors
        const totalScore = await calculateUserScore(user._id);
        
        // Get user's progress data
        const progressData = await getUserProgressData(user._id);
        
        // Determine stage requirements
        const stageRequirements = {
          beginner: 0,
          intermediate: 500,
          advanced: 2000,
          expert: 5000,
          master: 10000
        };
        
        const currentStage = getCurrentStage(totalScore);
        const nextStage = getNextStage(currentStage);
        const nextStageRequirement = stageRequirements[nextStage] || 10000;
        
        return {
          id: user._id,
          username: user.username,
          email: user.email,
          rank: index + 1, // Will be recalculated after sorting
          totalScore,
          currentStage,
          nextStage,
          nextStageRequirement,
          ...progressData,
          memberSince: user.createdAt,
          subscription: user.subscription
        };
      })
    );
    
    // Sort by total score and assign ranks
    usersWithRankings.sort((a, b) => b.totalScore - a.totalScore);
    usersWithRankings.forEach((user, index) => {
      user.rank = index + 1;
    });
    
    console.log(`✅ Generated rankings for ${usersWithRankings.length} users`);
    
    res.status(200).json({
      success: true,
      users: usersWithRankings,
      totalUsers: usersWithRankings.length
    });
  } catch (error) {
    console.error('Error fetching community rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching community rankings',
      error: error.message
    });
  }
};

// Calculate user's total score
const calculateUserScore = async (userId) => {
  try {
    // This would integrate with your existing homework, study time, and badge systems
    // For now, we'll create a mock calculation based on user data
    
    const user = await User.findById(userId);
    if (!user) return 0;
    
    let score = 0;
    
    // Base score for account age (1 point per day)
    const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    score += accountAge;
    
    // Score for subscription level
    if (user.subscription) {
      const subscriptionMultiplier = {
        'free': 1,
        'premium': 1.5,
        'enterprise': 2
      };
      score *= (subscriptionMultiplier[user.subscription.plan] || 1);
    }
    
    // Mock data for demonstration - in real implementation, this would come from:
    // - Homework completion records
    // - Study time logs
    // - Badge achievements
    // - Assessment scores
    
    // Random score for demonstration (replace with real calculations)
    const mockScore = Math.floor(Math.random() * 5000) + 100;
    score += mockScore;
    
    return Math.floor(score);
  } catch (error) {
    console.error('Error calculating user score:', error);
    return 0;
  }
};

// Get user's progress data
const getUserProgressData = async (userId) => {
  try {
    // Mock data for demonstration - replace with real database queries
    return {
      homeworkCompleted: Math.floor(Math.random() * 50) + 1,
      badgesEarned: Math.floor(Math.random() * 20) + 1,
      studyTime: Math.floor(Math.random() * 200) + 10,
      assessmentsCompleted: Math.floor(Math.random() * 10) + 1,
      streakDays: Math.floor(Math.random() * 30) + 1,
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    };
  } catch (error) {
    console.error('Error getting user progress data:', error);
    return {
      homeworkCompleted: 0,
      badgesEarned: 0,
      studyTime: 0,
      assessmentsCompleted: 0,
      streakDays: 0,
      lastActive: new Date()
    };
  }
};

// Get current stage based on score
const getCurrentStage = (score) => {
  if (score >= 10000) return 'master';
  if (score >= 5000) return 'expert';
  if (score >= 2000) return 'advanced';
  if (score >= 500) return 'intermediate';
  return 'beginner';
};

// Get next stage
const getNextStage = (currentStage) => {
  const stages = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];
  const currentIndex = stages.indexOf(currentStage);
  return stages[currentIndex + 1] || 'master';
};

// Get user's community stats
export const getUserCommunityStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const totalScore = await calculateUserScore(userId);
    const progressData = await getUserProgressData(userId);
    const currentStage = getCurrentStage(totalScore);
    
    res.status(200).json({
      success: true,
      stats: {
        totalScore,
        currentStage,
        ...progressData
      }
    });
  } catch (error) {
    console.error('Error getting user community stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user community stats',
      error: error.message
    });
  }
};

// Get leaderboard for specific category
export const getCategoryLeaderboard = async (req, res) => {
  try {
    const { category } = req.params; // homework, studyTime, badges, etc.
    
    const users = await User.find({}).select('username email');
    
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const progressData = await getUserProgressData(user._id);
        const totalScore = await calculateUserScore(user._id);
        
        return {
          id: user._id,
          username: user.username,
          email: user.email,
          score: progressData[category] || 0,
          totalScore,
          ...progressData
        };
      })
    );
    
    // Sort by the specific category
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });
    
    res.status(200).json({
      success: true,
      category,
      leaderboard: leaderboard.slice(0, 50) // Top 50
    });
  } catch (error) {
    console.error('Error getting category leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting category leaderboard',
      error: error.message
    });
  }
};
