import express from "express";
import {
  createHomework,
  getHomework,
  markCompleted,
  updateHomework,
  deleteHomework,
  getHomeworkChartData,
  getHomeworkProgress
} from "../controllers/homework.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:userId", authMiddleware, createHomework);
router.get("/:userId", authMiddleware, getHomework);
router.patch("/:userId/:taskId/complete", authMiddleware, markCompleted);
router.put("/:userId/:taskId", authMiddleware, updateHomework);
router.delete("/:userId/:taskId", authMiddleware, deleteHomework);
router.get("/chart/:userId", authMiddleware, getHomeworkChartData);
router.get("/progress/:userId", authMiddleware, getHomeworkProgress);



export default router;