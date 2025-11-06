import mongoose from "mongoose";

const revisionSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  subject: { 
    type: String, 
    default: "General" 
  },
  tags: [String],
  
  // Spaced Repetition Algorithm Fields (SM-2)
  difficulty: { 
    type: Number, 
    default: 2.5, // Ease Factor (EF) - starts at 2.5
    min: 1.3,
    max: 2.5 
  },
  interval: { 
    type: Number, 
    default: 1, // Days until next review
    min: 1 
  },
  repetitions: { 
    type: Number, 
    default: 0 // Number of successful reviews
  },
  lastReviewed: { 
    type: Date, 
    default: Date.now 
  },
  nextReview: { 
    type: Date, 
    required: true,
    index: true 
  },
  
  // Performance tracking
  reviewHistory: [{
    date: { type: Date, default: Date.now },
    quality: { type: Number, min: 0, max: 5 }, // 0-5 rating
    interval: Number,
    difficulty: Number
  }],
  
  // Calendar integration
  calendarEventId: String, // Google Calendar event ID
  syncedToCalendar: { 
    type: Boolean, 
    default: false 
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'mastered', 'archived'],
    default: 'active' 
  },
  masteryLevel: { 
    type: Number, 
    default: 0, // 0-100%
    min: 0,
    max: 100 
  },
  
  // Metadata
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update updatedAt before saving
revisionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
revisionSchema.index({ userId: 1, nextReview: 1 });
revisionSchema.index({ userId: 1, status: 1 });

export default mongoose.model("Revision", revisionSchema);

