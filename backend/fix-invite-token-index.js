const mongoose = require('mongoose');
require('dotenv').config();

async function fixInviteTokenIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('studygroups');

    // Get existing indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Try to drop the problematic inviteToken index if it exists
    try {
      await collection.dropIndex({ inviteToken: 1 });
      console.log('Dropped existing inviteToken index');
    } catch (error) {
      console.log('No existing inviteToken index to drop (this is fine)');
    }

    // Also try to drop by index name if it exists
    try {
      await collection.dropIndex('inviteToken_1');
      console.log('Dropped inviteToken_1 index');
    } catch (error) {
      console.log('No inviteToken_1 index to drop (this is fine)');
    }

    // Clear any existing null or duplicate invite tokens
    const result = await collection.updateMany(
      { inviteToken: { $in: [null, ''] } },
      { $unset: { inviteToken: 1 } }
    );
    console.log(`Cleared ${result.modifiedCount} null/empty invite tokens`);

    // Find and fix any duplicate invite tokens
    const duplicates = await collection.aggregate([
      { $match: { inviteToken: { $ne: null, $ne: '' } } },
      { $group: { _id: '$inviteToken', count: { $sum: 1 }, docs: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate invite tokens, fixing...`);
      
      for (const duplicate of duplicates) {
        // Keep the first document, clear the invite token from the rest
        const docsToFix = duplicate.docs.slice(1);
        await collection.updateMany(
          { _id: { $in: docsToFix } },
          { $unset: { inviteToken: 1 } }
        );
        console.log(`Fixed duplicate token ${duplicate._id} for ${docsToFix.length} documents`);
      }
    }

    // Create the proper sparse unique index
    await collection.createIndex(
      { inviteToken: 1 }, 
      { 
        unique: true, 
        sparse: true,
        name: 'inviteToken_unique_sparse'
      }
    );
    console.log('Created new sparse unique index for inviteToken');

    // Verify the new indexes
    const newIndexes = await collection.indexes();
    console.log('Updated indexes:', newIndexes.map(idx => ({ name: idx.name, key: idx.key, unique: idx.unique, sparse: idx.sparse })));

    console.log('✅ Database fix completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing database:', error);
    process.exit(1);
  }
}

fixInviteTokenIndex();


