import mongoose from 'mongoose';

const GrowthStageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stage: { type: Number, required: true },
  minSessions: { type: Number, default: 1 },
  minMinutes: { type: Number, default: 25 },
  artVariant: { type: String, default: '' }, // client asset identifier
}, { _id: false });

const UnlockRequirementSchema = new mongoose.Schema({
  type: { type: String, enum: ['streak', 'subjectMinutes', 'totalMinutes'], default: 'totalMinutes' },
  value: { type: Number, default: 0 },
  subject: { type: String, default: null },
}, { _id: false });

const SpeciesSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  displayName: { type: String, required: true, trim: true },
  category: { type: String, enum: ['tree', 'shrub', 'flower', 'herb', 'succulent'], default: 'tree' },
  description: { type: String, default: '' },
  baseFocusMinutes: { type: Number, default: 25 },
  price: { type: Number, default: 0 }, // dew drop cost
  rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'legendary'], default: 'common' },
  seasonal: { type: Boolean, default: false },
  recommendedSubjects: [{ type: String }],
  growthStages: { type: [GrowthStageSchema], default: [] },
  unlockRequirement: UnlockRequirementSchema,
  ambientSound: { type: String, default: '' }, // optional sound asset key
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Species', SpeciesSchema);

