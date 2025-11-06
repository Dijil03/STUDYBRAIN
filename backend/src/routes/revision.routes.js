import express from 'express';
import { revisionController } from '../controllers/revision.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create a new revision item
router.post('/:userId/revisions', revisionController.createRevision);

// Get all revisions for a user
router.get('/:userId/revisions', revisionController.getRevisions);

// Get revision statistics
router.get('/:userId/revisions/statistics', revisionController.getStatistics);

// Get items due for review
router.get('/:userId/revisions/due', revisionController.getDueItems);

// Review an item (update based on performance)
router.post('/:userId/revisions/:revisionId/review', revisionController.reviewItem);

// Update a revision item
router.put('/:userId/revisions/:revisionId', revisionController.updateRevision);

// Delete a revision item
router.delete('/:userId/revisions/:revisionId', revisionController.deleteRevision);

// Sync all revisions to calendar
router.post('/:userId/revisions/sync-calendar', revisionController.syncAllToCalendar);

export default router;

