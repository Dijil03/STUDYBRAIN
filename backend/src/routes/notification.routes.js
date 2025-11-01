import express from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  acceptNotification,
  declineNotification,
  deleteNotification,
  createTestNotification
} from '../controllers/notification.controller.js';

const router = express.Router();

// Get all notifications for a user
router.get('/', getUserNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark all notifications as read
router.post('/mark-all-read', markAllAsRead);

// Mark specific notification as read
router.post('/:notificationId/read', markAsRead);

// Accept invitation/request
router.post('/:notificationId/accept', acceptNotification);

// Decline invitation/request
router.post('/:notificationId/decline', declineNotification);

// Delete notification
router.delete('/:notificationId', deleteNotification);

// Test endpoint - create a dummy notification for debugging
router.post('/test', createTestNotification);

export default router;
