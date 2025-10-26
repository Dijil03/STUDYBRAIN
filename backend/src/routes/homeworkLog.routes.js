import express from "express";
import {
  upsertWeeklyLog,
  getWeeklyLog,
  getWeeklyProgress,
  markTaskCompleted,
  debugHomeworkLog,
} from "../controllers/homeworkLog.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:userId", authMiddleware, upsertWeeklyLog);
router.get("/:userId", authMiddleware, getWeeklyLog);
router.get("/:userId/progress", authMiddleware, getWeeklyProgress);
router.post("/:userId/complete", authMiddleware, markTaskCompleted);
router.get("/:userId/debug", authMiddleware, debugHomeworkLog);

export default router;