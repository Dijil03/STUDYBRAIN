import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Trophy,
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  Star,
  Zap,
  Heart,
  Brain,
  Rocket,
  Award,
  BarChart3,
  Sparkles,
  ArrowRight,
  BookOpen,
  Timer,
  Users,
  Lightbulb
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../utils/axios";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "Academic",
    priority: "Medium",
    targetDate: "",
    status: "Not Started"
  });
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId] = useState(localStorage.getItem("userId"));

  const categories = [
    { name: "Academic", color: "from-blue-500 to-cyan-500", icon: BookOpen },
    { name: "Fitness", color: "from-green-500 to-emerald-500", icon: Trophy },
    { name: "Personal", color: "from-purple-500 to-pink-500", icon: Heart },
    { name: "Career", color: "from-orange-500 to-red-500", icon: Rocket },
    { name: "Hobby", color: "from-yellow-500 to-amber-500", icon: Star },
    { name: "Health", color: "from-pink-500 to-rose-500", icon: Brain }
  ];

  const priorities = [
    { name: "High", color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
    { name: "Medium", color: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-200" },
    { name: "Low", color: "text-green-500", bg: "bg-green-50", border: "border-green-200" }
  ];

  const statuses = [
    { name: "Not Started", color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
    { name: "In Progress", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
    { name: "On Track", color: "text-green-500", bg: "bg-green-50", border: "border-green-200" },
    { name: "Completed", color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200" }
  ];

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/myworld/${userId}`);
      setGoals(response.data?.goals || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const goalData = {
        ...newGoal,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        progress: 0
      };

      const updatedGoals = [...goals, goalData];
      setGoals(updatedGoals);

      // Update in backend
      await api.put(`/myworld/${userId}`, {
        goals: updatedGoals
      });

      setNewGoal({
        title: "",
        description: "",
        category: "Academic",
        priority: "Medium",
        targetDate: "",
        status: "Not Started"
      });
      setIsAddingGoal(false);
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  const handleUpdateGoal = async (goalId, updates) => {
    try {
      const updatedGoals = goals.map(goal =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      );
      setGoals(updatedGoals);

      await api.put(`/myworld/${userId}`, {
        goals: updatedGoals
      });

      setEditingGoal(null);
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      setGoals(updatedGoals);

      await api.put(`/myworld/${userId}`, {
        goals: updatedGoals
      });
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const getCategoryInfo = (categoryName) => {
    return categories.find(cat => cat.name === categoryName) || categories[0];
  };

  const getPriorityInfo = (priorityName) => {
    return priorities.find(pri => pri.name === priorityName) || priorities[1];
  };

  const getStatusInfo = (statusName) => {
    return statuses.find(stat => stat.name === statusName) || statuses[0];
  };

  const completedGoals = goals.filter(goal => goal.status === "Completed").length;
  const inProgressGoals = goals.filter(goal => goal.status === "In Progress").length;
  const totalGoals = goals.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mr-4">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Your Goals
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Set ambitious goals, track your progress, and celebrate your achievements. 
            Every step forward is a victory worth celebrating.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-400">Total Goals</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalGoals}</p>
            <p className="text-sm text-gray-400">Goals set</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-400">Completed</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{completedGoals}</p>
            <p className="text-sm text-gray-400">Achievements</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-orange-400">In Progress</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{inProgressGoals}</p>
            <p className="text-sm text-gray-400">Active goals</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-400">Success Rate</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-400">Completion rate</p>
          </motion.div>
        </motion.div>

        {/* Add Goal Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddingGoal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Goal</span>
            <Sparkles className="h-5 w-5" />
          </motion.button>
        </motion.div>

        {/* Add Goal Form */}
        {isAddingGoal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-xl mb-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Create New Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Goal Title</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your goal..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.name} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {priorities.map(priority => (
                      <option key={priority.name} value={priority.name}>{priority.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Target Date</label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="Describe your goal in detail..."
                  required
                />
              </div>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create Goal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-600 transition-all duration-300"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {goals.map((goal, index) => {
            const categoryInfo = getCategoryInfo(goal.category);
            const priorityInfo = getPriorityInfo(goal.priority);
            const statusInfo = getStatusInfo(goal.status);

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${categoryInfo.color} mr-4`}>
                      <categoryInfo.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{goal.title}</h3>
                      <p className="text-sm text-gray-400">{goal.category}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditingGoal(goal.id)}
                      className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 text-gray-300" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </motion.button>
                  </div>
                </div>

                <p className="text-gray-300 mb-4 leading-relaxed">{goal.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Priority</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityInfo.bg} ${priorityInfo.color} ${priorityInfo.border} border`}>
                      {goal.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border} border`}>
                      {goal.status}
                    </span>
                  </div>
                  {goal.targetDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Target Date</span>
                      <span className="text-sm text-gray-300">{new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {goal.status === "Completed" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30"
                  >
                    <div className="flex items-center text-green-400">
                      <Trophy className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Goal Achieved!</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {goals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <div className="p-8 bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-xl">
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl w-fit mx-auto mb-6">
                <Target className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No Goals Yet</h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                Start your journey by setting your first goal. Every great achievement begins with a single step.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddingGoal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Goal</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Goals;