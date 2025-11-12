import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.isGoogleUser; // Only required for non-Google users
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values for non-Google users
  },
  isGoogleUser: {
    type: Boolean,
    default: false,
  },
  // Google OAuth tokens for Google Docs integration
  googleAccessToken: {
    type: String,
    default: null,
  },
  googleRefreshToken: {
    type: String,
    default: null,
  },
  googleTokenExpiry: {
    type: Date,
    default: null,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
  // Subscription information
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'inactive'
    },
    plan: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free'
    },
    planName: {
      type: String,
      default: 'Free Plan'
    },
    stripeCustomerId: {
      type: String,
      default: null
    },
    stripeSubscriptionId: {
      type: String,
      default: null
    },
    currentPeriodStart: {
      type: Date,
      default: null
    },
    currentPeriodEnd: {
      type: Date,
      default: null
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  hasCompletedPersonalization: {
    type: Boolean,
    default: false,
  },
  personalization: {
    studyGoal: {
      type: String,
      default: '',
    },
    focusAreas: {
      type: [String],
      default: [],
    },
    preferredStudyTimes: {
      morning: { type: Boolean, default: false },
      afternoon: { type: Boolean, default: false },
      evening: { type: Boolean, default: false },
    },
    focusStyle: {
      type: String,
      default: 'balanced',
    },
    motivationStyle: {
      type: String,
      default: 'streaks',
    },
    preferredSessionLength: {
      type: Number,
      default: 25,
    },
    weeklyTargetHours: {
      type: Number,
      default: 10,
    },
    notifications: {
      studyReminders: { type: Boolean, default: true },
      focusTimer: { type: Boolean, default: true },
      progressReports: { type: Boolean, default: true },
      accountabilityBuddy: { type: Boolean, default: false },
    },
    productivityProfile: {
      type: String,
      default: 'steady',
    },
    timezone: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
});

userSchema.pre('save', function (next) {
  if (this.isModified('personalization')) {
    if (!this.personalization.createdAt) {
      this.personalization.createdAt = new Date();
    }
    this.personalization.updatedAt = new Date();
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
