import express from "express";
import { generateFlashcards, getFlashcardSets, saveFlashcards } from "../controllers/flashcard.controller.js";

const router = express.Router();

router.post("/:userId/generate", generateFlashcards);
router.post("/:userId/save", saveFlashcards);
router.get("/:userId/all", getFlashcardSets);

export default router;