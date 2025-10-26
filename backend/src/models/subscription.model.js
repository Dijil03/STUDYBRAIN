import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  tier: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'trial'],
    default: 'active'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  trialEndDate: {
    type: Date
  },
  stripeCustomerId: {
    type: String
  },
  stripeSubscriptionId: {
    type: String
  },
  priceId: {
    type: String
  },
  features: {
    documents: {
      max: { type: Number, default: 3 },
      used: { type: Number, default: 0 }
    },
    storage: {
      max: { type: Number, default: 1024 }, // MB
      used: { type: Number, default: 0 }
    },
    aiQueries: {
      max: { type: Number, default: 5 },
      used: { type: Number, default: 0 }
    },
    studyGroups: {
      max: { type: Number, default: 0 },
      used: { type: Number, default: 0 }
    },
    collaboration: {
      enabled: { type: Boolean, default: false }
    },
    analytics: {
      enabled: { type: Boolean, default: false }
    },
    export: {
      enabled: { type: Boolean, default: false }
    },
    apiAccess: {
      enabled: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true
});

// Update features based on tier
subscriptionSchema.pre('save', function(next) {
  if (this.tier === 'free') {
    this.features = {
      documents: { max: 3, used: this.features.documents.used },
      storage: { max: 1024, used: this.features.storage.used },
      aiQueries: { max: 5, used: this.features.aiQueries.used },
      studyGroups: { max: 0, used: this.features.studyGroups.used },
      collaboration: { enabled: false },
      analytics: { enabled: false },
      export: { enabled: false },
      apiAccess: { enabled: false }
    };
  } else if (this.tier === 'premium') {
    this.features = {
      documents: { max: -1, used: this.features.documents.used }, // unlimited
      storage: { max: 10240, used: this.features.storage.used }, // 10GB
      aiQueries: { max: -1, used: this.features.aiQueries.used }, // unlimited
      studyGroups: { max: 5, used: this.features.studyGroups.used },
      collaboration: { enabled: true },
      analytics: { enabled: true },
      export: { enabled: true },
      apiAccess: { enabled: false }
    };
  } else if (this.tier === 'enterprise') {
    this.features = {
      documents: { max: -1, used: this.features.documents.used }, // unlimited
      storage: { max: -1, used: this.features.storage.used }, // unlimited
      aiQueries: { max: -1, used: this.features.aiQueries.used }, // unlimited
      studyGroups: { max: -1, used: this.features.studyGroups.used }, // unlimited
      collaboration: { enabled: true },
      analytics: { enabled: true },
      export: { enabled: true },
      apiAccess: { enabled: true }
    };
  }
  next();
});

export default mongoose.model('Subscription', subscriptionSchema);
