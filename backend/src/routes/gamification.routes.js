import express from 'express';
import {
    getAvatar,
    updateAvatarAppearance,
    addXP,
    getLeaderboard,
    getAchievements,
    getCampusLocations,
    joinLocation,
    leaveLocation,
    feedPet,
    playWithPet
} from '../controllers/gamification.controller.js';

const router = express.Router();

// Avatar routes
router.get('/avatar/:userId', getAvatar);
router.put('/avatar/:userId/appearance', updateAvatarAppearance);
router.post('/avatar/:userId/xp', addXP);

// Leaderboard routes
router.get('/leaderboard', getLeaderboard);

// Achievement routes
router.get('/achievements', getAchievements);

// Virtual campus routes
router.get('/campus/locations', getCampusLocations);
router.post('/campus/locations/:locationId/join', joinLocation);
router.post('/campus/locations/:locationId/leave', leaveLocation);

// Pet care routes
router.post('/pet/:userId/feed', feedPet);
router.post('/pet/:userId/play', playWithPet);

export default router;
