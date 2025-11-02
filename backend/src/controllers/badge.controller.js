import { Badge, UserBadge } from '../models/badge.model.js';
import Homework from '../models/homework.model.js';
import HomeworkLog from '../models/homeworkLog.model.js';
import StudySession from '../models/studysession.model.js';

// Initialize default badges if they don't exist
const initializeDefaultBadges = async () => {
  const defaultBadges = [
    {
      id: 'first_homework',
      title: 'Getting Started',
      description: 'Complete your first homework assignment',
      category: 'homework',
      threshold: 1,
      icon: 'rocket',
      rarity: 'common',
      points: 10
    },
    {
      id: 'homework_streak_3',
      title: 'Consistent Learner',
      description: 'Complete homework for 3 consecutive days',
      category: 'streak',
      threshold: 3,
      icon: 'flame',
      rarity: 'uncommon',
      points: 25
    },
    {
      id: 'homework_streak_7',
      title: 'Week Warrior',
      description: 'Complete homework for 7 consecutive days',
      category: 'streak',
      threshold: 7,
      icon: 'crown',
      rarity: 'rare',
      points: 50
    },
    {
      id: 'homework_streak_30',
      title: 'Monthly Master',
      description: 'Complete homework for 30 consecutive days',
      category: 'streak',
      threshold: 30,
      icon: 'trophy',
      rarity: 'epic',
      points: 100
    },
    {
      id: 'homework_count_10',
      title: 'Task Master',
      description: 'Complete 10 homework assignments',
      category: 'homework',
      threshold: 10,
      icon: 'target',
      rarity: 'uncommon',
      points: 30
    },
    {
      id: 'homework_count_50',
      title: 'Productivity Pro',
      description: 'Complete 50 homework assignments',
      category: 'homework',
      threshold: 50,
      icon: 'shield',
      rarity: 'rare',
      points: 75
    },
    {
      id: 'homework_count_100',
      title: 'Century Scholar',
      description: 'Complete 100 homework assignments',
      category: 'homework',
      threshold: 100,
      icon: 'star',
      rarity: 'epic',
      points: 150
    },
    {
      id: 'study_time_1h',
      title: 'Focused Hour',
      description: 'Study for 1 hour in a single session',
      category: 'study',
      threshold: 60, // 60 minutes
      icon: 'clock',
      rarity: 'common',
      points: 15
    },
    {
      id: 'study_time_5h',
      title: 'Marathon Mind',
      description: 'Study for 5 hours in a single session',
      category: 'study',
      threshold: 300, // 300 minutes
      icon: 'zap',
      rarity: 'rare',
      points: 40
    },
    {
      id: 'study_streak_3',
      title: 'Study Habit',
      description: 'Study for 3 consecutive days',
      category: 'streak',
      threshold: 3,
      icon: 'book',
      rarity: 'uncommon',
      points: 20
    },
    {
      id: 'study_streak_7',
      title: 'Study Champion',
      description: 'Study for 7 consecutive days',
      category: 'streak',
      threshold: 7,
      icon: 'award',
      rarity: 'rare',
      points: 35
    },
    {
      id: 'perfect_week',
      title: 'Perfect Week',
      description: 'Complete all homework and study every day for a week',
      category: 'achievement',
      threshold: 7,
      icon: 'sparkles',
      rarity: 'epic',
      points: 100
    }
  ];

  for (const badgeData of defaultBadges) {
    await Badge.findOneAndUpdate(
      { id: badgeData.id },
      badgeData,
      { upsert: true, new: true }
    );
  }
};

// Get all available badges
export const getBadgeCatalog = async (req, res) => {
  try {
    await initializeDefaultBadges();
    const badges = await Badge.find({ isActive: true }).sort({ points: 1 });
    res.json(badges);
  } catch (error) {
    console.error('Error fetching badge catalog:', error);
    res.status(500).json({ error: 'Failed to fetch badge catalog' });
  }
};

// Get user's earned badges
export const getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;
    const userBadges = await UserBadge.find({
      userId,
      isEarned: true
    });

    // Return array format that frontend expects
    // Map userBadges to include badgeId and other fields
    const badgesList = userBadges.map(ub => ({
      id: ub.badgeId,
      badgeId: ub.badgeId,
      earnedAt: ub.earnedAt,
      progress: ub.progress,
      isEarned: ub.isEarned
    }));

    res.json(badgesList);
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({ error: 'Failed to fetch user badges' });
  }
};

