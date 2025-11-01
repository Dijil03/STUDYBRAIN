import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['study', 'social', 'creative', 'academic', 'special', 'streak', 'exploration'],
        required: true
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    // Requirements to earn this achievement
    requirements: {
        type: {
            type: String,
            enum: ['xp', 'level', 'streak', 'study_hours', 'subjects', 'social', 'creative', 'custom'],
            required: true
        },
        value: mongoose.Schema.Types.Mixed, // Can be number, array, or object
        skill: String, // For skill-specific achievements
        timeframe: String // e.g., 'daily', 'weekly', 'monthly', 'all_time'
    },
    // Rewards for earning this achievement
    rewards: {
        xp: { type: Number, default: 0 },
        coins: { type: Number, default: 0 },
        gems: { type: Number, default: 0 },
        items: [{
            itemId: String,
            name: String,
            quantity: { type: Number, default: 1 }
        }],
        title: String, // Special title that appears next to name
        badge: String // Special badge icon
    },
    // Display settings
    display: {
        showInProfile: { type: Boolean, default: true },
        showInLeaderboard: { type: Boolean, default: true },
        priority: { type: Number, default: 0 } // Higher number = higher priority
    },
    // Metadata
    isActive: { type: Boolean, default: true },
    isSecret: { type: Boolean, default: false }, // Hidden until earned
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
achievementSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Static methods
achievementSchema.statics.getByCategory = function(category) {
    return this.find({ category, isActive: true }).sort({ priority: -1 });
};

achievementSchema.statics.getAvailable = function() {
    return this.find({ isActive: true, isSecret: false }).sort({ priority: -1 });
};

achievementSchema.statics.getSecret = function() {
    return this.find({ isActive: true, isSecret: true }).sort({ priority: -1 });
};

achievementSchema.statics.checkAchievement = async function(userId, achievementId, currentStats) {
    const achievement = await this.findById(achievementId);
    if (!achievement || !achievement.isActive) return false;

    const { requirements } = achievement;
    
    switch (requirements.type) {
        case 'xp':
            return currentStats.totalXP >= requirements.value;
        case 'level':
            return currentStats.level >= requirements.value;
        case 'streak':
            return currentStats.studyStreak >= requirements.value;
        case 'study_hours':
            return currentStats.totalStudyHours >= requirements.value;
        case 'subjects':
            return currentStats.subjectsStudied >= requirements.value;
        case 'social':
            return currentStats.friendsCount >= requirements.value;
        case 'creative':
            return currentStats.creativeProjects >= requirements.value;
        default:
            return false;
    }
};

export default mongoose.model('Achievement', achievementSchema);
