import Assessment from "../models/assessment.model.js";

export const createAssessment = async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    const assessment = await Assessment.create({
      userId: req.params.userId,
      title,
      description,
      questions: questions || [],
    });
    res.status(201).json(assessment);
  } catch (err) {
    console.error("Error creating assessment:", err);
    res.status(500).json({ error: "Failed to create assessment" });
  }
};

export const listAssessments = async (req, res) => {
  try {
    const items = await Assessment.find({ userId: req.params.userId })
      .select("title description createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to list assessments" });
  }
};

export const getAssessment = async (req, res) => {
  try {
    const item = await Assessment.findOne({ _id: req.params.assessmentId, userId: req.params.userId });
    if (!item) return res.status(404).json({ error: "Assessment not found" });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assessment" });
  }
};

export const submitAssessment = async (req, res) => {
  try {
    const { answers } = req.body;
    const assessment = await Assessment.findOne({ _id: req.params.assessmentId, userId: req.params.userId });
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    let score = 0;
    if (Array.isArray(answers)) {
      answers.forEach((ans, idx) => {
        const q = assessment.questions[idx];
        if (q && typeof q.correctIndex === "number" && ans === q.correctIndex) {
          score += 1;
        }
      });
    }

    assessment.submissions.push({ userId: req.params.userId, answers, score });
    await assessment.save();

    res.status(200).json({ score, total: assessment.questions.length });
  } catch (err) {
    console.error("Error submitting assessment:", err);
    res.status(500).json({ error: "Failed to submit assessment" });
  }
};


