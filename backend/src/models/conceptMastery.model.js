import mongoose from 'mongoose';

const RelatedConceptSchema = new mongoose.Schema({
  conceptKey: {
    type: String,
    required: true,
    trim: true,
  },
  strength: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1,
  },
}, { _id: false });

const PrerequisiteSchema = new mongoose.Schema({
  conceptKey: {
    type: String,
    required: true,
    trim: true,
  },
  strength: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 1,
  },
}, { _id: false });

const ReviewHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    default: 'manual',
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  masteryLevel: {
    type: Number,
    min: 0,
    max: 100,
  },
}, { _id: false });

const ConceptMasterySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  conceptKey: {
    type: String,
    required: true,
    trim: true,
  },
  conceptName: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    default: 'General',
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  masteryLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  confidenceScore: {
    type: Number,
    default: 0.4,
    min: 0,
    max: 1,
  },
  status: {
    type: String,
    enum: ['weak', 'developing', 'strong', 'mastered'],
    default: 'weak',
  },
  difficulty: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1,
  },
  importance: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  recentScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  lastReviewed: Date,
  nextReview: Date,
  relatedConcepts: [RelatedConceptSchema],
  prerequisites: [PrerequisiteSchema],
  reviewHistory: [ReviewHistorySchema],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

ConceptMasterySchema.index({ userId: 1, conceptKey: 1 }, { unique: true });
ConceptMasterySchema.index({ userId: 1, subject: 1 });

export default mongoose.model('ConceptMastery', ConceptMasterySchema);

