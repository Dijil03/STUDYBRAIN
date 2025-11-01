import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Achievement from '../models/achievement.model.js';
import connectDB from '../db/connection.js';

// Load environment variables
dotenv.config();

const achievements = [
    // Study achievements
    {
        id: 'first_study_session',
        name: 'First Steps',
        description: 'Complete your first study session',
        icon: '🎓',
        category: 'study',
        rarity: 'common',
        requirements: {
            type: 'study_hours',
            value: 0.5
        },
        rewards: {
            xp: 50,
            coins: 10
        }
    },
    {
        id: 'study_streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day study streak',
        icon: '🔥',
        category: 'streak',
        rarity: 'uncommon',
        requirements: {
            type: 'streak',
            value: 7
        },
        rewards: {
            xp: 200,
            coins: 50,
            gems: 5
        }
    },
    {
        id: 'study_streak_30',
        name: 'Month Master',
        description: 'Maintain a 30-day study streak',
        icon: '👑',
        category: 'streak',
        rarity: 'epic',
        requirements: {
            type: 'streak',
            value: 30
        },
        rewards: {
            xp: 1000,
            coins: 200,
            gems: 25,
            title: 'Month Master'
        }
    },
    {
        id: 'math_expert',
        name: 'Math Wizard',
        description: 'Reach level 10 in Mathematics',
        icon: '🧮',
        category: 'academic',
        rarity: 'rare',
        requirements: {
            type: 'level',
            value: 10,
            skill: 'mathematics'
        },
        rewards: {
            xp: 500,
            coins: 100,
            gems: 10,
            title: 'Math Wizard'
        }
    },
    {
        id: 'science_explorer',
        name: 'Science Explorer',
        description: 'Reach level 10 in Science',
        icon: '🔬',
        category: 'academic',
        rarity: 'rare',
        requirements: {
            type: 'level',
            value: 10,
            skill: 'science'
        },
        rewards: {
            xp: 500,
            coins: 100,
            gems: 10,
            title: 'Science Explorer'
        }
    },
    {
        id: 'word_master',
        name: 'Word Master',
        description: 'Reach level 10 in English',
        icon: '📚',
        category: 'academic',
        rarity: 'rare',
        requirements: {
            type: 'level',
            value: 10,
            skill: 'english'
        },
        rewards: {
            xp: 500,
            coins: 100,
            gems: 10,
            title: 'Word Master'
        }
    },
    {
        id: 'history_buff',
        name: 'History Buff',
        description: 'Reach level 10 in History',
        icon: '🏛️',
        category: 'academic',
        rarity: 'rare',
        requirements: {
            type: 'level',
            value: 10,
            skill: 'history'
        },
        rewards: {
            xp: 500,
            coins: 100,
            gems: 10,
            title: 'History Buff'
        }
    },
    {
        id: 'level_5',
        name: 'Rising Star',
        description: 'Reach level 5',
        icon: '⭐',
        category: 'study',
        rarity: 'common',
        requirements: {
            type: 'level',
            value: 5
        },
        rewards: {
            xp: 100,
            coins: 25
        }
    },
    {
        id: 'level_10',
        name: 'Bright Mind',
        description: 'Reach level 10',
        icon: '🌟',
        category: 'study',
        rarity: 'uncommon',
        requirements: {
            type: 'level',
            value: 10
        },
        rewards: {
            xp: 300,
            coins: 75,
            gems: 5
        }
    },
    {
        id: 'level_25',
        name: 'Genius',
        description: 'Reach level 25',
        icon: '🧠',
        category: 'study',
        rarity: 'epic',
        requirements: {
            type: 'level',
            value: 25
        },
        rewards: {
            xp: 1000,
            coins: 250,
            gems: 20,
            title: 'Genius'
        }
    },
    {
        id: 'level_50',
        name: 'Legendary Scholar',
        description: 'Reach level 50',
        icon: '🏆',
        category: 'study',
        rarity: 'legendary',
        requirements: {
            type: 'level',
            value: 50
        },
        rewards: {
            xp: 2500,
            coins: 500,
            gems: 50,
            title: 'Legendary Scholar'
        }
    },
    // Social achievements
    {
        id: 'first_friend',
        name: 'Social Butterfly',
        description: 'Make your first friend',
        icon: '👥',
        category: 'social',
        rarity: 'common',
        requirements: {
            type: 'social',
            value: 1
        },
        rewards: {
            xp: 100,
            coins: 25
        }
    },
    {
        id: 'popular',
        name: 'Popular',
        description: 'Have 10 friends',
        icon: '🌟',
        category: 'social',
        rarity: 'uncommon',
        requirements: {
            type: 'social',
            value: 10
        },
        rewards: {
            xp: 300,
            coins: 75,
            gems: 5
        }
    },
    // Creative achievements
    {
        id: 'artist',
        name: 'Artist',
        description: 'Reach level 5 in Art',
        icon: '🎨',
        category: 'creative',
        rarity: 'uncommon',
        requirements: {
            type: 'level',
            value: 5,
            skill: 'art'
        },
        rewards: {
            xp: 200,
            coins: 50,
            gems: 5
        }
    },
    {
        id: 'musician',
        name: 'Musician',
        description: 'Reach level 5 in Music',
        icon: '🎵',
        category: 'creative',
        rarity: 'uncommon',
        requirements: {
            type: 'level',
            value: 5,
            skill: 'music'
        },
        rewards: {
            xp: 200,
            coins: 50,
            gems: 5
        }
    },
    // Special achievements
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Study before 8 AM',
        icon: '🌅',
        category: 'special',
        rarity: 'rare',
        requirements: {
            type: 'custom',
            value: 'early_study'
        },
        rewards: {
            xp: 150,
            coins: 30,
            gems: 3
        }
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Study after 10 PM',
        icon: '🦉',
        category: 'special',
        rarity: 'rare',
        requirements: {
            type: 'custom',
            value: 'late_study'
        },
        rewards: {
            xp: 150,
            coins: 30,
            gems: 3
        }
    },
    {
        id: 'perfect_week',
        name: 'Perfect Week',
        description: 'Complete all study sessions in a week',
        icon: '💯',
        category: 'special',
        rarity: 'epic',
        requirements: {
            type: 'custom',
            value: 'perfect_week'
        },
        rewards: {
            xp: 500,
            coins: 100,
            gems: 10,
            title: 'Perfectionist'
        }
    }
];

const seedAchievements = async () => {
    try {
        await connectDB();

        // Clear existing achievements
        await Achievement.deleteMany({});

        // Insert new achievements
        for (const achievement of achievements) {
            const newAchievement = new Achievement(achievement);
            await newAchievement.save();
        }

        console.log('✅ Achievements seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding achievements:', error);
        process.exit(1);
    }
};

seedAchievements();
