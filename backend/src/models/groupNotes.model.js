import mongoose from 'mongoose';

const groupNotesSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true,
    unique: true
  },
  content: {
    type: String,
    default: ''
  },
  lastUpdatedBy: {
    type: String, // userId
    default: null
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const GroupNotes = mongoose.model('GroupNotes', groupNotesSchema);

export default GroupNotes;

