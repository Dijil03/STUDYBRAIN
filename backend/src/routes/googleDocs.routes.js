import express from 'express';
import { googleDocsController } from '../controllers/googleDocs.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router();

// Test Google Docs integration (public endpoint for testing)
router.get('/test', googleDocsController.testConnection);

// All other routes require authentication
// Get Google access token for user
router.get('/:userId/token', protectRoutes, googleDocsController.getAccessToken);

// Create a new Google Doc
router.post('/:userId/documents', protectRoutes, googleDocsController.createDocument);

// List user's Google Docs
router.get('/:userId/documents', protectRoutes, googleDocsController.listDocuments);

// Get specific document
router.get('/:userId/documents/:documentId', protectRoutes, googleDocsController.getDocument);

// Share document
router.post('/:userId/documents/:documentId/share', protectRoutes, googleDocsController.shareDocument);

export default router;
