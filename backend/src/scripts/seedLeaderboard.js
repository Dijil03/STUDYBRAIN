import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Avatar from '../models/avatar.model.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const leaderboardAvatars = [
    {
        userId: 'user1',
        userName: 'Alex Johnson',
        appearance: {
            skinTone: 'light',
            hairColor: 'blonde',
            hairStyle: 'short',
            clothing: 'academic'
        },
        level: 15,
        experience: 8500,
        totalXP: 8500,
        coins: 450,
        skills: {
            mathematics: { level: 8, xp: 3200 },
            science: { level: 6, xp: 2100 },
            english: { level: 7, xp: 2800 },
            history: { level: 4, xp: 1200 },
            art: { level: 3, xp: 800 },
            music: { level: 2, xp: 500 },
            coding: { level: 9, xp: 3600 }
        },
        achievements: [
            {
                id: 'math_master',
                name: 'Math Master',
                description: 'Reached level 8 in Mathematics',
                icon: '🧮',
                rarity: 'rare',
                earnedAt: new Date()
            },
            {
                id: 'coding_wizard',
                name: 'Coding Wizard',
                description: 'Reached level 9 in Coding',
                icon: '💻',
                rarity: 'epic',
                earnedAt: new Date()
            }
        ],
        pet: {
            name: 'Codey',
            type: 'robot',
            happiness: 95,
            level: 5
        }
    },
    {
        userId: 'user2',
        userName: 'Sarah Chen',
        appearance: {
            skinTone: 'medium',
            hairColor: 'black',
            hairStyle: 'long',
            clothing: 'creative'
        },
        level: 12,
        experience: 6800,
        totalXP: 6800,
        coins: 320,
        skills: {
            mathematics: { level: 5, xp: 1800 },
            science: { level: 8, xp: 3200 },
            english: { level: 6, xp: 2200 },
            history: { level: 7, xp: 2600 },
            art: { level: 9, xp: 3800 },
            music: { level: 6, xp: 2100 },
            coding: { level: 4, xp: 1400 }
        },
        achievements: [
            {
                id: 'art_genius',
                name: 'Art Genius',
                description: 'Reached level 9 in Art',
                icon: '🎨',
                rarity: 'epic',
                earnedAt: new Date()
            },
            {
                id: 'science_explorer',
                name: 'Science Explorer',
                description: 'Reached level 8 in Science',
                icon: '🔬',
                rarity: 'rare',
                earnedAt: new Date()
            }
        ],
        pet: {
            name: 'Palette',
            type: 'unicorn',
            happiness: 90,
            level: 4
        }
    },
    {
        userId: 'user3',
        userName: 'Mike Rodriguez',
        appearance: {
            skinTone: 'dark',
            hairColor: 'brown',
            hairStyle: 'curly',
            clothing: 'sporty'
        },
        level: 18,
        experience: 12000,
        totalXP: 12000,
        coins: 680,
        skills: {
            mathematics: { level: 10, xp: 4500 },
            science: { level: 9, xp: 4000 },
            english: { level: 8, xp: 3500 },
            history: { level: 6, xp: 2200 },
            art: { level: 4, xp: 1200 },
            music: { level: 7, xp: 2800 },
            coding: { level: 11, xp: 5000 }
        },
        achievements: [
            {
                id: 'math_legend',
                name: 'Math Legend',
                description: 'Reached level 10 in Mathematics',
                icon: '🏆',
                rarity: 'legendary',
                earnedAt: new Date()
            },
            {
                id: 'coding_master',
                name: 'Coding Master',
                description: 'Reached level 11 in Coding',
                icon: '👑',
                rarity: 'legendary',
                earnedAt: new Date()
            }
        ],
        pet: {
            name: 'Thunder',
            type: 'dragon',
            happiness: 100,
            level: 8
        }
    },
    {
        userId: 'user4',
        userName: 'Emma Wilson',
        appearance: {
            skinTone: 'light',
            hairColor: 'red',
            hairStyle: 'wavy',
            clothing: 'formal'
        },
        level: 9,
        experience: 4200,
        totalXP: 4200,
        coins: 180,
        skills: {
            mathematics: { level: 4, xp: 1200 },
            science: { level: 5, xp: 1500 },
            english: { level: 8, xp: 3200 },
            history: { level: 6, xp: 2000 },
            art: { level: 3, xp: 800 },
            music: { level: 7, xp: 2600 },
            coding: { level: 2, xp: 400 }
        },
        achievements: [
            {
                id: 'english_scholar',
                name: 'English Scholar',
                description: 'Reached level 8 in English',
                icon: '📖',
                rarity: 'rare',
                earnedAt: new Date()
            },
            {
                id: 'music_lover',
                name: 'Music Lover',
                description: 'Reached level 7 in Music',
                icon: '🎵',
                rarity: 'uncommon',
                earnedAt: new Date()
            }
        ],
        pet: {
            name: 'Melody',
            type: 'phoenix',
            happiness: 88,
            level: 3
        }
    },
    {
        userId: 'user5',
        userName: 'David Kim',
        appearance: {
            skinTone: 'medium',
            hairColor: 'black',
            hairStyle: 'short',
            clothing: 'casual'
        },
        level: 6,
        experience: 2800,
        totalXP: 2800,
        coins: 120,
        skills: {
            mathematics: { level: 3, xp: 800 },
            science: { level: 4, xp: 1000 },
            english: { level: 3, xp: 700 },
            history: { level: 5, xp: 1500 },
            art: { level: 2, xp: 400 },
            music: { level: 3, xp: 600 },
            coding: { level: 5, xp: 1800 }
        },
        achievements: [
            {
                id: 'history_buff',
                name: 'History Buff',
                description: 'Reached level 5 in History',
                icon: '🏛️',
                rarity: 'uncommon',
                earnedAt: new Date()
            },
            {
                id: 'coding_beginner',
                name: 'Coding Beginner',
                description: 'Reached level 5 in Coding',
                icon: '💻',
                rarity: 'common',
                earnedAt: new Date()
            }
        ],
        pet: {
            name: 'Wise',
            type: 'owl',
            happiness: 75,
            level: 2
        }
    }
];

const seedLeaderboard = async () => {
    try {
        await connectDB();

        // Clear existing avatars except the main test user
        await Avatar.deleteMany({ userId: { $ne: '69012554e512089119eaa31f' } });
        console.log('Cleared existing leaderboard avatars');

        // Insert leaderboard avatars
        await Avatar.insertMany(leaderboardAvatars);
        console.log('✅ Leaderboard avatars seeded successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding leaderboard:', error);
        process.exit(1);
    }
};

seedLeaderboard();

