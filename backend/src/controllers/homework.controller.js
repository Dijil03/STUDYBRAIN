import Homework from "../models/homework.model.js";

// Create a new homework task
export const createHomework = async (req, res) => {
  try {
    const { subject, title, description, dueDate } = req.body;
    const task = await Homework.create({
      userId: req.params.userId,
      subject,
      title,
      description,
      dueDate
    });
    res.status(201).json(task);
  } catch (err) {
    console.error("Error creating homework:", err);
    res.status(500).json({ error: "Failed to create homework" });
  }
};

// Get all homework tasks for a user
export const getHomework = async (req, res) => {
  try {
    const tasks = await Homework.find({ userId: req.params.userId }).sort({ dueDate: 1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch homework" });
  }
};

// Mark homework as completed
export const markCompleted = async (req, res) => {
  try {
    const task = await Homework.findOneAndUpdate(
      { _id: req.params.taskId, userId: req.params.userId },
      { $set: { completed: true, completedAt: new Date() } },
      { new: true }
    );
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as completed" });
  }
};

// Update homework task
export const updateHomework = async (req, res) => {
  try {
    const { completed, completedAt } = req.body;
    const updateData = {};
    
    if (completed !== undefined) {
      updateData.completed = completed;
    }
    if (completedAt !== undefined) {
      updateData.completedAt = completedAt;
    }
    
    const task = await Homework.findOneAndUpdate(
      { _id: req.params.taskId, userId: req.params.userId },
      { $set: updateData },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ error: "Homework task not found" });
    }
    
    res.status(200).json(task);
  } catch (err) {
    console.error("Error updating homework:", err);
    res.status(500).json({ error: "Failed to update homework" });
  }
};

// Delete a homework task
export const deleteHomework = async (req, res) => {
  try {
    await Homework.findOneAndDelete({ _id: req.params.taskId, userId: req.params.userId });
    res.status(200).json({ message: "Homework deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete homework" });
  }
};
// Get chart data for homework progress
export const getHomeworkChartData = async (req, res) => {
  try {
    const tasks = await Homework.find({ userId: req.params.userId });

    // Group by date and count completed tasks
    const dateMap = {};

    tasks.forEach((task) => {
      const dateKey = new Date(task.dueDate).toISOString().split("T")[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { total: 0, completed: 0 };
      }
      dateMap[dateKey].total += 1;
      if (task.completed) {
        dateMap[dateKey].completed += 1;
      }
    });

    // Format for Chart.js
    const labels = Object.keys(dateMap).sort();
    const data = labels.map((date) => dateMap[date].completed);

    res.status(200).json({ labels, data });
  } catch (err) {
    console.error("Error generating chart data:", err);
    res.status(500).json({ error: "Failed to generate chart data" });
  }
};
// Get homework completion percentage
export const getHomeworkProgress = async (req, res) => {
  try {
    const tasks = await Homework.find({ userId: req.params.userId });

    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({ total, completed, percent });
  } catch (err) {
    console.error("Error calculating progress:", err);
    res.status(500).json({ error: "Failed to calculate progress" });
  }
};
