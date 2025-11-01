import Streak from '../models/streak.model.js';
import Progress from '../models/progress.model.js';

// Helper function to get date string in YYYY-MM-DD format
const getDateString = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

// Get or create streak for user
export const getStreak = async (req, res) => {
  try {
    const { userId } = req.params;
    let streak = await Streak.findOne({ userId });
    
    if (!streak) {
      streak = new Streak({ userId });
      await streak.save();
    }
    
    // Check if streak should be reset
    const today = getDateString();
    if (streak.lastActivityDate) {
      const lastActivity = new Date(streak.lastActivityDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActivity < yesterday.setHours(0, 0, 0, 0)) {
        streak.currentStreak = 0;
      }
    }
    
    res.status(200).json(streak);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Record study activity
export const recordActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { studyTime, tasksCompleted } = req.body;
    const today = getDateString();
    
    let streak = await Streak.findOne({ userId });
    
    if (!streak) {
      streak = new Streak({ userId });
    }
    
    // Update streak
    const lastActivity = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;
    const todayDate = new Date(today);
    
    if (!lastActivity || lastActivity.toDateString() !== todayDate.toDateString()) {
      // New day
      streak.currentStreak += 1;
      streak.totalDaysStudied += 1;
      
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    }
    
    // Update activity for today
    const activityIndex = streak.activityByDate.findIndex(a => a.date === today);
    if (activityIndex >= 0) {
      streak.activityByDate[activityIndex].studyTime += (studyTime || 0);
      streak.activityByDate[activityIndex].tasksCompleted += (tasksCompleted || 0);
    } else {
      streak.activityByDate.push({
        date: today,
        studyTime: studyTime || 0,
        tasksCompleted: tasksCompleted || 0
      });
    }
    
    streak.lastActivityDate = new Date();
    await streak.save();
    
    res.status(200).json(streak);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get progress
export const getProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    let progress = await Progress.findOne({ userId });
    
    if (!progress) {
      progress = new Progress({ userId });
      await progress.save();
    }
    
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update progress
export const updateProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { studyTime, tasksCompleted, goalsCompleted, xp } = req.body;
    
    let progress = await Progress.findOne({ userId });
    
    if (!progress) {
      progress = new Progress({ userId });
    }
    
    if (studyTime) progress.totalStudyTime += studyTime;
    if (tasksCompleted) progress.tasksCompleted += tasksCompleted;
    if (goalsCompleted) progress.goalsCompleted += goalsCompleted;
    if (xp) {
      progress.xp += xp;
      // Calculate level (level up every 100 XP)
      progress.level = Math.floor(progress.xp / 100) + 1;
    }
    
    await progress.save();
    res.status(200).json(progress);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: error.message });
  }
};