// Compute and award badges based on user activity
export const computeUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Computing badges for userId:', userId);
    const newlyEarned = [];

    // Get user's activity data
    const [homeworkData, studyData] = await Promise.all([
      getHomeworkStats(userId),
      getStudyStats(userId)
    ]);

    console.log('Homework data:', homeworkData);
    console.log('Study data:', studyData);

    // Get all available badges
    const badges = await Badge.find({ isActive: true });

    for (const badge of badges) {
      const progress = calculateProgress(badge, homeworkData, studyData);
      const shouldEarn = progress >= badge.threshold;

      // Check if user already has this badge
      const existingUserBadge = await UserBadge.findOne({ userId, badgeId: badge.id });

      if (shouldEarn && (!existingUserBadge || !existingUserBadge.isEarned)) {
        // Award the badge
        await UserBadge.findOneAndUpdate(
          { userId, badgeId: badge.id },
          {
            userId,
            badgeId: badge.id,
            progress: Math.min(progress, badge.threshold),
            isEarned: true,
            earnedAt: new Date()
          },
          { upsert: true, new: true }
        );

        newlyEarned.push({
          id: badge.id,
          title: badge.title,
          description: badge.description,
          icon: badge.icon,
          rarity: badge.rarity,
          points: badge.points
        });
      } else if (existingUserBadge && !existingUserBadge.isEarned) {
        // Update progress even if not earned yet
        await UserBadge.findOneAndUpdate(
          { userId, badgeId: badge.id },
          { progress: Math.min(progress, badge.threshold) },
          { upsert: true, new: true }
        );
      }
    }

    // Calculate total completed activities
    const totalCompleted = homeworkData.completedCount + studyData.sessionCount;

    res.json({
      completedCount: totalCompleted,
      newlyEarned,
      homeworkStats: homeworkData,
      studyStats: studyData
    });

  } catch (error) {
    console.error('Error computing user badges:', error);
    res.status(500).json({ error: 'Failed to compute user badges' });
  }
};

// Helper function to get homework statistics
const getHomeworkStats = async (userId) => {
  try {
    console.log('Getting homework stats for userId:', userId);

    // Get data from both homework systems
    const [regularHomework, homeworkLogs] = await Promise.all([
      Homework.find({ userId }),
      HomeworkLog.find({ userId })
    ]);

    console.log('Regular homework found:', regularHomework.length);
    console.log('Homework logs found:', homeworkLogs.length);

    // Process regular homework
    const regularCompleted = regularHomework.filter(h => h.completed);
    const regularTotal = regularHomework.length;

    // Process homework log tasks
    let logCompleted = 0;
    let logTotal = 0;
    const logCompletedTasks = [];

    homeworkLogs.forEach(log => {
      log.tasks.forEach(task => {
        logTotal++;
        if (task.completed) {
          logCompleted++;
          logCompletedTasks.push({
            completedAt: log.weekStart, // Use week start as completion date
            subject: task.subject,
            title: task.title
          });
        }
      });
    });

    // Combine both systems
    const totalCompleted = regularCompleted.length + logCompleted;
    const totalCount = regularTotal + logTotal;

    // Combine completed tasks for streak calculation
    const allCompletedTasks = [
      ...regularCompleted.map(h => ({ completedAt: h.completedAt || h.updatedAt })),
      ...logCompletedTasks
    ];

    const streakDays = calculateStreakDays(allCompletedTasks, 'completedAt');

    return {
      totalCount,
      completedCount: totalCompleted,
      streakDays,
      completionRate: totalCount > 0 ? (totalCompleted / totalCount) * 100 : 0,
      regularHomework: {
        total: regularTotal,
        completed: regularCompleted.length
      },
      homeworkLog: {
        total: logTotal,
        completed: logCompleted
      }
    };
  } catch (error) {
    console.error('Error getting homework stats:', error);
    return { totalCount: 0, completedCount: 0, streakDays: 0, completionRate: 0 };
  }
};

// Helper function to get study statistics
const getStudyStats = async (userId) => {
  try {
    console.log('Getting study stats for userId:', userId);
    const studySessions = await StudySession.find({ userId });
    console.log('Study sessions found:', studySessions.length);
    console.log('Study sessions data:', studySessions);

    const totalStudyTime = studySessions.reduce((total, session) => total + (session.duration || 0), 0);
    const sessionCount = studySessions.length;
    const maxSessionTime = Math.max(...studySessions.map(s => s.duration || 0), 0);

    // Calculate consecutive days with study sessions
    const streakDays = calculateStreakDays(studySessions, 'createdAt');

    console.log('Study stats calculated:', {
      totalStudyTime,
      sessionCount,
      maxSessionTime,
      streakDays
    });

    return {
      totalStudyTime,
      sessionCount,
      maxSessionTime,
      streakDays,
      averageSessionTime: sessionCount > 0 ? totalStudyTime / sessionCount : 0
    };
  } catch (error) {
    console.error('Error getting study stats:', error);
    return { totalStudyTime: 0, sessionCount: 0, maxSessionTime: 0, streakDays: 0, averageSessionTime: 0 };
  }
};

