import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['homework', 'study', 'time', 'streak', 'achievement'],
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    default: 'award'
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requirements: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

const userBadgeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  badgeId: {
    type: String,
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0
  },
  isEarned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

const Badge = mongoose.model('Badge', badgeSchema);
const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

export { Badge, UserBadge };
