import express from "express";
import protect from "../middlewares/protectRoutes.js";
import { listCatalog, getUserBadges, computeAndAwardBadges } from "../controllers/badges.controller.js";

const router = express.Router();

// Public: catalog can be shown without auth if desired; keep protected for consistency
router.get("/catalog", protect, listCatalog);

// Get earned badges for a user
router.get("/:userId", protect, getUserBadges);

// Compute and award new badges based on homework completion
router.post("/:userId/compute", protect, computeAndAwardBadges);

export default router;