// Helper function to calculate streak days
const calculateStreakDays = (items, dateField) => {
  if (!items || items.length === 0) return 0;

  const sortedItems = items
    .filter(item => item[dateField])
    .sort((a, b) => new Date(b[dateField]) - new Date(a[dateField]));

  if (sortedItems.length === 0) return 0;

  let streak = 1;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let currentDate = new Date(sortedItems[0][dateField]);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sortedItems.length; i++) {
    const itemDate = new Date(sortedItems[i][dateField]);
    itemDate.setHours(0, 0, 0, 0);

    const dayDiff = (currentDate - itemDate) / (1000 * 60 * 60 * 24);

    if (dayDiff === 1) {
      streak++;
      currentDate = itemDate;
    } else {
      break;
    }
  }

  return streak;
};

// Helper function to calculate progress for a specific badge
const calculateProgress = (badge, homeworkData, studyData) => {
  switch (badge.id) {
    case 'first_homework':
    case 'homework_count_10':
    case 'homework_count_50':
    case 'homework_count_100':
      return homeworkData.completedCount;

    case 'homework_streak_3':
    case 'homework_streak_7':
    case 'homework_streak_30':
      return homeworkData.streakDays;

    case 'study_time_1h':
    case 'study_time_5h':
      return studyData.maxSessionTime;

    case 'study_streak_3':
    case 'study_streak_7':
      return studyData.streakDays;

    case 'perfect_week':
      // Perfect week: both homework and study streaks of 7 days
      return Math.min(homeworkData.streakDays, studyData.streakDays);

    default:
      return 0;
  }
};

// Get user's badge progress
export const getUserBadgeProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const [homeworkData, studyData] = await Promise.all([
      getHomeworkStats(userId),
      getStudyStats(userId)
    ]);

    const badges = await Badge.find({ isActive: true });
    const userBadges = await UserBadge.find({ userId });

    // Create progress object keyed by badge ID for easy lookup
    const progressObj = {};
    
    badges.forEach(badge => {
      const userBadge = userBadges.find(ub => ub.badgeId === badge.id);
      const progress = calculateProgress(badge, homeworkData, studyData);

      progressObj[badge.id] = {
        progress: Math.min(progress, badge.threshold),
        threshold: badge.threshold,
        isEarned: userBadge ? userBadge.isEarned : false,
        earnedAt: userBadge ? userBadge.earnedAt : null
      };
    });

    // Calculate total completed activities
    const totalCompleted = homeworkData.completedCount + studyData.sessionCount;

    // Return format that frontend expects
    res.json({
      ...progressObj,
      totalCompleted
    });
  } catch (error) {
    console.error('Error fetching badge progress:', error);
    res.status(500).json({ error: 'Failed to fetch badge progress' });
  }
};

// Debug endpoint to check homework data
export const debugHomeworkData = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Debug: Checking homework data for userId:', userId);

    const [regularHomework, homeworkLogs] = await Promise.all([
      Homework.find({ userId }),
      HomeworkLog.find({ userId })
    ]);

    res.json({
      userId,
      regularHomework: {
        total: regularHomework.length,
        completed: regularHomework.filter(h => h.completed).length,
        data: regularHomework
      },
      homeworkLogs: {
        total: homeworkLogs.length,
        data: homeworkLogs
      }
    });
  } catch (error) {
    console.error('Error debugging homework data:', error);
    res.status(500).json({ error: 'Failed to debug homework data' });
  }
};

// Debug endpoint to check study session data
export const debugStudyData = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Debug: Checking study session data for userId:', userId);
    const studySessions = await StudySession.find({ userId });
    
    console.log('Study sessions found:', studySessions.length);
    console.log('Study sessions data:', studySessions);
    
    res.json({
      userId,
      studySessions: {
        total: studySessions.length,
        data: studySessions
      }
    });
  } catch (error) {
    console.error("Error debugging study data:", error);
    res.status(500).json({ error: "Failed to debug study data" });
  }
};
