import mongoose from "mongoose";

const homeworkSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  subject: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  dueDate: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model("Homework", homeworkSchema);