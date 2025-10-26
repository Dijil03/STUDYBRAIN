import express from "express";
import { logSession, getSessions, deleteSession, getSessionLimits } from "../controllers/study.controller.js"
import protect from "../middlewares/protectRoutes.js";

const router = express.Router();

router.post("/:userId", protect, logSession);
router.get("/:userId", protect, getSessions);
router.get("/:userId/limits", protect, getSessionLimits);
router.delete("/:userId/:sessionId", protect, deleteSession);

export default router;