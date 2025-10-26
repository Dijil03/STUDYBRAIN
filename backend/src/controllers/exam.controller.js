import Exam from "../models/exam.model.js";

// Create new exam
export const createExam = async (req, res) => {
  try {
    const { subject, examName, examDate, revisionGoals } = req.body;
    const exam = new Exam({
      userId: req.params.userId,
      subject,
      examName,
      examDate,
      revisionGoals,
    });
    await exam.save();
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ error: "Failed to create exam" });
  }
};

// Get all exams for user
export const getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ userId: req.params.userId });
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch exams" });
  }
};

// Log study session
export const logStudySession = async (req, res) => {
  try {
    const { duration, notes } = req.body;
    const exam = await Exam.findById(req.params.examId);
    if (!exam || exam.userId !== req.params.userId) {
      return res.status(404).json({ error: "Exam not found" });
    }
    exam.studyLog.push({ duration, notes });
    await exam.save();
    res.status(200).json(exam);
  } catch (err) {
    res.status(500).json({ error: "Failed to log study session" });
  }
};