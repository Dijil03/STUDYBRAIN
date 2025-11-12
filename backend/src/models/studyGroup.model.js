import mongoose from 'mongoose';
import crypto from 'crypto';

const studyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  subject: {
    type: String,
    required: true,
    enum: ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art', 'Music', 'Physical Education', 'Foreign Language', 'General', 'Other']
  },
  creator: {
    type: String, // userId
    required: true
  },
  creatorName: {
    type: String,
    required: true
  },
  privacy: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  memberLimit: {
    type: Number,
    default: 50,
    min: 2,
    max: 100
  },
  currentMembers: {
    type: Number,
    default: 1
  },
  tags: [{
    type: String,
    maxlength: 20
  }],
  studySchedule: {
    type: String,
    enum: ['flexible', 'morning', 'afternoon', 'evening', 'weekend', 'weekday'],
    default: 'flexible'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rules: {
    type: String,
    maxlength: 1000,
    default: 'Be respectful and supportive of all group members.'
  },
  joinRequests: [{
    userId: String,
    userName: String,
    requestedAt: { type: Date, default: Date.now },
    message: String
  }],
  stats: {
    totalSessions: { type: Number, default: 0 },
    totalStudyHours: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    completedAssessments: { type: Number, default: 0 }
  },
  inviteToken: {
    type: String,
    default: null
  },
  inviteTokenExpiry: {
    type: Date,
    default: null
  },
  inviteTokenEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
studyGroupSchema.index({ name: 'text', description: 'text', subject: 1 });
studyGroupSchema.index({ privacy: 1, isActive: 1 });
studyGroupSchema.index({ creator: 1 });
studyGroupSchema.index({ createdAt: -1 });
studyGroupSchema.index({ inviteToken: 1 }, { unique: true, sparse: true }); // Unique but sparse for invite tokens

const studyGroupMemberSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  contributions: {
    notesShared: { type: Number, default: 0 },
    assessmentsTaken: { type: Number, default: 0 },
    studyHours: { type: Number, default: 0 },
    helpGiven: { type: Number, default: 0 }
  },
  preferences: {
    notifications: {
      newMembers: { type: Boolean, default: true },
      newContent: { type: Boolean, default: true },
      studySessions: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

// Compound indexes
studyGroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
studyGroupMemberSchema.index({ userId: 1, isActive: 1 });
studyGroupMemberSchema.index({ groupId: 1, role: 1 });

// Middleware to update group member count
studyGroupMemberSchema.post('save', async function () {
  if (this.isActive) {
    const StudyGroup = mongoose.model('StudyGroup');
    const memberCount = await mongoose.model('StudyGroupMember').countDocuments({
      groupId: this.groupId,
      isActive: true
    });

    await StudyGroup.findByIdAndUpdate(this.groupId, {
      currentMembers: memberCount
    });
  }
});

studyGroupMemberSchema.post('findOneAndUpdate', async function () {
  const StudyGroup = mongoose.model('StudyGroup');
  const doc = await this.getQuery();

  if (doc.groupId) {
    const memberCount = await mongoose.model('StudyGroupMember').countDocuments({
      groupId: doc.groupId,
      isActive: true
    });

    await StudyGroup.findByIdAndUpdate(doc.groupId, {
      currentMembers: memberCount
    });
  }
});

// Virtual to get member count
studyGroupSchema.virtual('memberCount', {
  ref: 'StudyGroupMember',
  localField: '_id',
  foreignField: 'groupId',
  count: true,
  match: { isActive: true }
});

// Method to generate invite token
studyGroupSchema.methods.generateInviteToken = function () {
  // Generate a more unique token with timestamp + random bytes
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(12).toString('hex');
  this.inviteToken = `${timestamp}-${randomBytes}`;
  this.inviteTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  return this.inviteToken;
};

// Static method to generate unique invite token (handles duplicates)
studyGroupSchema.statics.generateUniqueInviteToken = async function () {
  let attempts = 0;
  const maxAttempts = 15; // Increased attempts

  while (attempts < maxAttempts) {
    try {
      // Generate a highly unique token with multiple entropy sources
      const timestamp = Date.now() + attempts; // Add attempt number to ensure uniqueness
      const randomPart1 = crypto.randomBytes(12).toString('hex'); // Increased randomness
      const randomPart2 = crypto.randomBytes(8).toString('hex');
      const randomPart3 = crypto.randomBytes(4).toString('hex');
      const processId = process.pid.toString(36);
      const microtime = (process.hrtime.bigint() % BigInt(1000000)).toString(36); // Microsecond precision
      const token = `sg_${timestamp}_${randomPart1}_${randomPart2}_${processId}_${randomPart3}_${microtime}`;

      // Check if token already exists (including null checks)
      const existingGroup = await this.findOne({ 
        inviteToken: { $ne: null, $eq: token } 
      });
      
      if (!existingGroup) {
        return token;
      }

      attempts++;
      // Add delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
    } catch (error) {
      console.error('Error in token generation attempt:', error);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  // Final fallback with maximum entropy
  const timestamp = Date.now();
  const uuid = crypto.randomUUID().replace(/-/g, '');
  const random1 = crypto.randomBytes(16).toString('hex');
  const random2 = crypto.randomBytes(8).toString('hex');
  const processId = process.pid.toString(36);
  const microtime = (process.hrtime.bigint() % BigInt(1000000)).toString(36);
  const fallbackToken = `sg_${timestamp}_${uuid}_${random1}_${random2}_${processId}_${microtime}`;
  console.warn('Using final fallback token generation method');
  return fallbackToken;
};

// Simple token generation without database checks (for emergency use)
studyGroupSchema.statics.generateSimpleInviteToken = function () {
  const timestamp = Date.now().toString(36);
  const random1 = crypto.randomBytes(8).toString('hex');
  const random2 = crypto.randomBytes(4).toString('hex');
  const random3 = Math.random().toString(36).substr(2, 8);
  return `sg_${timestamp}_${random1}_${random2}_${random3}`;
};

// Method to check if invite token is valid
studyGroupSchema.methods.isInviteTokenValid = function (token) {
  if (!this.inviteTokenEnabled || !this.inviteToken || !this.inviteTokenExpiry) {
    return false;
  }

  return this.inviteToken === token && new Date() < this.inviteTokenExpiry;
};

// Method to get invite link
studyGroupSchema.methods.getInviteLink = function () {
  if (!this.inviteToken) {
    return null;
  }

  const potentialUrls = [
    process.env.STUDYBRAIN_APP_URL,
    process.env.APP_URL,
    process.env.PUBLIC_APP_URL,
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean);

  const defaultUrl = process.env.NODE_ENV === 'production'
    ? 'https://studybrain.vercel.app'
    : 'http://localhost:5173';

  const baseUrl = (potentialUrls[0] || defaultUrl).replace(/\/$/, '');
  return `${baseUrl}/study-groups/invite/${this.inviteToken}`;
};

const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema);
const StudyGroupMember = mongoose.model('StudyGroupMember', studyGroupMemberSchema);

export { StudyGroup, StudyGroupMember };
