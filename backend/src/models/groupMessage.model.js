import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for better query performance
groupMessageSchema.index({ groupId: 1, timestamp: -1 });

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

export default GroupMessage;

