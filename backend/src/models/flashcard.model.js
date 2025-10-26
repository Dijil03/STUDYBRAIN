import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: String,
  cards: [
    {
      question: String,
      answer: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("FlashcardSet", flashcardSchema);