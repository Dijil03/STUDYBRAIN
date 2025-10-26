import React, { useState, useEffect } from "react";
import api from "../utils/axios";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  PlusCircle,
  Save,
  XCircle,
  Trash2,
  Calendar,
  BookOpen,
  Clock,
  Zap,
  Loader2,
  CheckCircle,
  AlertCircle,
  Target,
  TrendingUp,
  Award,
  Sparkles,
  Rocket,
  Star,
  Timer,
  Bookmark,
  Edit3,
  Archive,
  BarChart3,
  Users,
  Lightbulb,
  Shield,
  Heart,
  Flame,
} from "lucide-react";
import { toast } from "react-toastify";
import MotivationalMessage from "../components/MotivationalMessage";

// Stunning Task Item Component with Advanced Animations
const TaskItem = ({ task, onRemove, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.li
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group mb-4"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Main Card */}
      <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-[2px]">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl h-full"></div>
        </div>
        
        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Task Header */}
              <div className="flex items-center mb-4">
                <motion.div
                  animate={{ rotate: isHovered ? 360 : 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative mr-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </motion.div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {task.title}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200">
                      <BookOpen className="w-4 h-4 mr-2" />
                      {task.subject}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border border-red-200">
                      <Calendar className="w-4 h-4 mr-2" />
                      Due: {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Task Description */}
              {task.description && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-l-4 border-blue-400"
                >
                  <p className="text-gray-700 leading-relaxed">{task.description}</p>
                </motion.div>
              )}
            </div>
            
            {/* Remove Button */}
            {onRemove && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onRemove(index)}
                className="ml-4 p-3 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 group"
                title="Remove Task"
              >
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
};

const WeeklyHomeworkLog = () => {
  const userId = localStorage.getItem("userId");
  const [weekStart, setWeekStart] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    subject: "",
    title: "",
    description: "",
    dueDate: "",
    completed: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingDeadlines: 0,
    productivityScore: 0
  });
  
  // Motivational message state
  const [showMotivationalMessage, setShowMotivationalMessage] = useState(false);
  const [motivationalData, setMotivationalData] = useState({ duration: '', subject: '', type: 'success' });

  // Calculate stats
  useEffect(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const today = new Date();
    const upcomingDeadlines = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate >= today;
    }).length;
    const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    setStats({
      totalTasks,
      completedTasks,
      upcomingDeadlines,
      productivityScore
    });
  }, [tasks]);

  const handleTaskInputChange = (e) => {
    setError(null);
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleAddTask = () => {
    if (!newTask.subject || !newTask.title || !newTask.dueDate) {
      setError("Subject, Title, and Due Date are required for a new task.");
      return;
    }
    setTasks([...tasks, newTask]);
    setNewTask({
      subject: "",
      title: "",
      description: "",
      dueDate: "",
      completed: false,
    });
    setError(null);
    toast.info("Task added to list! Click SAVE to confirm your week.");
  };

  const handleRemoveTask = (indexToRemove) => {
    setTasks(tasks.filter((_, index) => index !== indexToRemove));
    toast.warn("Task removed from the current list.");
  };

  const handleSubmit = async () => {
    if (!weekStart) {
      setError("Please select the Week Start date.");
      return;
    }
    if (tasks.length === 0) {
      setError("Please add at least one task before saving.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      console.log("Sending homework log data:");
      console.log("userId:", userId);
      console.log("weekStart:", weekStart);
      console.log("tasks:", tasks);
      console.log("tasks length:", tasks.length);
      console.log("tasks type:", typeof tasks);
      console.log("tasks is array:", Array.isArray(tasks));
      
      const response = await api.post(`/homeworklog/${userId}`, {
        weekStart,
        tasks,
      });
      
      console.log("Response from server:", response.data);
      console.log("Server response tasks:", response.data.tasks);
      console.log("Server response tasks length:", response.data.tasks ? response.data.tasks.length : "No tasks in response");
      
      toast.success("Homework Logged Successfully! 🎉 Your week is set.");
      
      // Show motivational message based on task count
      let motivationalType = 'success';
      if (tasks.length >= 10) {
        motivationalType = 'milestone'; // 10+ tasks planned
      } else if (tasks.length >= 5) {
        motivationalType = 'encouragement'; // 5+ tasks planned
      }
      
      setMotivationalData({
        duration: `${tasks.length} tasks`,
        subject: 'Weekly Plan',
        type: motivationalType
      });
      setShowMotivationalMessage(true);
      
      // Only clear if the server confirms the save was successful
      if (response.data && response.data.tasks !== undefined) {
        setTasks([]);
        setWeekStart("");
      }
    } catch (err) {
      console.error("Error saving homework log:", err);
      console.error("Error details:", err.response?.data);
      setError("❌ Failed to save homework log. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  // Close motivational message
  const closeMotivationalMessage = () => {
    setShowMotivationalMessage(false);
  };

  return (
    <>
      <Navbar />
      
      {/* Stunning Background with Animated Elements */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {/* Stunning Header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-2xl">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-black text-white mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Weekly Homework Planner
                  </h1>
                  <p className="text-purple-200 text-lg font-medium">
                    Plan your success, one task at a time
                  </p>
                </div>
              </div>
              
              {/* Stats Display */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{stats.totalTasks}</div>
                  <div className="text-white/60 text-sm">Total Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{stats.completedTasks}</div>
                  <div className="text-white/60 text-sm">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{stats.productivityScore}%</div>
                  <div className="text-white/60 text-sm">Progress</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Week Start Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8"
          >
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur-lg opacity-75"></div>
                <div className="relative bg-gradient-to-r from-green-400 to-emerald-500 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white ml-4">Select Week Start Date</h3>
            </div>
            
            <input
              type="date"
              value={weekStart}
              onChange={(e) => {
                setWeekStart(e.target.value);
                setError(null);
              }}
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-medium focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm placeholder-white/60"
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Add Task Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
            >
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                    <PlusCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white ml-4">Add New Task</h3>
              </div>

              <div className="space-y-6">
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject (e.g., Chemistry)"
                  value={newTask.subject}
                  onChange={handleTaskInputChange}
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-medium focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm placeholder-white/60"
                />
                <input
                  type="text"
                  name="title"
                  placeholder="Title (e.g., Lab Report Draft)"
                  value={newTask.title}
                  onChange={handleTaskInputChange}
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-medium focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm placeholder-white/60"
                />
                <textarea
                  name="description"
                  placeholder="Task details (Optional but recommended)"
                  value={newTask.description}
                  onChange={handleTaskInputChange}
                  rows="3"
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-medium focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm placeholder-white/60 resize-none"
                />
                <input
                  type="date"
                  name="dueDate"
                  value={newTask.dueDate}
                  onChange={handleTaskInputChange}
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-medium focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddTask}
                disabled={!newTask.subject || !newTask.title || !newTask.dueDate}
                className="mt-8 w-full flex justify-center items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-4 rounded-xl hover:shadow-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle className="w-5 h-5 mr-3" />
                Add Task
              </motion.button>
            </motion.div>

            {/* Task List */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="lg:col-span-3 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
            >
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl blur-lg opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-blue-400 to-cyan-500 p-3 rounded-xl">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white ml-4">Current Tasks ({tasks.length})</h3>
              </div>

              <AnimatePresence>
                {tasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-12 bg-white/5 rounded-2xl border border-white/10"
                  >
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Ready to Start Planning?</h3>
                    <p className="text-white/60 text-lg">
                      Add your first task to begin building your weekly schedule!
                    </p>
                  </motion.div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto pr-3">
                    <AnimatePresence>
                      {tasks.map((task, index) => (
                        <TaskItem
                          key={index}
                          task={task}
                          index={index}
                          onRemove={handleRemoveTask}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center backdrop-blur-sm"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                  <span className="text-red-200 font-medium">{error}</span>
                </motion.div>
              )}

              {/* Save Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={saving || tasks.length === 0 || !weekStart}
                className="mt-8 w-full flex justify-center items-center bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-6 py-4 rounded-xl hover:shadow-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3" />
                    Save Weekly Plan
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Motivational Message Modal */}
      <MotivationalMessage
        isVisible={showMotivationalMessage}
        duration={motivationalData.duration}
        subject={motivationalData.subject}
        type={motivationalData.type}
        onClose={closeMotivationalMessage}
      />
    </>
  );
};

export default WeeklyHomeworkLog;
