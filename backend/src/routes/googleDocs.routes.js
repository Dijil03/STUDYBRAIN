import express from 'express';
import { googleDocsController } from '../controllers/googleDocs.controller.js';

const router = express.Router();

// Test Google Docs integration
router.get('/test', googleDocsController.testConnection);

// Get Google access token for user
router.get('/:userId/token', googleDocsController.getAccessToken);

// Create a new Google Doc
router.post('/:userId/documents', googleDocsController.createDocument);

// List user's Google Docs
router.get('/:userId/documents', googleDocsController.listDocuments);

// Get specific document
router.get('/:userId/documents/:documentId', googleDocsController.getDocument);

// Share document
router.post('/:userId/documents/:documentId/share', googleDocsController.shareDocument);

export default router;
