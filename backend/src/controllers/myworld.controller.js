import MyWorld from "../models/myworld.model.js";

// Get full My World data
export const getWorld = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Try to find existing world
    let world = await MyWorld.findOne({ userId: userId });

    // If no world exists, create a default one
    if (!world) {
      try {
        world = new MyWorld({
          userId: userId,
          goals: [],
          progress: {
            homework: 0,
            habits: 0,
            skills: 0
          },
          moodBoard: [],
          achievements: [],
          journal: [],
          soundtrack: [],
          theme: "light",
          motivation: "Keep going, you're doing great! Every step forward is progress."
        });
        await world.save();
        console.log('Created default MyWorld for userId:', userId);
      } catch (createErr) {
        console.error("Error creating default MyWorld:", createErr);
        // If we can't create, return a default object
        return res.status(200).json({
          userId: userId,
          goals: [],
          progress: { homework: 0, habits: 0, skills: 0 },
          moodBoard: [],
          achievements: [],
          journal: [],
          soundtrack: [],
          theme: "light",
          motivation: "Keep going, you're doing great! Every step forward is progress."
        });
      }
    }

    res.status(200).json(world);
  } catch (err) {
    console.error("Error fetching My World:", err);
    // Return a default response instead of 500 to prevent dashboard errors
    res.status(200).json({
      userId: req.params.userId || null,
      goals: [],
      progress: { homework: 0, habits: 0, skills: 0 },
      moodBoard: [],
      achievements: [],
      journal: [],
      soundtrack: [],
      theme: "light",
      motivation: "Keep going, you're doing great! Every step forward is progress."
    });
  }
};

// Update goals
export const updateGoals = async (req, res) => {
  try {
    const updated = await MyWorld.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { goals: req.body.goals } },
      { new: true, upsert: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update goals" });
  }
};

// Update progress
export const updateProgress = async (req, res) => {
  try {
    const updated = await MyWorld.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { progress: req.body.progress } },
      { new: true, upsert: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update progress" });
  }
};

// Add journal entry
export const addJournalEntry = async (req, res) => {
  try {
    const updated = await MyWorld.findOneAndUpdate(
      { userId: req.params.userId },
      { $push: { journal: req.body.entry } },
      { new: true, upsert: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to add journal entry" });
  }
};

// Unlock achievement
export const unlockAchievement = async (req, res) => {
  try {
    const updated = await MyWorld.findOneAndUpdate(
      { userId: req.params.userId },
      { $addToSet: { achievements: req.body.achievement } },
      { new: true, upsert: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to unlock achievement" });
  }
};

// Update mood board
export const updateMoodBoard = async (req, res) => {
  try {
    const updated = await MyWorld.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { moodBoard: req.body.moodBoard } },
      { new: true, upsert: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update mood board" });
  }
};

// Update soundtrack
export const updateSoundtrack = async (req, res) => {
  try {
    const updated = await MyWorld.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { soundtrack: req.body.soundtrack } },
      { new: true, upsert: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update soundtrack" });
  }
};

// Update theme
export const updateTheme = async (req, res) => {
  try {
    const updated = await MyWorld.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { theme: req.body.theme } },
      { new: true, upsert: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update theme" });
  }
};