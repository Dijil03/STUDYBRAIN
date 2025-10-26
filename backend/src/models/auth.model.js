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
});

const User = mongoose.model("User", userSchema);

export default User;
