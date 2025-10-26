import FlashcardSet from "../models/flashcard.model.js";

// Create flashcards from notes
export const generateFlashcards = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, notes } = req.body;

    // Basic Q&A extraction from notes
    const lines = notes.split("\n").filter((line) => line.includes(":"));
    const cards = lines.map((line) => {
      const [question, answer] = line.split(":");
      return { question: question.trim(), answer: answer.trim() };
    });

    const flashcardSet = new FlashcardSet({ userId, title, cards });
    await flashcardSet.save();

    res.status(201).json(flashcardSet);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate flashcards" });
  }
};

export const getFlashcardSets = async (req, res) => {
  try {
    const sets = await FlashcardSet.find({ userId: req.params.userId });
    res.status(200).json(sets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch flashcard sets" });
  }
};

// Save flashcards directly (for manual entry or edited cards)
export const saveFlashcards = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, cards } = req.body;

    const flashcardSet = new FlashcardSet({ userId, title, cards });
    await flashcardSet.save();

    res.status(201).json(flashcardSet);
  } catch (err) {
    console.error("Save flashcards error:", err);
    res.status(500).json({ error: "Failed to save flashcards" });
  }
};