import HomeworkLog from "../models/homeworkLog.model.js";

// Create or update weekly log
export const upsertWeeklyLog = async (req, res) => {
  try {
    const { weekStart, tasks } = req.body;
    const userId = req.params.userId;

    console.log("Upserting weekly log for userId:", userId, "weekStart:", weekStart);
    console.log("Tasks to save:", tasks);
    console.log("Tasks type:", typeof tasks);
    console.log("Tasks length:", tasks ? tasks.length : "undefined");
    console.log("Tasks is array:", Array.isArray(tasks));

    // Validate tasks array
    if (!Array.isArray(tasks)) {
      console.error("Tasks is not an array:", tasks);
      return res.status(400).json({ error: "Tasks must be an array" });
    }

    // Convert weekStart to Date if it's a string
    const weekStartDate = new Date(weekStart);

    if (isNaN(weekStartDate.getTime())) {
      return res.status(400).json({ error: "Invalid weekStart date format" });
    }

    console.log("WeekStart date:", weekStartDate);

    const updated = await HomeworkLog.findOneAndUpdate(
      { userId, weekStart: weekStartDate },
      { $set: { tasks } },
      { new: true, upsert: true }
    );

    console.log("Saved log:", updated ? "Yes" : "No");
    console.log("Saved tasks count:", updated ? updated.tasks.length : "No log");
    console.log("Saved log data:", updated);

    // Return the saved log with tasks
    res.status(200).json({
      success: true,
      message: "Weekly log saved successfully",
      log: updated,
      tasks: updated.tasks,
      taskCount: updated.tasks.length
    });
  } catch (err) {
    console.error("Error saving weekly log:", err);
    res.status(500).json({ error: "Failed to save weekly log" });
  }
};

// Mark a homework log task as completed
export const markTaskCompleted = async (req, res) => {
  try {
    const { weekStart, taskIndex } = req.body;
    const userId = req.params.userId;

    const log = await HomeworkLog.findOne({ userId, weekStart });
    if (!log) {
      return res.status(404).json({ error: "Weekly log not found" });
    }

    if (taskIndex >= 0 && taskIndex < log.tasks.length) {
      log.tasks[taskIndex].completed = true;
      log.tasks[taskIndex].completedAt = new Date();
      await log.save();

      res.status(200).json({ message: "Task marked as completed", task: log.tasks[taskIndex] });
    } else {
      res.status(400).json({ error: "Invalid task index" });
    }
  } catch (err) {
    console.error("Error marking task as completed:", err);
    res.status(500).json({ error: "Failed to mark task as completed" });
  }
};

// Get weekly log
export const getWeeklyLog = async (req, res) => {
  try {
    const { weekStart } = req.query;
    const userId = req.params.userId;

    console.log("Getting weekly log for userId:", userId, "weekStart:", weekStart);

    // If no weekStart provided, return empty tasks
    if (!weekStart) {
      console.log("No weekStart provided, returning empty tasks");
      return res.status(200).json({ tasks: [] });
    }

    // Convert weekStart string to Date properly
    const startDate = new Date(weekStart);

    // Check if date is valid
    if (isNaN(startDate.getTime())) {
      console.log("Invalid date format:", weekStart);
      return res.status(400).json({ error: "Invalid date format" });
    }

    console.log("Parsed startDate:", startDate);

    // Find the log for this specific week
    const log = await HomeworkLog.findOne({
      userId,
      weekStart: startDate
    });

    console.log("Found log:", log ? "Yes" : "No");

    // Return the log with tasks array, or empty tasks if no log found
    const response = log ? { tasks: log.tasks || [] } : { tasks: [] };
    console.log("Returning response:", response);

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching weekly log:", err);
    res.status(500).json({ error: "Failed to fetch weekly log" });
  }
};
// Get completion percentage
export const getWeeklyProgress = async (req, res) => {
  try {
    const { weekStart } = req.query;
    const log = await HomeworkLog.findOne({ userId: req.params.userId, weekStart });
    if (!log || log.tasks.length === 0) return res.status(200).json({ percent: 0 });

    const total = log.tasks.length;
    const completed = log.tasks.filter((t) => t.completed).length;
    const percent = Math.round((completed / total) * 100);

    res.status(200).json({ total, completed, percent });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate weekly progress" });
  }
};

// Debug endpoint to test homework log functionality
export const debugHomeworkLog = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Debug: Checking homework log for userId:", userId);

    // Get all homework logs for this user
    const allLogs = await HomeworkLog.find({ userId });

    console.log("Debug: All homework logs for userId:", userId);
    console.log("Total logs found:", allLogs.length);

    allLogs.forEach((log, index) => {
      console.log(`Log ${index + 1}:`);
      console.log("  weekStart:", log.weekStart);
      console.log("  tasks count:", log.tasks.length);
      console.log("  tasks:", log.tasks);
    });

    res.json({
      userId,
      totalLogs: allLogs.length,
      logs: allLogs.map(log => ({
        weekStart: log.weekStart,
        taskCount: log.tasks.length,
        completedCount: log.tasks.filter(t => t.completed).length,
        tasks: log.tasks // Include full tasks for debugging
      }))
    });
  } catch (error) {
    console.error("Error debugging homework log:", error);
    res.status(500).json({ error: "Failed to debug homework log" });
  }
};