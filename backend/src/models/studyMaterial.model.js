import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    enum: ['pdf', 'image', 'note', 'video', 'audio', 'link', 'document', 'other'],
    required: true
  },
  subject: {
    type: String,
    trim: true,
    default: 'general'
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  // File storage - can store URL or base64 or file path
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number, // in bytes
    default: 0
  },
  mimeType: {
    type: String,
    default: null
  },
  // For notes/text content
  content: {
    type: String,
    default: ''
  },
  // For links
  linkUrl: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isStarred: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
studyMaterialSchema.index({ userId: 1, subject: 1 });
studyMaterialSchema.index({ userId: 1, tags: 1 });
studyMaterialSchema.index({ userId: 1, isStarred: 1 });
studyMaterialSchema.index({ userId: 1, isArchived: 1 });
studyMaterialSchema.index({ userId: 1, createdAt: -1 });
studyMaterialSchema.index({ userId: 1, title: 'text', description: 'text', tags: 'text' });

// Update lastAccessed when material is viewed
studyMaterialSchema.methods.markAsViewed = function() {
  this.viewCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

export default mongoose.model('StudyMaterial', studyMaterialSchema);

