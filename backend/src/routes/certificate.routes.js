import express from 'express';
import {
    getUserCertificates,
    getCertificate,
    verifyCertificate,
    getCertificateStats,
    revokeCertificate,
    getCertificateForPDF
} from '../controllers/certificate.controller.js';
import { downloadCertificatePDF } from '../services/certificateService.js';

const router = express.Router();

// Get all certificates for a user
// GET /api/certificates/:userId
router.get('/:userId', getUserCertificates);

// Get certificate statistics for user  
// GET /api/certificates/:userId/stats
router.get('/:userId/stats', getCertificateStats);

// Get specific certificate by ID
// GET /api/certificates/:userId/:certId
router.get('/:userId/:certId', getCertificate);

// Get certificate data for PDF generation
// GET /api/certificates/:userId/:certId/pdf-data
router.get('/:userId/:certId/pdf-data', getCertificateForPDF);

// Download certificate as PDF
// GET /api/certificates/:userId/:certId/pdf
router.get('/:userId/:certId/pdf', downloadCertificatePDF);

// Revoke certificate (admin function)
// DELETE /api/certificates/:userId/:certId
router.delete('/:userId/:certId', revokeCertificate);

// Public certificate verification (no auth required)
// GET /api/certificates/verify/:certId
router.get('/verify/:certId', verifyCertificate);

export default router;
