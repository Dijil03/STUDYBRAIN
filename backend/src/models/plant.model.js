import mongoose from 'mongoose';

const SessionSnapshotSchema = new mongoose.Schema({
  startedAt: { type: Date, required: true },
  completedAt: { type: Date },
  durationMinutes: { type: Number, default: 0 },
  subject: { type: String, default: 'General' },
  notes: { type: String, default: '' },
  quality: { type: Number, min: 0, max: 5, default: 5 },
  linkedRevisionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Revision' }],
}, { _id: false });

const PlantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  species: { type: String, ref: 'Species', required: true },
  subject: { type: String, default: 'General' },
  conceptKeys: [{ type: String }],
  plantedAt: { type: Date, default: Date.now },
  tileIndex: { type: Number, default: 0 },
  growthStage: { type: Number, default: 1 },
  growthProgressMinutes: { type: Number, default: 0 },
  sessions: { type: [SessionSnapshotSchema], default: [] },
  healthStatus: { type: String, enum: ['healthy', 'thirsty', 'wilted'], default: 'healthy' },
  isSpecial: { type: Boolean, default: false },
  lastCareAt: { type: Date, default: Date.now },
  totalFocusMinutes: { type: Number, default: 0 },
  earnedDew: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

PlantSchema.index({ userId: 1, tileIndex: 1 });

export default mongoose.model('Plant', PlantSchema);

