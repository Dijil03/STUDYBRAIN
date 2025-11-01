import Avatar from '../models/avatar.model.js';
import Achievement from '../models/achievement.model.js';
import VirtualCampus from '../models/virtualCampus.model.js';
import User from '../models/auth.model.js';

// Get or create user avatar
const getAvatar = async (req, res) => {
    try {
        const { userId } = req.params;

        let avatar = await Avatar.findOne({ userId });

        if (!avatar) {
            // Create new avatar for user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            avatar = new Avatar({
                userId,
                userName: user.username || 'Student'
            });
            await avatar.save();
        }

        res.status(200).json({
            success: true,
            data: avatar
        });
    } catch (error) {
        console.error('Error getting avatar:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get avatar',
            error: error.message
        });
    }
};

// Update avatar appearance
const updateAvatarAppearance = async (req, res) => {
    try {
        const { userId } = req.params;
        const { appearance } = req.body;

        const avatar = await Avatar.findOne({ userId });
        if (!avatar) {
            return res.status(404).json({
                success: false,
                message: 'Avatar not found'
            });
        }

        avatar.appearance = { ...avatar.appearance, ...appearance };
        await avatar.save();

        res.status(200).json({
            success: true,
            message: 'Avatar appearance updated',
            data: avatar
        });
    } catch (error) {
        console.error('Error updating avatar appearance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update avatar appearance',
            error: error.message
        });
    }
};

// Add XP to avatar
const addXP = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, skill, source } = req.body;

        const avatar = await Avatar.findOne({ userId });
        if (!avatar) {
            return res.status(404).json({
                success: false,
                message: 'Avatar not found'
            });
        }

        const result = avatar.addXP(amount, skill);
        await avatar.save();

        // Check for new achievements
        const newAchievements = await checkAchievements(userId);

        res.status(200).json({
            success: true,
            message: 'XP added successfully',
            data: {
                leveledUp: result.leveledUp,
                newLevel: result.newLevel,
                oldLevel: result.oldLevel,
                currentXP: avatar.experience,
                totalXP: avatar.totalXP,
                newAchievements
            }
        });
    } catch (error) {
        console.error('Error adding XP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add XP',
            error: error.message
        });
    }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const { type = 'overall', skill, limit = 10 } = req.query;

        let leaderboard;

        if (type === 'skill' && skill) {
            leaderboard = await Avatar.getTopBySkill(skill, parseInt(limit));
        } else {
            leaderboard = await Avatar.getLeaderboard(parseInt(limit));
        }

        res.status(200).json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get leaderboard',
            error: error.message
        });
    }
};

// Get achievements
const getAchievements = async (req, res) => {
    try {
        const { category, type = 'available' } = req.query;

        let achievements;

        if (type === 'secret') {
            achievements = await Achievement.getSecret();
        } else if (category) {
            achievements = await Achievement.getByCategory(category);
        } else {
            achievements = await Achievement.getAvailable();
        }

        res.status(200).json({
            success: true,
            data: achievements
        });
    } catch (error) {
        console.error('Error getting achievements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get achievements',
            error: error.message
        });
    }
};

// Get virtual campus locations
const getCampusLocations = async (req, res) => {
    try {
        const { type, userId } = req.query;

        let locations;

        if (userId) {
            const avatar = await Avatar.findOne({ userId });
            if (avatar) {
                locations = await VirtualCampus.getAvailableForUser(
                    avatar.level,
                    avatar.achievements.map(a => a.id)
                );
            } else {
                locations = await VirtualCampus.find({ accessLevel: 'public' });
            }
        } else if (type) {
            locations = await VirtualCampus.getByType(type);
        } else {
            locations = await VirtualCampus.find().sort({ popularity: -1 });
        }

        res.status(200).json({
            success: true,
            data: locations
        });
    } catch (error) {
        console.error('Error getting campus locations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get campus locations',
            error: error.message
        });
    }
};

