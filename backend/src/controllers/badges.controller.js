import Homework from "../models/homework.model.js";
import MyWorld from "../models/myworld.model.js";

// Static catalog of badges
const BADGE_CATALOG = [
  { id: "starter", title: "Getting Started", description: "Complete your first task", threshold: 1 },
  { id: "focused", title: "Staying Focused", description: "Complete 5 tasks", threshold: 5 },
  { id: "persistent", title: "Persistent Learner", description: "Complete 10 tasks", threshold: 10 },
  { id: "grit", title: "Grit Champion", description: "Complete 25 tasks", threshold: 25 },
  { id: "marathon", title: "Study Marathon", description: "Complete 50 tasks", threshold: 50 }
];

export const listCatalog = async (_req, res) => {
  res.status(200).json(BADGE_CATALOG);
};

export const getUserBadges = async (req, res) => {
  try {
    const userId = req.params.userId;
    let world = await MyWorld.findOne({ userId });
    if (!world) {
      world = new MyWorld({ userId, goals: [], journal: [], achievements: [], moodBoard: [], soundtrack: [], theme: "light" });
      await world.save();
    }

    const earnedTitles = (world.achievements || []).map((a) => (typeof a === "string" ? a : a.title)).filter(Boolean);
    const earned = BADGE_CATALOG.filter((b) => earnedTitles.includes(b.title));
    res.status(200).json({ earned });
  } catch (err) {
    console.error("Error fetching user badges:", err);
    res.status(500).json({ error: "Failed to fetch user badges" });
  }
};

export const computeAndAwardBadges = async (req, res) => {
  try {
    const userId = req.params.userId;
    const completedCount = await Homework.countDocuments({ userId, completed: true });

    let world = await MyWorld.findOne({ userId });
    if (!world) {
      world = new MyWorld({ userId, goals: [], journal: [], achievements: [], moodBoard: [], soundtrack: [], theme: "light" });
    }

    const existingTitles = new Set((world.achievements || []).map((a) => (typeof a === "string" ? a : a.title)).filter(Boolean));

    const newlyEarned = [];
    BADGE_CATALOG.forEach((badge) => {
      if (completedCount >= badge.threshold && !existingTitles.has(badge.title)) {
        newlyEarned.push(badge.title);
      }
    });

    if (newlyEarned.length > 0) {
      const updatedAchievements = [
        ...(world.achievements || []),
        ...newlyEarned.map((title) => ({ title, unlocked: true }))
      ];
      world.achievements = updatedAchievements;
      await world.save();
    }

    const earned = BADGE_CATALOG.filter((b) => (world.achievements || []).some((a) => (a.title || a) === b.title));
    res.status(200).json({ completedCount, earned, newlyEarned });
  } catch (err) {
    console.error("Error computing badges:", err);
    res.status(500).json({ error: "Failed to compute badges" });
  }
};


