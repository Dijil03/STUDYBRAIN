import mongoose from 'mongoose';

const avatarSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    userName: {
        type: String,
        required: true
    },
    // Avatar appearance
    appearance: {
        skinTone: {
            type: String,
            enum: ['light', 'medium', 'dark', 'tan'],
            default: 'medium'
        },
        hairColor: {
            type: String,
            enum: ['black', 'brown', 'blonde', 'red', 'gray', 'white', 'blue', 'green', 'purple'],
            default: 'brown'
        },
        hairStyle: {
            type: String,
            enum: ['short', 'long', 'curly', 'straight', 'wavy', 'bald', 'mohawk', 'ponytail'],
            default: 'short'
        },
        eyeColor: {
            type: String,
            enum: ['brown', 'blue', 'green', 'hazel', 'gray', 'amber'],
            default: 'brown'
        },
        clothing: {
            type: String,
            enum: ['casual', 'formal', 'sporty', 'academic', 'creative'],
            default: 'casual'
        },
        accessories: [{
            type: String,
            enum: ['glasses', 'hat', 'watch', 'necklace', 'earrings', 'backpack']
        }]
    },
    // Avatar stats and progression
    level: {
        type: Number,
        default: 1
    },
    experience: {
        type: Number,
        default: 0
    },
    totalXP: {
        type: Number,
        default: 0
    },
    // Skills and specializations
    skills: {
        mathematics: { 
            level: { type: Number, default: 0 },
            xp: { type: Number, default: 0 }
        },
        science: { 
            level: { type: Number, default: 0 },
            xp: { type: Number, default: 0 }
        },
        english: { 
            level: { type: Number, default: 0 },
            xp: { type: Number, default: 0 }
        },
        history: { 
            level: { type: Number, default: 0 },
            xp: { type: Number, default: 0 }
        },
        art: { 
            level: { type: Number, default: 0 },
            xp: { type: Number, default: 0 }
        },
        music: { 
            level: { type: Number, default: 0 },
            xp: { type: Number, default: 0 }
        },
        coding: { 
            level: { type: Number, default: 0 },
            xp: { type: Number, default: 0 }
        },
        languages: { 
            level: { type: Number, default: 0 },
            xp: { type: Number, default: 0 }
        }
    },
    // Achievements and badges
    achievements: [{
        id: String,
        name: String,
        description: String,
        icon: String,
        earnedAt: Date,
        category: {
            type: String,
            enum: ['study', 'social', 'creative', 'academic', 'special']
        }
    }],
    // Virtual campus position and status
    campusPosition: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 },
        currentLocation: {
            type: String,
            enum: ['entrance', 'library', 'classroom', 'lab', 'cafeteria', 'garden', 'gym', 'art_studio'],
            default: 'entrance'
        }
    },
    // Virtual pet
    pet: {
        name: String,
        type: {
            type: String,
            enum: ['dragon', 'phoenix', 'unicorn', 'robot', 'cat', 'dog', 'owl'],
            default: 'dragon'
        },
        level: { type: Number, default: 1 },
        happiness: { type: Number, default: 50, min: 0, max: 100 },
        hunger: { type: Number, default: 50, min: 0, max: 100 },
        energy: { type: Number, default: 50, min: 0, max: 100 },
        lastFed: Date,
        lastPlayed: Date
    },
    // Social features
    friends: [{
        userId: String,
        userName: String,
        status: {
            type: String,
            enum: ['pending', 'accepted', 'blocked'],
            default: 'pending'
        },
        addedAt: { type: Date, default: Date.now }
    }],
    // Study streaks and habits
    studyStreak: {
        current: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        lastStudyDate: Date
    },
    // Virtual currency and items
    coins: {
        type: Number,
        default: 100
    },
    gems: {
        type: Number,
        default: 10
    },
    inventory: [{
        itemId: String,
        name: String,
        type: {
            type: String,
            enum: ['clothing', 'accessory', 'pet_food', 'decoration', 'tool', 'special']
        },
        rarity: {
            type: String,
            enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
            default: 'common'
        },
        quantity: { type: Number, default: 1 },
        purchasedAt: { type: Date, default: Date.now }
    }],
    // Preferences and settings
    preferences: {
        showOnlineStatus: { type: Boolean, default: true },
        allowFriendRequests: { type: Boolean, default: true },
        notificationSettings: {
            achievements: { type: Boolean, default: true },
            friendRequests: { type: Boolean, default: true },
            levelUps: { type: Boolean, default: true },
            petCare: { type: Boolean, default: true }
        }
    },
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
avatarSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Methods
avatarSchema.methods.addXP = function(amount, skill = null) {
    this.experience += amount;
    this.totalXP += amount;
    
    // Add XP to specific skill if provided
    if (skill && this.skills[skill]) {
        this.skills[skill].xp += amount;
        this.skills[skill].level = Math.floor(this.skills[skill].xp / 100);
    }
    
    // Check for level up
    const newLevel = Math.floor(this.experience / 1000) + 1;
    if (newLevel > this.level) {
        this.level = newLevel;
        return { leveledUp: true, newLevel, oldLevel: this.level - 1 };
    }
    
    return { leveledUp: false };
};

avatarSchema.methods.addAchievement = function(achievement) {
    const exists = this.achievements.some(a => a.id === achievement.id);
    if (!exists) {
        this.achievements.push({
            ...achievement,
            earnedAt: new Date()
        });
        return true;
    }
    return false;
};

avatarSchema.methods.feedPet = function() {
    if (this.pet.hunger < 100) {
        this.pet.hunger = Math.min(100, this.pet.hunger + 20);
        this.pet.happiness = Math.min(100, this.pet.happiness + 10);
        this.pet.lastFed = new Date();
        return true;
    }
    return false;
};

avatarSchema.methods.playWithPet = function() {
    if (this.pet.energy > 0) {
        this.pet.happiness = Math.min(100, this.pet.happiness + 15);
        this.pet.energy = Math.max(0, this.pet.energy - 10);
        this.pet.lastPlayed = new Date();
        return true;
    }
    return false;
};

// Static methods
avatarSchema.statics.getLeaderboard = function(limit = 10) {
    return this.find()
        .sort({ totalXP: -1 })
        .limit(limit)
        .select('userName level totalXP achievements.length');
};

avatarSchema.statics.getTopBySkill = function(skill, limit = 10) {
    return this.find()
        .sort({ [`skills.${skill}.level`]: -1, [`skills.${skill}.xp`]: -1 })
        .limit(limit)
        .select(`userName level skills.${skill} achievements.length`);
};

export default mongoose.model('Avatar', avatarSchema);
