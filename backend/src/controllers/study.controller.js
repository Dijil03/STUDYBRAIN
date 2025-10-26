import StudySession from "../models/studysession.model.js";
import User from "../models/auth.model.js";

// Log a new study session
export const logSession = async (req, res) => {
  try {
    const { homeworkName, duration, feedback, productivity } = req.body;
    const { userId } = req.params;

    // Get user subscription to check limits
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check study session limits based on subscription
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySessions = await StudySession.countDocuments({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    const maxSessionsPerDay = user.subscription?.plan === 'free' ? 3 : -1; // -1 means unlimited

    if (maxSessionsPerDay !== -1 && todaySessions >= maxSessionsPerDay) {
      return res.status(403).json({
        success: false,
        message: 'Daily study session limit reached. Upgrade to Pro for unlimited study sessions.',
        limit: maxSessionsPerDay,
        current: todaySessions,
        requiresUpgrade: true
      });
    }

    // Map frontend fields to backend model fields
    const session = await StudySession.create({
      userId,
      subject: homeworkName, // Map homeworkName to subject
      duration: parseInt(duration),
      notes: feedback, // Map feedback to notes
      productivity
    });

    await session.save();
    
    res.status(201).json({
      success: true,
      message: 'Study session logged successfully',
      session,
      limits: {
        max: maxSessionsPerDay,
        current: todaySessions + 1,
        remaining: maxSessionsPerDay === -1 ? -1 : maxSessionsPerDay - (todaySessions + 1)
      }
    });
  } catch (err) {
    console.error("Error logging session:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to log study session" 
    });
  }
};

// Get all sessions for a user
export const getSessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.params.userId }).sort({ date: -1 });
    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch study sessions" });
  }
};

// Delete a session
export const deleteSession = async (req, res) => {
  try {
    await StudySession.findOneAndDelete({ _id: req.params.sessionId, userId: req.params.userId });
    res.status(200).json({ message: "Session deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete session" });
  }
};

// Get study session limits for a user
export const getSessionLimits = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySessions = await StudySession.countDocuments({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    const maxSessionsPerDay = user.subscription?.plan === 'free' ? 3 : -1;

    res.status(200).json({
      success: true,
      limits: {
        max: maxSessionsPerDay,
        current: todaySessions,
        remaining: maxSessionsPerDay === -1 ? -1 : maxSessionsPerDay - todaySessions,
        isUnlimited: maxSessionsPerDay === -1,
        plan: user.subscription?.plan || 'free'
      }
    });
  } catch (error) {
    console.error('Error fetching study session limits:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching study session limits',
      error: error.message
    });
  }
};