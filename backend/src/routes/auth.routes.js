import express from 'express';
import { signup, login, logout, updateAvatar, getUserProfile, googleAuth, googleDocsAuth, googleClassroomAuth, googleCallback, googleAuthSuccess, googleAuthFailure, debugUserSubscription, uploadAvatar, updateAvatarId, upload } from '../controllers/auth.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router();

// Regular auth routes (for fallback if needed)
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protectRoutes, logout);

// Avatar routes (still useful for Clerk users)
router.get('/profile/:userId', protectRoutes, getUserProfile);
router.put('/avatar/:userId', protectRoutes, updateAvatar);

// New avatar upload and update routes
router.post('/upload-avatar', protectRoutes, upload.single('avatar'), uploadAvatar);
router.post('/update-avatar', protectRoutes, updateAvatarId);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Google Docs authorization (separate from login)
router.get('/google-docs', googleDocsAuth);

// Google Classroom authorization (separate from login)
router.get('/google-classroom', googleClassroomAuth);

router.get('/google/success', protectRoutes, googleAuthSuccess);
router.get('/google/failure', googleAuthFailure);

// Debug route
router.get('/debug/:userId', debugUserSubscription);

export default router;