// Join a campus location
const joinLocation = async (req, res) => {
    try {
        const { locationId } = req.params;
        const { userId, userName, avatar } = req.body;

        const location = await VirtualCampus.findOne({ id: locationId });
        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        // Check if user can access this location
        const userAvatar = await Avatar.findOne({ userId });
        if (userAvatar && !location.canAccess(userAvatar.level, userAvatar.achievements.map(a => a.id))) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this location'
            });
        }

        // Check capacity
        if (location.currentOccupants.length >= location.capacity) {
            return res.status(400).json({
                success: false,
                message: 'Location is at full capacity'
            });
        }

        const added = location.addOccupant(userId, userName, avatar);
        if (added) {
            await location.save();

            res.status(200).json({
                success: true,
                message: 'Joined location successfully',
                data: {
                    location: location,
                    occupants: location.currentOccupants
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Already in this location'
            });
        }
    } catch (error) {
        console.error('Error joining location:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to join location',
            error: error.message
        });
    }
};

// Leave a campus location
const leaveLocation = async (req, res) => {
    try {
        const { locationId } = req.params;
        const { userId } = req.body;

        const location = await VirtualCampus.findOne({ id: locationId });
        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        const removed = location.removeOccupant(userId);
        if (removed) {
            await location.save();

            res.status(200).json({
                success: true,
                message: 'Left location successfully',
                data: {
                    occupants: location.currentOccupants
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Not in this location'
            });
        }
    } catch (error) {
        console.error('Error leaving location:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to leave location',
            error: error.message
        });
    }
};

// Pet care functions
const feedPet = async (req, res) => {
    try {
        const { userId } = req.params;

        const avatar = await Avatar.findOne({ userId });
        if (!avatar) {
            return res.status(404).json({
                success: false,
                message: 'Avatar not found'
            });
        }

        const fed = avatar.feedPet();
        if (fed) {
            await avatar.save();

            res.status(200).json({
                success: true,
                message: 'Pet fed successfully',
                data: {
                    pet: avatar.pet
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Pet is not hungry'
            });
        }
    } catch (error) {
        console.error('Error feeding pet:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to feed pet',
            error: error.message
        });
    }
};

const playWithPet = async (req, res) => {
    try {
        const { userId } = req.params;

        const avatar = await Avatar.findOne({ userId });
        if (!avatar) {
            return res.status(404).json({
                success: false,
                message: 'Avatar not found'
            });
        }

        const played = avatar.playWithPet();
        if (played) {
            await avatar.save();

            res.status(200).json({
                success: true,
                message: 'Played with pet successfully',
                data: {
                    pet: avatar.pet
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Pet is too tired to play'
            });
        }
    } catch (error) {
        console.error('Error playing with pet:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to play with pet',
            error: error.message
        });
    }
};

// Helper function to check for new achievements
const checkAchievements = async (userId) => {
    try {
        const avatar = await Avatar.findOne({ userId });
        if (!avatar) return [];

        const achievements = await Achievement.find({ isActive: true });
        const newAchievements = [];

        for (const achievement of achievements) {
            const hasAchievement = avatar.achievements.some(a => a.id === achievement.id);
            if (!hasAchievement) {
                const earned = await Achievement.checkAchievement(userId, achievement._id, {
                    totalXP: avatar.totalXP,
                    level: avatar.level,
                    studyStreak: avatar.studyStreak.current,
                    totalStudyHours: avatar.totalXP / 60, // Rough estimate
                    subjectsStudied: Object.keys(avatar.skills).length,
                    friendsCount: avatar.friends.length,
                    creativeProjects: avatar.achievements.filter(a => a.category === 'creative').length
                });

                if (earned) {
                    avatar.addAchievement(achievement);
                    newAchievements.push(achievement);
                }
            }
        }

        if (newAchievements.length > 0) {
            await avatar.save();
        }

        return newAchievements;
    } catch (error) {
        console.error('Error checking achievements:', error);
        return [];
    }
};

export {
    getAvatar,
    updateAvatarAppearance,
    addXP,
    getLeaderboard,
    getAchievements,
    getCampusLocations,
    joinLocation,
    leaveLocation,
    feedPet,
    playWithPet,
    checkAchievements
};
