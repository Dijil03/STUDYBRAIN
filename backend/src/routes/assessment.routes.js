import express from "express";
import protect from "../middlewares/protectRoutes.js";
import { createAssessment, listAssessments, getAssessment, submitAssessment } from "../controllers/assessment.controller.js";

const router = express.Router();

router.post("/:userId", protect, createAssessment);
router.get("/:userId", protect, listAssessments);
router.get("/:userId/:assessmentId", protect, getAssessment);
router.post("/:userId/:assessmentId/submit", protect, submitAssessment);

export default router;


