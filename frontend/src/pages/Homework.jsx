import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import dayjs from "dayjs";
import Navbar from "../components/Navbar";
import {
  Clock,
  Calendar,
  CheckCircle,
  Target,
  Loader2,
  BookOpen,
  ChevronDown,
  Plus,
  Edit3,
  Trash2,
  Star,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Timer,
  Brain,
  Trophy,
  Zap,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  Heart,
  Sparkles
} from "lucide-react";
import { toast } from "react-toastify";

const Homework = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [weekStart, setWeekStart] = useState(
    dayjs().startOf("week").add(1, "day").format("YYYY-MM-DD")
  );
  const [tasks, setTasks] = useState([]);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [isStudying, setIsStudying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: "",
    priority: "Medium"
  });
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("weekly"); // "weekly" or "all"

  const priorities = [
    { name: "High", color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
    { name: "Medium", color: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-200" },
    { name: "Low", color: "text-green-500", bg: "bg-green-50", border: "border-green-200" }
  ];

  const subjects = [
    "Mathematics", "Science", "English", "History", "Geography", 
    "Computer Science", "Physics", "Chemistry", "Biology", "Art", "Music", "Other"
  ];

  useEffect(() => {
    if (viewMode === "weekly") {
      fetchWeeklyHomework();
    } else {
      fetchAllHomework();
    }
  }, [weekStart, viewMode]);

  const fetchWeeklyHomework = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching homework for userId:", userId);
      const res = await api.get(`/homework/${userId}`);
      
      console.log("Homework API response:", res.data);
      
      setSelectedTaskIndex(null);
      setIsStudying(false);

      // Get all tasks first, then filter for the current week
      const allTasks = res.data?.map((task) => ({
        ...task,
        completed: !!task.completed,
      })) || [];

      // Filter tasks for the current week
      const weekStartDate = new Date(weekStart);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);

      const fetchedTasks = allTasks.filter((task) => {
        const taskDate = new Date(task.dueDate);
        return taskDate >= weekStartDate && taskDate <= weekEndDate;
      });

      console.log("All tasks:", allTasks);
      console.log("Week start:", weekStartDate);
      console.log("Week end:", weekEndDate);
      console.log("Processed tasks for week:", fetchedTasks);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error("Error fetching homework:", err);
      console.error("Error details:", err.response?.data);
      setError(`Failed to load homework data: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllHomework = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching all homework for userId:", userId);
      const res = await api.get(`/homework/${userId}`);
      
      console.log("All homework API response:", res.data);
      
      setSelectedTaskIndex(null);
      setIsStudying(false);

      // Get all tasks without filtering by week
      const allTasks = res.data?.map((task) => ({
        ...task,
        completed: !!task.completed,
      })) || [];

      console.log("All tasks loaded:", allTasks);
      setTasks(allTasks);
    } catch (err) {
      console.error("Error fetching all homework:", err);
      console.error("Error details:", err.response?.data);
      setError(`Failed to load homework data: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskIndex) => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    try {
      const task = tasks[taskIndex];
      const isCompleted = !task.completed;

      console.log("Updating task:", task._id, "completed:", isCompleted);

      // Update the task using the homework API
      await api.put(`/homework/${userId}/${task._id}`, {
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null
      });

      // Update local state
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex].completed = isCompleted;
      updatedTasks[taskIndex].completedAt = isCompleted ? new Date().toISOString() : null;
      setTasks(updatedTasks);

      toast.success(
        isCompleted 
          ? "🎉 Task completed! Great job!" 
          : "Task marked as incomplete"
      );
    } catch (err) {
      console.error("Error updating task:", err);
      console.error("Error details:", err.response?.data);
      toast.error(`Failed to update task: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        subject: newTask.subject,
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate
      };

      console.log("Creating new homework task:", taskData);

      const response = await api.post(`/homework/${userId}`, taskData);
      
      console.log("Created task response:", response.data);

      // Add the new task to local state
      const newTaskWithId = {
        ...response.data,
        completed: false
      };
      
      setTasks([...tasks, newTaskWithId]);

      setNewTask({
        title: "",
        description: "",
        subject: "",
        dueDate: "",
        priority: "Medium"
      });
      setShowAddTask(false);
      toast.success("Task added successfully!");
    } catch (error) {
      console.error("Error adding task:", error);
      console.error("Error details:", error.response?.data);
      toast.error(`Failed to add task: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDeleteTask = async (taskIndex) => {
    try {
      const task = tasks[taskIndex];
      console.log("Deleting task:", task._id);

      await api.delete(`/homework/${userId}/${task._id}`);

      const updatedTasks = tasks.filter((_, index) => index !== taskIndex);
      setTasks(updatedTasks);

      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      console.error("Error details:", error.response?.data);
      toast.error(`Failed to delete task: ${error.response?.data?.error || error.message}`);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === "all" || 
      (filter === "completed" && task.completed) ||
      (filter === "pending" && !task.completed);
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "dueDate":
        comparison = new Date(a.dueDate) - new Date(b.dueDate);
        break;
      case "priority":
        const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getPriorityInfo = (priorityName) => {
    return priorities.find(pri => pri.name === priorityName) || priorities[1];
  };

  const getSubjectColor = (subject) => {
    const colors = {
      "Mathematics": "from-blue-500 to-cyan-500",
      "Science": "from-green-500 to-emerald-500",
      "English": "from-purple-500 to-pink-500",
      "History": "from-orange-500 to-red-500",
      "Geography": "from-yellow-500 to-amber-500",
      "Computer Science": "from-indigo-500 to-blue-500",
      "Physics": "from-pink-500 to-rose-500",
      "Chemistry": "from-teal-500 to-cyan-500",
      "Biology": "from-lime-500 to-green-500",
      "Art": "from-violet-500 to-purple-500",
      "Music": "from-pink-500 to-fuchsia-500",
      "Other": "from-gray-500 to-slate-500"
    };
    return colors[subject] || colors["Other"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-300">Loading your homework...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10 lg:mb-12"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl mr-0 sm:mr-4 mb-3 sm:mb-0">
              <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Homework Tracker
            </h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            {viewMode === "weekly" 
              ? "Stay organized and never miss a deadline. Track your assignments, set priorities, and achieve academic success."
              : "View all your homework tasks across all time periods. Stay organized and never miss a deadline."
            }
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-slate-800/50 backdrop-blur-xl p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-blue-400 hidden sm:block">Total Tasks</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{totalTasks}</p>
            <p className="text-xs sm:text-sm text-gray-400">{viewMode === "weekly" ? "This week" : "Total tasks"}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-slate-800/50 backdrop-blur-xl p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-green-400 hidden sm:block">Completed</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{completedTasks}</p>
            <p className="text-xs sm:text-sm text-gray-400">Tasks done</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-slate-800/50 backdrop-blur-xl p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg sm:rounded-xl">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-orange-400 hidden sm:block">Progress</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{completionRate}%</p>
            <p className="text-xs sm:text-sm text-gray-400">Completion rate</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-slate-800/50 backdrop-blur-xl p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-purple-400 hidden sm:block">Remaining</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{totalTasks - completedTasks}</p>
            <p className="text-xs sm:text-sm text-gray-400">Tasks left</p>
          </motion.div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-xl mb-6 sm:mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-4">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-700 rounded-lg sm:rounded-xl p-1">
                <button
                  onClick={() => setViewMode("weekly")}
                  className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ${
                    viewMode === "weekly" 
                      ? 'bg-purple-500 text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ${
                    viewMode === "all" 
                      ? 'bg-purple-500 text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  All Tasks
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64 text-sm sm:text-base"
                />
              </div>

              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              {/* Sort */}
              <div className="flex space-x-1 sm:space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="p-2 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl text-white hover:bg-slate-600 transition-colors"
                >
                  {sortOrder === "asc" ? <SortAsc className="h-4 w-4 sm:h-5 sm:w-5" /> : <SortDesc className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddTask(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Add Task</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Tasks List */}
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence>
            {sortedTasks.map((task, index) => {
              const priorityInfo = getPriorityInfo(task.priority);
              const subjectColor = getSubjectColor(task.subject);
              const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;
              
              return (
                <motion.div
                  key={task.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`bg-slate-800/50 backdrop-blur-xl p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 ${
                    task.completed ? 'opacity-75' : ''
                  } ${isOverdue ? 'border-red-500/50 bg-red-500/5' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 sm:space-x-4 flex-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleTaskToggle(index)}
                        disabled={isCompleting}
                        className={`mt-1 p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 ${
                          task.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        }`}
                      >
                        {isCompleting ? (
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </motion.button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                          <h3 className={`text-lg sm:text-xl font-bold ${task.completed ? 'line-through text-gray-400' : 'text-white'} truncate`}>
                            {task.title}
                          </h3>
                          {isOverdue && (
                            <div className="flex items-center space-x-1 text-red-400">
                              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="text-xs sm:text-sm font-medium">Overdue</span>
                            </div>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-gray-300 mb-2 sm:mb-3 leading-relaxed text-sm sm:text-base line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-r ${subjectColor}`}>
                              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                            </div>
                            <span className="text-gray-300 truncate">{task.subject}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <span className="text-gray-300 text-xs sm:text-sm">
                              Due: {dayjs(task.dueDate).format('MMM DD, YYYY')}
                            </span>
                          </div>
                          
                          <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${priorityInfo.bg} ${priorityInfo.color} ${priorityInfo.border} border`}>
                            {task.priority} Priority
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/motivation')}
                        className="p-1.5 sm:p-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg hover:from-pink-500/30 hover:to-purple-500/30 transition-all duration-300 flex items-center space-x-1"
                        title="I Need Motivation"
                      >
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-pink-400" />
                        <span className="text-xs font-medium text-pink-300 hidden sm:inline">Motivation</span>
                      </motion.button>
                      {!task.completed && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleTaskToggle(index)}
                          disabled={isCompleting}
                          className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteTask(index)}
                        className="p-1.5 sm:p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {sortedTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20"
            >
              <div className="p-8 bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-xl">
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl w-fit mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No Tasks Found</h3>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">
                  {searchTerm || filter !== "all" 
                    ? "No tasks match your current filters. Try adjusting your search or filter criteria."
                    : "Start by adding your first homework task to stay organized and on track."
                  }
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddTask(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Your First Task</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Add Task Modal */}
        <AnimatePresence>
          {showAddTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowAddTask(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-700 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Add New Task</h3>
                <form onSubmit={handleAddTask} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Task Title</label>
                      <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter task title..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                      <select
                        value={newTask.subject}
                        onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                        required
                      >
                        <option value="">Select subject...</option>
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      >
                        {priorities.map(priority => (
                          <option key={priority.name} value={priority.name}>{priority.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      rows="3"
                      placeholder="Enter task description..."
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                    >
                      Add Task
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowAddTask(false)}
                      className="flex-1 bg-slate-700 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-slate-600 transition-all duration-300 text-sm sm:text-base"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Homework;