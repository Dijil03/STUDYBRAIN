import User from '../models/auth.model.js';
import Homework from '../models/homework.model.js';
import { UserBadge, Badge } from '../models/badge.model.js';
import StudySession from '../models/studysession.model.js';
import Assessment from '../models/assessment.model.js';
import Streak from '../models/streak.model.js';

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
    const user = await User.findById(userId);
    if (!user) return 0;
    
    let score = 0;
    const userIdString = userId.toString();
    
    // Base score for account age (1 point per day, max 365 points)
    const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    score += Math.min(accountAge, 365);
    
    // Score from completed homework (10 points per completed homework)
    const completedHomework = await Homework.countDocuments({ 
      userId: userIdString, 
      completed: true 
    });
    score += completedHomework * 10;
    
    // Score from study time (1 point per hour, max 500 points)
    const studySessions = await StudySession.find({ userId: userIdString });
    const totalStudyMinutes = studySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalStudyHours = Math.floor(totalStudyMinutes / 60);
    score += Math.min(totalStudyHours, 500);
    
    // Score from badges earned (badge points value)
    const userBadges = await UserBadge.find({ 
      userId: userIdString, 
      isEarned: true 
    });
    
    // Get badge IDs and fetch their point values
    const badgeIds = userBadges.map(ub => ub.badgeId);
    const badges = await Badge.find({ id: { $in: badgeIds } });
    const badgeMap = new Map(badges.map(b => [b.id, b.points || 10]));
    
    const badgeScore = userBadges.reduce((sum, ub) => {
      const badgePoints = badgeMap.get(ub.badgeId) || 10;
      return sum + badgePoints;
    }, 0);
    score += badgeScore;
    
    // Score from assessments (5 points per completed assessment, bonus for high scores)
    const assessments = await Assessment.find({ userId: userIdString });
    const assessmentScore = assessments.reduce((sum, assessment) => {
      if (assessment.submissions && assessment.submissions.length > 0) {
        // Base score for completing assessment
        let assessScore = 5;
        // Bonus for high scores (average score above 80%)
        const latestSubmission = assessment.submissions[assessment.submissions.length - 1];
        const avgScore = assessment.questions.length > 0 
          ? (latestSubmission.score / assessment.questions.length) * 100 
          : 0;
        if (avgScore >= 80) assessScore += 5; // Bonus for good scores
        return sum + assessScore;
      }
      return sum;
    }, 0);
    score += assessmentScore;
    
    // Score for subscription level (multiplier)
    if (user.subscription) {
      const subscriptionMultiplier = {
        'free': 1,
        'premium': 1.5,
        'enterprise': 2
      };
      score = Math.floor(score * (subscriptionMultiplier[user.subscription.plan] || 1));
    }
    
    // Score from streak (1 point per day of current streak, max 100 points)
    // Try both ObjectId and string formats for userId
    const streak = await Streak.findOne({ 
      $or: [
        { userId: userId },
        { userId: userIdString }
      ]
    });
    if (streak && streak.currentStreak) {
      score += Math.min(streak.currentStreak, 100);
    }
    
    return Math.floor(score);
  } catch (error) {
    console.error('Error calculating user score:', error);
    return 0;
  }
};

// Get user's progress data
const getUserProgressData = async (userId) => {
  try {
    const userIdString = userId.toString();
    
    // Get completed homework count
    const homeworkCompleted = await Homework.countDocuments({ 
      userId: userIdString, 
      completed: true 
    });
    
    // Get badges earned count
    const badgesEarned = await UserBadge.countDocuments({ 
      userId: userIdString, 
      isEarned: true 
    });
    
    // Get total study time in hours
    const studySessions = await StudySession.find({ userId: userIdString });
    const totalStudyMinutes = studySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const studyTime = Math.floor(totalStudyMinutes / 60); // Convert to hours
    
    // Get completed assessments count (assessments with at least one submission)
    const assessments = await Assessment.find({ userId: userIdString });
    const assessmentsCompleted = assessments.filter(assessment => 
      assessment.submissions && assessment.submissions.length > 0
    ).length;
    
    // Get current streak days
    // Try both ObjectId and string formats for userId
    const streak = await Streak.findOne({ 
      $or: [
        { userId: userId },
        { userId: userIdString }
      ]
    });
    const streakDays = streak ? streak.currentStreak || 0 : 0;
    
    // Get last active date (most recent activity from study sessions or homework completion)
    const lastStudySession = await StudySession.findOne({ userId: userIdString })
      .sort({ date: -1 })
      .select('date');
    
    const lastCompletedHomework = await Homework.findOne({ 
      userId: userIdString, 
      completed: true 
    })
      .sort({ completedAt: -1 })
      .select('completedAt');
    
    let lastActive = new Date();
    if (lastStudySession && lastStudySession.date) {
      lastActive = lastStudySession.date;
    }
    if (lastCompletedHomework && lastCompletedHomework.completedAt) {
      if (lastCompletedHomework.completedAt > lastActive) {
        lastActive = lastCompletedHomework.completedAt;
      }
    }
    
    return {
      homeworkCompleted,
      badgesEarned,
      studyTime,
      assessmentsCompleted,
      streakDays,
      lastActive
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
