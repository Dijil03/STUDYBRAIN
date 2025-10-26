import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  subject: { type: String, required: true, trim: true },
  duration: { type: Number, required: true }, // in minutes
  notes: { type: String, trim: true },
  productivity: { type: Number, min: 1, max: 10 }, // optional rating
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("StudySession", studySessionSchema);