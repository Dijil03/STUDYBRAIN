import express from 'express';
import {
  createWhiteboard,
  getWhiteboards,
  getWhiteboardById,
  saveWhiteboardCanvas,
  updateWhiteboardMeta,
  deleteWhiteboard,
} from '../controllers/whiteboard.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router();

router.use(protectRoutes);

router.post('/:userId', createWhiteboard);
router.get('/:userId', getWhiteboards);
router.get('/:userId/:whiteboardId', getWhiteboardById);
router.put('/:userId/:whiteboardId', updateWhiteboardMeta);
router.put('/:userId/:whiteboardId/canvas', saveWhiteboardCanvas);
router.delete('/:userId/:whiteboardId', deleteWhiteboard);

export default router;

