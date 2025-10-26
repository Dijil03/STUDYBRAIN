import mongoose from "mongoose";

const homeworkLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  weekStart: { type: Date, required: true }, // start of the week (e.g. Monday)
  tasks: [
    {
      subject: String,
      title: String,
      description: String,
      dueDate: Date,
      completed: { type: Boolean, default: false },
      completedAt: Date,
    },
  ],
});

export default mongoose.model("HomeworkLog", homeworkLogSchema);