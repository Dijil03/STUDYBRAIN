import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subject: { type: String, required: true },
  examName: { type: String, required: true },
  examDate: { type: Date, required: true },
  revisionGoals: [String],
  studyLog: [
    {
      duration: Number, // in minutes
      notes: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("Exam", examSchema);