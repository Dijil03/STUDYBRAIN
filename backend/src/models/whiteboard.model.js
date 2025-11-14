import mongoose from 'mongoose';

const { Schema } = mongoose;

const collaboratorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, enum: ['editor', 'viewer'], default: 'editor' },
}, { _id: false });

const whiteboardSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  collaborators: [collaboratorSchema],
  canvasData: {
    paths: { type: [Schema.Types.Mixed], default: [] },
    background: { type: String, default: '#0f172a' },
  },
  settings: {
    strokeColor: { type: String, default: '#22d3ee' },
    strokeWidth: { type: Number, default: 4 },
    showGrid: { type: Boolean, default: true },
  },
  lastSavedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  lastSavedAt: { type: Date, default: Date.now },
  isArchived: { type: Boolean, default: false },
  thumbnail: { type: String },
}, { timestamps: true });

whiteboardSchema.index({ owner: 1, updatedAt: -1 });
whiteboardSchema.index({ members: 1 });

const Whiteboard = mongoose.model('Whiteboard', whiteboardSchema);

export default Whiteboard;

