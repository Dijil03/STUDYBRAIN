import express from 'express';
import {
    createDocument,
    getDocument,
    getDocuments,
    updateDocument,
    deleteDocument,
    shareDocument,
    moveDocument,
    duplicateDocument,
    getDocumentCount
} from '../controllers/document.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router();

// All document routes require authentication
router.use(protectRoutes);

// Document CRUD operations
router.post('/:userId', createDocument);
router.get('/:userId/:documentId', getDocument);
router.get('/:userId', getDocuments);
router.put('/:userId/:documentId', updateDocument);
router.delete('/:userId/:documentId', deleteDocument);

// Document sharing and collaboration
router.patch('/:userId/:documentId/share', shareDocument);
router.patch('/:userId/:documentId/move', moveDocument);
router.post('/:userId/:documentId/duplicate', duplicateDocument);

// Document count for feature gating
router.get('/count', getDocumentCount);

// Test endpoint to check database connection
router.get('/test', async (req, res) => {
    try {
        console.log('🧪 Testing database connection...');
        const Document = (await import('../models/document.model.js')).default;
        const count = await Document.countDocuments();
        console.log('✅ Database connection successful. Document count:', count);
        res.json({
            success: true,
            message: 'Database connection successful',
            documentCount: count
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

export default router;

