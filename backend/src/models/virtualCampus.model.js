import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
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
    type: {
        type: String,
        enum: ['classroom', 'library', 'lab', 'cafeteria', 'garden', 'gym', 'art_studio', 'entrance', 'office', 'auditorium'],
        required: true
    },
    // 3D coordinates for positioning
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        z: { type: Number, required: true }
    },
    // Size and boundaries
    size: {
        width: { type: Number, default: 10 },
        height: { type: Number, default: 5 },
        depth: { type: Number, default: 10 }
    },
    // Visual properties
    appearance: {
        color: String,
        texture: String,
        lighting: {
            type: String,
            enum: ['bright', 'dim', 'warm', 'cool'],
            default: 'bright'
        }
    },
    // Interactive elements
    interactiveElements: [{
        id: String,
        type: {
            type: String,
            enum: ['study_spot', 'book_shelf', 'computer', 'whiteboard', 'plant', 'decoration', 'npc']
        },
        position: {
            x: Number,
            y: Number,
            z: Number
        },
        action: String, // What happens when clicked
        description: String
    }],
    // Capacity and rules
    capacity: { type: Number, default: 50 },
    accessLevel: {
        type: String,
        enum: ['public', 'level_required', 'achievement_required', 'private'],
        default: 'public'
    },
    requiredLevel: { type: Number, default: 1 },
    requiredAchievement: String,
    // Activities available in this location
    activities: [{
        id: String,
        name: String,
        description: String,
        type: {
            type: String,
            enum: ['study', 'social', 'creative', 'exercise', 'relaxation']
        },
        xpReward: { type: Number, default: 0 },
        coinReward: { type: Number, default: 0 },
        duration: Number, // in minutes
        requirements: {
            level: { type: Number, default: 1 },
            skills: mongoose.Schema.Types.Mixed
        }
    }],
    // Current occupants
    currentOccupants: [{
        userId: String,
        userName: String,
        avatar: String, // Avatar appearance data
        joinedAt: { type: Date, default: Date.now }
    }],
    // Statistics
    stats: {
        totalVisits: { type: Number, default: 0 },
        averageStayTime: { type: Number, default: 0 },
        popularity: { type: Number, default: 0 }
    },
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
locationSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Methods
locationSchema.methods.addOccupant = function(userId, userName, avatar) {
    const exists = this.currentOccupants.some(occ => occ.userId === userId);
    if (!exists) {
        this.currentOccupants.push({
            userId,
            userName,
            avatar,
            joinedAt: new Date()
        });
        this.stats.totalVisits += 1;
        return true;
    }
    return false;
};

locationSchema.methods.removeOccupant = function(userId) {
    const index = this.currentOccupants.findIndex(occ => occ.userId === userId);
    if (index !== -1) {
        this.currentOccupants.splice(index, 1);
        return true;
    }
    return false;
};

locationSchema.methods.canAccess = function(userLevel, userAchievements) {
    if (this.accessLevel === 'public') return true;
    if (this.accessLevel === 'level_required') return userLevel >= this.requiredLevel;
    if (this.accessLevel === 'achievement_required') {
        return userAchievements.includes(this.requiredAchievement);
    }
    return false;
};

// Static methods
locationSchema.statics.getByType = function(type) {
    return this.find({ type }).sort({ popularity: -1 });
};

locationSchema.statics.getPopular = function(limit = 10) {
    return this.find().sort({ popularity: -1 }).limit(limit);
};

locationSchema.statics.getAvailableForUser = function(userLevel, userAchievements) {
    return this.find({
        $or: [
            { accessLevel: 'public' },
            { accessLevel: 'level_required', requiredLevel: { $lte: userLevel } },
            { accessLevel: 'achievement_required', requiredAchievement: { $in: userAchievements } }
        ]
    }).sort({ popularity: -1 });
};

export default mongoose.model('VirtualCampus', locationSchema);
