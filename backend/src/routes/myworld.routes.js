import express from "express";
import {
  getWorld,
  updateGoals,
  updateProgress,
  addJournalEntry,
  unlockAchievement,
  updateMoodBoard,
  updateSoundtrack,
  updateTheme,
} from "../controllers/myworld.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:userId", authMiddleware, getWorld);
router.post("/:userId/goals", authMiddleware, updateGoals);
router.post("/:userId/progress", authMiddleware, updateProgress);
router.post("/:userId/journal", authMiddleware, addJournalEntry);
router.post("/:userId/achievements", authMiddleware, unlockAchievement);
router.post("/:userId/moodboard", authMiddleware, updateMoodBoard);
router.post("/:userId/soundtrack", authMiddleware, updateSoundtrack);
router.post("/:userId/theme", authMiddleware, updateTheme);

export default router;