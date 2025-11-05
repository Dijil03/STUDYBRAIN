import express from 'express';
import { googleCalendarController } from '../controllers/googleCalendar.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Test Google Calendar integration
router.get('/test', googleCalendarController.testConnection);

// Get user's Google Calendar events
router.get('/:userId/events', authMiddleware, googleCalendarController.getEvents);

// Create a new event in Google Calendar
router.post('/:userId/events', authMiddleware, googleCalendarController.createEvent);

// Update an existing event
router.put('/:userId/events/:eventId', authMiddleware, googleCalendarController.updateEvent);

// Delete an event
router.delete('/:userId/events/:eventId', authMiddleware, googleCalendarController.deleteEvent);

// Sync homework to Google Calendar
router.post('/:userId/sync/homework', authMiddleware, googleCalendarController.syncHomeworkToCalendar);

// Sync exam to Google Calendar
router.post('/:userId/sync/exam', authMiddleware, googleCalendarController.syncExamToCalendar);

// Get all calendar events (Google Calendar + synced homework/exams)
router.get('/:userId/all-events', authMiddleware, googleCalendarController.getAllEvents);

export default router;

