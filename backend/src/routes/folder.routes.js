import express from 'express';
import {
    createFolder,
    getFolders,
    updateFolder,
    deleteFolder,
    moveFolder
} from '../controllers/folder.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router();

// All folder routes require authentication
router.use(protectRoutes);

// Folder CRUD operations
router.post('/:userId', createFolder);
router.get('/:userId', getFolders);
router.put('/:userId/:folderId', updateFolder);
router.delete('/:userId/:folderId', deleteFolder);
router.patch('/:userId/:folderId/move', moveFolder);

export default router;

