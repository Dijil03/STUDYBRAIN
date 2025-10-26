import express from 'express';
import { googleClassroomController } from '../controllers/googleClassroom.controller.js';

const router = express.Router();

// Test Google Classroom integration
router.get('/test', googleClassroomController.testConnection);

// Get user's Google Classroom courses
router.get('/:userId/courses', googleClassroomController.getCourses);

// Get assignments from a specific course
router.get('/:userId/courses/:courseId/assignments', googleClassroomController.getCourseAssignments);

// Get all assignments across all courses
router.get('/:userId/assignments', googleClassroomController.getAllAssignments);

// Sync assignments to homework tasks
router.post('/:userId/sync-assignments', googleClassroomController.syncAssignmentsToHomework);

export default router;
