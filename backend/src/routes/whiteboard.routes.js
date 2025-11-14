import express from 'express';
import {
  createWhiteboard,
  getWhiteboards,
  getWhiteboardById,
  saveWhiteboardCanvas,
  updateWhiteboardMeta,
  deleteWhiteboard,
  getAvailableCollaborators,
  inviteCollaborator,
  respondToInvite,
  getUserInvites,
} from '../controllers/whiteboard.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router();

router.use(protectRoutes);

router.get('/user/:userId/collaborators', getAvailableCollaborators);
router.get('/user/:userId/invites', getUserInvites);

router.post('/:userId', createWhiteboard);
router.get('/:userId', getWhiteboards);
router.get('/:userId/:whiteboardId', getWhiteboardById);
router.put('/:userId/:whiteboardId', updateWhiteboardMeta);
router.put('/:userId/:whiteboardId/canvas', saveWhiteboardCanvas);
router.post('/:userId/:whiteboardId/invite', inviteCollaborator);
router.post('/:userId/:whiteboardId/respond', respondToInvite);
router.delete('/:userId/:whiteboardId', deleteWhiteboard);

export default router;

