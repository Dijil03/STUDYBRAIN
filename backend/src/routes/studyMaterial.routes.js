import express from 'express';
import multer from 'multer';
import {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getTags,
  getSubjects,
  bulkUpdate,
  bulkDelete
} from '../controllers/studyMaterial.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router();

// Configure multer for file uploads (memory storage for now)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  }
});

// All routes are protected
router.get('/:userId', protectRoutes, getMaterials);
router.get('/:userId/tags', protectRoutes, getTags);
router.get('/:userId/subjects', protectRoutes, getSubjects);
router.get('/material/:materialId', protectRoutes, getMaterial);
router.post('/:userId', protectRoutes, createMaterial);
router.put('/:materialId', protectRoutes, updateMaterial);
router.delete('/:materialId', protectRoutes, deleteMaterial);
router.patch('/:userId/bulk-update', protectRoutes, bulkUpdate);
router.delete('/:userId/bulk-delete', protectRoutes, bulkDelete);

export default router;

