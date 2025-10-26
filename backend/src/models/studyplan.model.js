import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
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
    trim: true
  },
  weekStart: {
    type: Date,
    required: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  detailedPlan: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    tasks: [{
      id: String,
      title: String,
      subject: String,
      dueDate: Date,
      completed: { type: Boolean, default: false },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }],
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 }
  }],
  goals: [String],
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
studyPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('StudyPlan', studyPlanSchema);
