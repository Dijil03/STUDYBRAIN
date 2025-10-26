import express from 'express';
import {
    addComment,
    getComments,
    updateComment,
    deleteComment,
    resolveComment,
    replyToComment
} from '../controllers/comment.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router();

// All comment routes require authentication
router.use(protectRoutes);

// Comment operations
router.post('/:userId/:documentId', addComment);
router.get('/:userId/:documentId', getComments);
router.put('/:userId/:commentId', updateComment);
router.delete('/:userId/:commentId', deleteComment);
router.patch('/:userId/:commentId/resolve', resolveComment);
router.post('/:userId/:commentId/reply', replyToComment);

export default router;

