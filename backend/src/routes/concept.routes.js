import express from 'express';
import { conceptController } from '../controllers/concept.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/:userId/map', conceptController.getConceptMap);
router.get('/:userId/recommendations', conceptController.getRecommendations);
router.post('/:userId/upsert', conceptController.upsertConcept);
router.post('/:userId/activity', conceptController.recordActivity);
router.post('/:userId/mark-mastered', conceptController.markMastered);
router.post('/:userId/sync/revisions', conceptController.syncFromRevisions);

export default router;

