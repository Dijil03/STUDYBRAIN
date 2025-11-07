import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { gardenController } from '../controllers/garden.controller.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/:userId/overview', gardenController.overview);
router.post('/:userId/session/start', gardenController.startSession);
router.post('/:userId/session/complete', gardenController.completeSession);
router.post('/:userId/session/abort', gardenController.abortSession);
router.post('/:userId/shop/purchase', gardenController.purchase);

export default router;

