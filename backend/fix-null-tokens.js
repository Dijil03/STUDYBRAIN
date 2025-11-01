// Script to fix existing null inviteToken values in the database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StudyGroup } from './src/models/studyGroup.model.js';
import crypto from 'crypto';

dotenv.config();

async function fixNullTokens() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all study groups with null inviteToken
    const groupsWithNullTokens = await StudyGroup.find({ 
      inviteToken: null 
    });

    console.log(`Found ${groupsWithNullTokens.length} study groups with null inviteToken`);

    // Generate tokens for each
    for (const group of groupsWithNullTokens) {
      try {
        // Generate a unique token
        const timestamp = Date.now();
        const random1 = crypto.randomBytes(12).toString('hex');
        const random2 = crypto.randomBytes(8).toString('hex');
        const random3 = Math.random().toString(36).substring(2, 15);
        const processId = process.pid.toString(36);
        const microtime = (process.hrtime.bigint() % BigInt(1000000)).toString(36);
        const token = `sg_${timestamp}_${random1}_${random2}_${processId}_${random3}_${microtime}`;

        // Check if token exists
        const existing = await StudyGroup.findOne({ inviteToken: token });
        if (!existing) {
          group.inviteToken = token;
          group.inviteTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          group.inviteTokenEnabled = true;
          await group.save();
          console.log(`Fixed token for group: ${group.name} (ID: ${group._id})`);
        } else {
          console.log(`Token collision for group ${group._id}, skipping...`);
        }
      } catch (error) {
        console.error(`Error fixing token for group ${group._id}:`, error.message);
      }
    }

    console.log('Finished fixing null tokens');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixNullTokens();

