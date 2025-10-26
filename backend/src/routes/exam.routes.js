import express from "express";
import {
  createExam,
  getExams,
  logStudySession,
} from "../controllers/exam.controller.js";

const router = express.Router();

router.post("/:userId", createExam);
router.get("/:userId", getExams);
router.post("/:userId/:examId/log", logStudySession);

export default router;