import express from 'express';
import {
    saveVersion,
    getVersions,
    restoreVersion,
    compareVersions
} from '../controllers/version.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router();

// All version routes require authentication
router.use(protectRoutes);

// Version operations
router.post('/:userId/:documentId', saveVersion);
router.get('/:userId/:documentId', getVersions);
router.post('/:userId/:documentId/:versionId/restore', restoreVersion);
router.get('/:userId/:documentId/compare', compareVersions);

export default router;

