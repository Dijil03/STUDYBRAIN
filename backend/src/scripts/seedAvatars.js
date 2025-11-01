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

const sampleAvatars = [
  {
    userId: '69012554e512089119eaa31f', // Replace with actual user ID
    userName: 'TestUser',
    appearance: {
      skinTone: 'medium',
      hairColor: 'brown',
      hairStyle: 'short',
      clothing: 'casual'
    },
    level: 5,
    experience: 2500,
    totalXP: 2500,
    coins: 150,
    skills: {
      mathematics: { level: 3, xp: 800 },
      science: { level: 2, xp: 500 },
      english: { level: 4, xp: 1200 },
      history: { level: 1, xp: 200 },
      art: { level: 2, xp: 400 },
      music: { level: 1, xp: 150 },
      coding: { level: 3, xp: 900 }
    },
    achievements: [
      {
        id: 'first_study_session',
        name: 'First Steps',
        description: 'Completed your first study session',
        icon: '🎯',
        rarity: 'common',
        earnedAt: new Date()
      },
      {
        id: 'math_beginner',
        name: 'Math Explorer',
        description: 'Reached level 3 in Mathematics',
        icon: '📚',
        rarity: 'uncommon',
        earnedAt: new Date()
      }
    ],
    pet: {
      name: 'Sparky',
      type: 'dragon',
      happiness: 85,
      level: 2
    },
    inventory: {
      items: [
        { id: 'basic_pen', name: 'Basic Pen', type: 'tool', quantity: 1 },
        { id: 'notebook', name: 'Study Notebook', type: 'tool', quantity: 3 }
      ],
      gems: 25
    },
    preferences: {
      theme: 'modern',
      notifications: true,
      soundEffects: true
    }
  }
];

const seedAvatars = async () => {
  try {
    await connectDB();

    // Clear existing avatars
    await Avatar.deleteMany({});
    console.log('Cleared existing avatars');

    // Insert sample avatars
    await Avatar.insertMany(sampleAvatars);
    console.log('✅ Avatars seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding avatars:', error);
    process.exit(1);
  }
};

seedAvatars();
