import mongoose from 'mongoose';

const InventoryItemSchema = new mongoose.Schema({
  species: { type: String, ref: 'Species', required: true },
  quantity: { type: Number, default: 0 },
}, { _id: false });

const ActiveSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  species: { type: String, required: true },
  subject: { type: String, default: 'General' },
  targetMinutes: { type: Number, default: 25 },
  startedAt: { type: Date, default: Date.now },
  tileIndex: { type: Number, default: 0 },
}, { _id: false });

const GardenStateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dewBalance: { type: Number, default: 0 },
  totalFocusMinutes: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  gridColumns: { type: Number, default: 5 },
  gridRows: { type: Number, default: 5 },
  nextTileIndex: { type: Number, default: 0 },
  inventory: { type: [InventoryItemSchema], default: [] },
  lastSessionDate: { type: Date },
  activeSession: { type: ActiveSessionSchema, default: null },
}, {
  timestamps: true,
});

export default mongoose.model('GardenState', GardenStateSchema);

