import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  choices: [{ type: String }],
  correctIndex: { type: Number },
});

const submissionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  answers: [{ type: Number }],
  score: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
});

const assessmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    questions: [questionSchema],
    submissions: [submissionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Assessment", assessmentSchema);


