import express from 'express';
import {
  sendWelcomeEmail,
  sendSubscriptionEmail,
  sendCancellationEmail,
  sendPasswordResetEmail,
  testEmail
} from '../controllers/email.controller.js';

const router = express.Router();

// Email routes
router.post('/welcome', sendWelcomeEmail);
router.post('/subscription', sendSubscriptionEmail);
router.post('/cancellation', sendCancellationEmail);
router.post('/password-reset', sendPasswordResetEmail);
router.post('/test', testEmail);

export default router;
