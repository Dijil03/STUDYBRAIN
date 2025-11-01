import express from 'express';
import {
  getAllUsers,
  getUserById,
  searchUsers
} from '../controllers/user.controller.js';

const router = express.Router();

// Get all users (for invitation selection)
router.get('/', getAllUsers);

// Search users
router.get('/search', searchUsers);

// Get user by ID
router.get('/:userId', getUserById);

export default router;
