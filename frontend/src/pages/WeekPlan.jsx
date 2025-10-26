import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import Navbar from "../components/Navbar";
import StudyPlanLimit from "../components/StudyPlanLimit";
import api from "../utils/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  CalendarDays,
  ListChecks,
  Target,
  Clock,
  Zap,
  CheckCircle,
  TrendingUp,
  Loader2,
  Trophy,
  AlertTriangle,
  Send,
  Plus,
  Edit3,
  Save,
  X,
  Play,
  RotateCcw,
  Pause,
  Calendar,
  BookOpen,
  Brain,
  FileText,
  Star,
  Award,
  Timer,
  BarChart3,
  PieChart,
  Settings,
  RefreshCw,
  Download,
  Share2,
  Bell,
  CheckSquare,
  Square,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Flame,
  Rocket,
  Crown,
  Shield,
  Lightbulb,
  Users,
  Coffee,
  Moon,
  Sun,
  Wind,
  Heart,
  Gift,
  Zap as Lightning,
} from "lucide-react";
import MotivationalMessage from "../components/MotivationalMessage";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

// --- TOAST NOTIFICATION ---
const toast = {
  success: (msg) => {
    alert(msg);
  },
  error: (msg) => {
    alert(msg);
  },
};

// --- UTILITY FUNCTIONS ---

/**
 * Converts seconds into a formatted MM:SS string.
 * @param {number} totalSeconds
 * @returns {string}
 */
const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Converts tasks count to total seconds for the timer.
 * Assumes 30 minutes (1800 seconds) per task.
 * @param {number} tasks
 * @returns {number} total seconds
 */
const tasksToSeconds = (tasks) => tasks * 30 * 60;

/**
 * Get week start date (Monday)
 */
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

/**
 * Get week end date (Sunday)
 */
const getWeekEnd = (date) => {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

/**
 * Format date for display
 */
const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Get week range string
 */
const getWeekRange = (date) => {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

// --- NAVBAR COMPONENT ---

// --- END NAVBAR COMPONENT ---

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const WeekPlan = () => {
  const userId = localStorage.getItem("userId");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState({});
  const [editing, setEditing] = useState(false);
  const [viewMode, setViewMode] = useState('plan'); // 'plan', 'tasks', 'analytics'
  const [newPlan, setNewPlan] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const [notes, setNotes] = useState('');
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [showAddTask, setShowAddTask] = useState(null); // day name when adding task
  const [studyPlanLimits, setStudyPlanLimits] = useState(null);
  const [savingPlan, setSavingPlan] = useState(false);
  
  // Motivational message state
  const [showMotivationalMessage, setShowMotivationalMessage] = useState(false);
  const [motivationalData, setMotivationalData] = useState({ duration: '', subject: '', type: 'success' });
  
  // Gamification state
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // --- NEW TIMER STATE ---
  const [timerState, setTimerState] = useState({
    activeDay: null,
    secondsLeft: 0,
    initialSeconds: 0,
    isRunning: false,
  });

  const { activeDay, secondsLeft, initialSeconds, isRunning } = timerState;

  // --- Study Plan Functions ---
  const fetchStudyPlanLimits = async () => {
    try {
      const response = await api.get(`/study-plans/${userId}/limits`);
      setStudyPlanLimits(response.data.limits);
    } catch (error) {
      // Error fetching study plan limits
    }
  };

  const saveStudyPlan = async () => {
    if (!userId) return;

    // Check limits before saving
    if (studyPlanLimits && !studyPlanLimits.isUnlimited && studyPlanLimits.remaining <= 0) {
      toast.error('Study plan limit reached. Upgrade to Pro for unlimited study plans!');
      return;
    }

    setSavingPlan(true);
    try {
      const weekStart = getWeekStart(currentWeek);
      const weekEnd = getWeekEnd(currentWeek);
      
      const planData = {
        title: `Week Plan - ${getWeekRange(currentWeek)}`,
        description: 'Weekly study plan',
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        detailedPlan: weekdays.map(day => ({
          day,
          tasks: plan?.detailedPlan?.find(d => d.day === day)?.tasks || [],
          totalTasks: plan?.detailedPlan?.find(d => d.day === day)?.tasks?.length || 0,
          completedTasks: plan?.detailedPlan?.find(d => d.day === day)?.tasks?.filter(t => t.completed)?.length || 0
        })),
        goals: goals,
        notes: notes
      };

      const response = await api.post(`/study-plans/${userId}`, planData);
      
      if (response.data.success) {
        toast.success('Study plan saved successfully!');
        setStudyPlanLimits(response.data.limits);
      } else {
        toast.error(response.data.message || 'Failed to save study plan');
      }
    } catch (error) {
      if (error.response?.data?.requiresUpgrade) {
        toast.error('Study plan limit reached. Upgrade to Pro for unlimited study plans!');
      } else {
        toast.error('Failed to save study plan');
      }
    } finally {
      setSavingPlan(false);
    }
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchAllData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const [planRes, checklistRes] = await Promise.all([
          api.get(`/homework/${userId}`),
          api.get(`/homeworklog/${userId}`),
        ]);

        // Initialize plan with current week structure
        const weekStart = getWeekStart(currentWeek);
        const weekStructure = weekdays.map((day, index) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + index);
          return {
            day,
            date: dayDate,
            tasks: [],
            completed: false
          };
        });

        if (planRes.data && planRes.data.length > 0) {
          // Map homework tasks to days
          planRes.data.forEach(task => {
            const taskDate = new Date(task.dueDate);
            const dayIndex = weekdays.findIndex(day => {
              const dayDate = new Date(weekStart);
              dayDate.setDate(weekStart.getDate() + weekdays.indexOf(day));
              return dayDate.toDateString() === taskDate.toDateString();
            });
            
            if (dayIndex !== -1) {
              weekStructure[dayIndex].tasks.push({
                id: task._id,
                title: task.title,
                subject: task.subject,
                dueDate: task.dueDate,
                completed: task.completed || false,
                priority: task.priority || 'medium'
              });
            }
          });
        }

        setPlan({ detailedPlan: weekStructure });

        if (checklistRes.data && checklistRes.data.tasks) {
          const completedDays = {};
          weekdays.forEach(day => {
            completedDays[day] = false;
          });
          setChecklist(completedDays);
        }
      } catch (err) {
        // Set default plan if no data
        const weekStart = getWeekStart(currentWeek);
        const weekStructure = weekdays.map((day, index) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + index);
          return {
            day,
            date: dayDate,
            tasks: [],
            completed: false
          };
        });
        setPlan({ detailedPlan: weekStructure });
        
        // Fetch study plan limits
        await fetchStudyPlanLimits();
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [userId, currentWeek]);

  // --- TIMER LOGIC ---

  const startTimer = useCallback((day, tasks) => {
    // Stop any existing timer
    setTimerState((prev) => ({ ...prev, isRunning: false }));

    const initialTime = tasksToSeconds(tasks);
    setTimerState({
      activeDay: day,
      secondsLeft: initialTime,
      initialSeconds: initialTime,
      isRunning: true,
    });
    toast.success(`Focus timer started for ${day}!`);
  }, []);

  const togglePause = () => {
    setTimerState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
    toast.success(isRunning ? "Timer paused." : "Timer resumed.");
  };

  const resetTimer = () => {
    setTimerState((prev) => ({
      ...prev,
      secondsLeft: prev.initialSeconds,
      isRunning: false,
    }));
    toast.success(`${activeDay} timer reset.`);
  };

  // Main countdown effect
  useEffect(() => {
    let interval = null;

    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setTimerState((prev) => {
          if (prev.secondsLeft <= 1) {
            clearInterval(interval);
            toast.success(`${prev.activeDay} study session completed! 🎉`);
            return {
              ...prev,
              secondsLeft: 0,
              isRunning: false,
              activeDay: null,
              initialSeconds: 0,
            };
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 };
        });
      }, 1000);
    } else if (secondsLeft === 0 && activeDay) {
      // Clear interval if somehow we reach 0 seconds outside the check above
      if (interval) clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, activeDay]); // Removed initialSeconds as dependency

  // --- Task Management Functions ---
  const addTask = (day, taskTitle) => {
    if (!taskTitle.trim()) return;
    
    const newTask = {
      id: Date.now().toString(),
      title: taskTitle.trim(),
      subject: 'General',
      dueDate: new Date().toISOString(),
      completed: false,
      priority: 'medium'
    };

    setPlan(prev => ({
      ...prev,
      detailedPlan: prev.detailedPlan.map(dayPlan => 
        dayPlan.day === day 
          ? { ...dayPlan, tasks: [...dayPlan.tasks, newTask] }
          : dayPlan
      )
    }));

    setShowAddTask(null);
    toast.success(`Task added to ${day}!`);
  };

  const toggleTask = (day, taskId) => {
    setPlan(prev => ({
      ...prev,
      detailedPlan: prev.detailedPlan.map(dayPlan => 
        dayPlan.day === day 
          ? {
              ...dayPlan,
              tasks: dayPlan.tasks.map(task =>
                task.id === taskId 
                  ? { ...task, completed: !task.completed }
                  : task
              )
            }
          : dayPlan
      )
    }));
    
    // Gamification: Award XP and check for achievements
    const task = plan?.detailedPlan?.find(d => d.day === day)?.tasks?.find(t => t.id === taskId);
    if (task && !task.completed) {
      // Task was just completed
      const newXp = xp + 10;
      setXp(newXp);
      
      // Check for level up
      const newLevel = Math.floor(newXp / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
      
      // Check for achievements
      checkAchievements();
      
      // Show motivational message
      setMotivationalData({
        duration: 'Task',
        subject: task.title,
        type: 'success'
      });
      setShowMotivationalMessage(true);
    }
  };

  const deleteTask = (day, taskId) => {
    setPlan(prev => ({
      ...prev,
      detailedPlan: prev.detailedPlan.map(dayPlan => 
        dayPlan.day === day 
          ? {
              ...dayPlan,
              tasks: dayPlan.tasks.filter(task => task.id !== taskId)
            }
          : dayPlan
      )
    }));
    toast.success("Task deleted!");
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    
    const goal = {
      id: Date.now().toString(),
      text: newGoal.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setGoals(prev => [...prev, goal]);
    setNewGoal('');
    toast.success("Goal added!");
  };

  const toggleGoal = (goalId) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, completed: !goal.completed }
          : goal
      )
    );
  };

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    toast.success("Goal deleted!");
  };

  // Gamification functions
  const checkAchievements = () => {
    const newAchievements = [];
    
    // First task achievement
    if (completedTasks === 1 && !achievements.includes('first_task')) {
      newAchievements.push('first_task');
    }
    
    // 10 tasks achievement
    if (completedTasks >= 10 && !achievements.includes('task_master')) {
      newAchievements.push('task_master');
    }
    
    // Perfect week achievement
    if (doneDaysCount === 7 && !achievements.includes('perfect_week')) {
      newAchievements.push('perfect_week');
    }
    
    // Streak achievements
    if (streak >= 3 && !achievements.includes('streak_starter')) {
      newAchievements.push('streak_starter');
    }
    
    if (streak >= 7 && !achievements.includes('streak_master')) {
      newAchievements.push('streak_master');
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      // Show achievement celebration
      setMotivationalData({
        duration: 'Achievement',
        subject: newAchievements[0],
        type: 'milestone'
      });
      setShowMotivationalMessage(true);
    }
  };

  const closeMotivationalMessage = () => {
    setShowMotivationalMessage(false);
  };

  // Daily motivation quotes
  const dailyQuotes = {
    Monday: "🚀 Start your week with energy and determination!",
    Tuesday: "💪 You're building momentum - keep going!",
    Wednesday: "🎯 Midweek focus - you're halfway there!",
    Thursday: "⚡ Push through - the weekend is almost here!",
    Friday: "🎉 Finish strong - TGIF energy!",
    Saturday: "🌟 Weekend productivity - you're unstoppable!",
    Sunday: "🔄 Reflect, recharge, and prepare for greatness!"
  };

  const getCurrentDayQuote = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return dailyQuotes[today] || "✨ Every day is a chance to be amazing!";
  };

  // --- Week Navigation ---
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  // --- API Handlers ---
  const toggleDay = async (day) => {
    const isCompleted = !checklist[day];
    const updated = { ...checklist, [day]: isCompleted };
    setChecklist(updated);

    try {
      // Update homework log
      await api.post(`/homeworklog/${userId}`, {
        weekStart: new Date().toISOString().split('T')[0],
        tasks: Object.entries(updated).map(([dayName, completed]) => ({
          title: `${dayName} Study Session`,
          completed,
          subject: "General",
          dueDate: new Date().toISOString()
        }))
      });
      
      toast.success(
        isCompleted ? `${day} marked as DONE! 🎉` : `${day} unchecked.`
      );
    } catch (err) {
      toast.error("Error updating day status.");
    }
  };

  const handleDoneAll = async () => {
    try {
      const finalChecklist = weekdays.reduce(
        (acc, day) => ({ ...acc, [day]: true }),
        {}
      );
      setChecklist(finalChecklist);

      await api.post(`/homework/chart/${userId}`, {
        completedDays: finalChecklist,
        markAllDone: true,
      });
      toast.success("WEEK COMPLETED! You earned a trophy! 🏆");
    } catch (err) {
      toast.error("Error submitting final completion.");
    }
  };

  // --- Calculated Values (Memoized for efficiency) ---
  const { totalTasks, totalHours, avgPerDay, doneDaysCount, completedTasks, totalGoals, completedGoals } = useMemo(() => {
    const activeDays = plan?.detailedPlan?.filter((p) => weekdays.includes(p.day)) || [];
    const t = activeDays.reduce((sum, day) => sum + day.tasks.length, 0) || 0;
    const completed = activeDays.reduce((sum, day) => 
      sum + day.tasks.filter(task => task.completed).length, 0
    );
    const h = (t * 0.5).toFixed(1); // Assuming 30 minutes (0.5 hours) per task
    const avg = activeDays.length > 0 ? (t / activeDays.length).toFixed(1) : 0;
    const done = activeDays.filter((day) => checklist[day.day]).length;
    const totalG = goals.length;
    const completedG = goals.filter(goal => goal.completed).length;
    
    return {
      totalTasks: t,
      completedTasks: completed,
      totalHours: h,
      avgPerDay: avg,
      doneDaysCount: done,
      totalGoals: totalG,
      completedGoals: completedG,
    };
  }, [plan, checklist, goals]);

  const activeDayCount = plan?.detailedPlan?.filter((p) => weekdays.includes(p.day)).length || 0;
  const allDone = doneDaysCount === activeDayCount && activeDayCount > 0;
  const taskCompletionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;
  const goalCompletionRate = totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(1) : 0;

  // --- Chart Data & Options ---
  const chartData = useMemo(() => {
    if (!plan || !plan.detailedPlan) return null;
    const activePlan = plan.detailedPlan.filter((p) => weekdays.includes(p.day));

    return {
      labels: activePlan.map((day) => day.day),
      datasets: [
        {
          label: "Total Tasks",
          data: activePlan.map((day) => day.tasks.length),
          backgroundColor: "rgba(79, 70, 229, 0.8)",
          hoverBackgroundColor: "rgba(55, 48, 163, 1)",
          borderRadius: 10,
          borderSkipped: false,
        },
        {
          label: "Completed Tasks",
          data: activePlan.map((day) => day.tasks.filter(task => task.completed).length),
          backgroundColor: "rgba(16, 185, 129, 0.9)",
          hoverBackgroundColor: "rgba(5, 150, 105, 1)",
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    };
  }, [plan]);

  const doughnutData = useMemo(() => {
    return {
      labels: ['Completed', 'Remaining'],
      datasets: [
        {
          data: [completedTasks, totalTasks - completedTasks],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [completedTasks, totalTasks]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        titleFont: { size: 16, family: "Inter" },
        bodyFont: { size: 14, family: "Inter" },
        backgroundColor: "rgba(25, 25, 30, 0.9)",
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.08)", borderDash: [5, 5] },
        ticks: { font: { size: 12, family: "Inter" }, color: "#6b7280" },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 14, weight: "bold", family: "Inter" },
          color: "#374151",
        },
      },
    },
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-2xl font-light text-gray-700">
          Crafting your optimal plan visualization...
        </p>
      </div>
    );
  }

  // --- No Plan State ---
  if (!plan || !plan.detailedPlan || activeDayCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="max-w-xl text-center bg-white p-12 rounded-3xl shadow-2xl border-t-8 border-rose-500 transform hover:scale-[1.01] transition duration-300">
            <AlertTriangle className="w-12 h-12 mx-auto text-rose-500 mb-4" />
            <p className="text-3xl font-extrabold text-gray-800 mb-4">
              Plan Data Missing
            </p>
            <p className="text-lg text-gray-500 mb-6">
              It seems your personalized weekly plan hasn't been generated yet.
              Head over to the Homework module to create one!
            </p>
            <a
              href="/homework"
              className="mt-6 inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-10 rounded-full shadow-xl transition transform hover:scale-105"
            >
              <Send className="w-5 h-5" />
              <span>Generate New Plan</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Content ---
  return (
    <StudyPlanLimit>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 font-sans relative overflow-hidden">
      {/* Modern Geometric Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated geometric shapes */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"
        />
        <motion.div
          animate={{ 
            rotate: [360, 0],
            scale: [1, 0.8, 1],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-xl"
        />
        <motion.div
          animate={{ 
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-full blur-lg"
        />
        
        {/* Floating dots */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
              scale: [0.3, 1.2, 0.3],
              opacity: [0.1, 0.6, 0.1],
              rotate: [0, 360]
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2
            }}
            className="absolute w-3 h-3 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
        
        {/* Floating emojis */}
        {['🎯', '⭐', '🚀', '💪', '🎉', '🔥'].map((emoji, i) => (
          <motion.div
            key={emoji}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 10, -10, 0],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5
            }}
            className="absolute text-2xl opacity-20"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`
            }}
          >
            {emoji}
          </motion.div>
        ))}
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <Navbar />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Modern Professional Header */}
        <motion.header 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <CalendarDays className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                  
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Weekly Planner
                    </h1>
                    <p className="text-gray-300 text-lg">
                      {getWeekRange(currentWeek)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {formatDate(getWeekStart(currentWeek))} - {formatDate(getWeekEnd(currentWeek))}
                    </p>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-blue-300 text-sm font-medium mt-2"
                    >
                      {getCurrentDayQuote()}
                    </motion.p>
                  </div>
                </div>
              
                {/* Modern Week Navigation */}
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToPreviousWeek}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToCurrentWeek}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    This Week
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveStudyPlan}
                    disabled={savingPlan}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingPlan ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {savingPlan ? 'Saving...' : 'Save Plan'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToNextWeek}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Modern View Mode Tabs */}
              <div className="flex gap-3 mt-6">
                {[
                  { id: 'plan', label: 'Plan', icon: Calendar, color: 'from-blue-500 to-cyan-500' },
                  { id: 'tasks', label: 'Tasks', icon: ListChecks, color: 'from-green-500 to-emerald-500' },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'from-orange-500 to-red-500' }
                ].map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewMode(tab.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      viewMode === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                        : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Modern Active Timer Card */}
        <AnimatePresence>
          {activeDay && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed bottom-6 right-6 z-50 w-80"
            >
              <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Timer className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">Focus Session</p>
                      <h3 className="text-lg font-bold text-white">{activeDay}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <motion.p 
                    animate={isRunning ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    className={`text-4xl font-bold ${isRunning ? "text-white" : "text-white/60"}`}
                  >
                    {formatTime(secondsLeft)}
                  </motion.p>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-3 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      animate={{ 
                        width: `${((initialSeconds - secondsLeft) / initialSeconds) * 100}%`
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePause}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                      isRunning
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                        : "bg-white/20 hover:bg-white/30 text-white"
                    }`}
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isRunning ? "Pause" : "Resume"}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetTimer}
                    className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Content Based on Mode */}
        <AnimatePresence mode="wait">
          {viewMode === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              {/* Modern Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Gamification Card */}
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 }}
                  className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-xl"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white ml-3">Level {level}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* XP Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80 text-sm">Experience Points</span>
                        <span className="text-white font-bold">{xp} XP</span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(xp % 100)}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{xp % 100}/100</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Streak */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-white/80 text-sm">Streak</span>
                      </div>
                      <span className="text-orange-400 font-bold">{streak} days</span>
                    </div>
                    
                    {/* Achievements */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Award className="w-4 h-4 text-purple-400" />
                        <span className="text-white/80 text-sm">Achievements</span>
                        <span className="text-purple-400 font-bold text-sm">({achievements.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {achievements.slice(0, 4).map((achievement, index) => (
                          <motion.div
                            key={achievement}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center"
                            title={achievement.replace('_', ' ')}
                          >
                            <Star className="w-4 h-4 text-white" />
                          </motion.div>
                        ))}
                        {achievements.length > 4 && (
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">+{achievements.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Progress Stats */}
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-xl"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white ml-3">Progress</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Tasks Completed</span>
                      <span className="text-2xl font-bold text-white">{completedTasks}/{totalTasks}</span>
                    </div>
                    
                    <div className="relative">
                      <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${taskCompletionRate}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{taskCompletionRate}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-white">{totalTasks}</div>
                        <div className="text-white/60 text-xs">Total</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-green-400">{completedTasks}</div>
                        <div className="text-white/60 text-xs">Done</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Goals Section */}
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-xl"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white ml-3">Goals</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {goals.map((goal, index) => (
                      <motion.div 
                        key={goal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300"
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleGoal(goal.id)}
                          className="flex-shrink-0"
                        >
                          {goal.completed ? (
                            <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                              <CheckSquare className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-white/40 rounded-lg hover:border-white/60 transition-colors"></div>
                          )}
                        </motion.button>
                        <span className={`flex-1 text-sm text-white ${goal.completed ? 'line-through text-white/60' : 'text-white'}`}>
                          {goal.text}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteGoal(goal.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="flex gap-2 mt-4"
                    >
                      <input
                        type="text"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="Add a goal..."
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addGoal}
                        className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Notes Section */}
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-xl"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white ml-3">Notes</h3>
                  </div>
                  
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for this week..."
                    className="w-full h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none transition-all duration-300 text-sm"
                  />
                </motion.div>
              </div>

              {/* Modern Weekly Calendar Grid */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="lg:col-span-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                  {plan?.detailedPlan?.map((dayPlan, index) => (
                      <motion.div 
                        key={dayPlan.day}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ 
                          scale: 1.02, 
                          y: -5,
                          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                        }}
                        className="bg-white/5 backdrop-blur-2xl rounded-2xl p-4 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                      >
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-white mb-2">{dayPlan.day}</h3>
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto group-hover:from-purple-500 group-hover:to-pink-600 transition-all duration-300"
                        >
                          <span className="text-white font-bold text-lg">{dayPlan.date.getDate()}</span>
                        </motion.div>
                        
                        {/* Fun Timer Button */}
                        {dayPlan.tasks.length > 0 && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startTimer(dayPlan.day, dayPlan.tasks)}
                            className="mt-3 w-full py-2 px-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-xs font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-1"
                          >
                            <Timer className="w-3 h-3" />
                            Start Timer
                          </motion.button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {dayPlan.tasks.map((task, taskIndex) => (
                          <motion.div 
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: taskIndex * 0.1 }}
                            whileHover={{ 
                              scale: 1.02, 
                              x: 5,
                              backgroundColor: "rgba(255, 255, 255, 0.15)"
                            }}
                            className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${
                              task.completed 
                                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30' 
                                : 'bg-white/10 hover:bg-white/20 border border-transparent hover:border-white/20'
                            }`}
                          >
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleTask(dayPlan.day, task.id)}
                              className="flex-shrink-0"
                            >
                              {task.completed ? (
                                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                                  <CheckSquare className="w-2 h-2 text-white" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 border-2 border-white/40 rounded-lg hover:border-white/60 transition-colors"></div>
                              )}
                            </motion.button>
                            <span className={`flex-1 text-xs text-white ${task.completed ? 'line-through text-white/60' : 'text-white'}`}>
                              {task.title}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteTask(dayPlan.day, task.id)}
                              className="text-red-400 hover:text-red-300 transition-colors p-1"
                            >
                              <X className="w-3 h-3" />
                            </motion.button>
                          </motion.div>
                        ))}
                        
                        {showAddTask === dayPlan.day ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex gap-2"
                          >
                            <input
                              type="text"
                              placeholder="Add task..."
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-xs"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addTask(dayPlan.day, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              autoFocus
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setShowAddTask(null)}
                              className="text-white/60 hover:text-white transition-colors p-1"
                            >
                              <X className="w-3 h-3" />
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowAddTask(dayPlan.day)}
                            className="w-full py-2 text-xs text-white/80 hover:text-white border-2 border-dashed border-white/30 rounded-lg hover:border-blue-400 hover:bg-white/5 transition-all duration-300"
                          >
                            <Plus className="w-3 h-3 mx-auto mb-1" />
                            Add Task
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

        {/* Modern Task View */}
        {viewMode === 'tasks' && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {plan?.detailedPlan?.map((dayPlan, index) => (
              <motion.div 
                key={dayPlan.day}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{dayPlan.date.getDate()}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{dayPlan.day}</h3>
                      <p className="text-white/60 text-sm">{dayPlan.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{dayPlan.tasks.length}</div>
                    <div className="text-white/60 text-sm">Tasks</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayPlan.tasks.map((task, taskIndex) => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: taskIndex * 0.1 }}
                      className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                        task.completed 
                          ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/50' 
                          : 'bg-white/10 border-white/20 hover:border-blue-400/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleTask(dayPlan.day, task.id)}
                          className="flex-shrink-0 mt-1"
                        >
                          {task.completed ? (
                            <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                              <CheckSquare className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-white/40 rounded-lg hover:border-white/60 transition-colors"></div>
                          )}
                        </motion.button>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-base mb-1 ${task.completed ? 'line-through text-white/60' : 'text-white'}`}>
                            {task.title}
                          </h4>
                          <p className="text-white/60 text-sm mb-2">{task.subject}</p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                              task.priority === 'high' ? 'bg-red-500/20 text-red-300 border border-red-400/50' :
                              task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/50' :
                              'bg-green-500/20 text-green-300 border border-green-400/50'
                            }`}>
                              {task.priority}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteTask(dayPlan.day, task.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {dayPlan.tasks.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full text-center py-8"
                    >
                      <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <ListChecks className="w-8 h-8 text-white/40" />
                      </div>
                      <p className="text-white/60">No tasks for {dayPlan.day}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Modern Analytics View */}
        {viewMode === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Task Distribution Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-xl"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white ml-3">Task Distribution</h3>
              </div>
              <div className="h-64">
                {chartData && <Bar data={chartData} options={chartOptions} />}
              </div>
            </motion.div>

            {/* Completion Rate Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-xl"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white ml-3">Completion Rate</h3>
              </div>
              <div className="h-64 flex items-center justify-center">
                {doughnutData && <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />}
              </div>
            </motion.div>

            {/* Weekly Stats */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-xl"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white ml-3">Statistics</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{totalTasks}</div>
                  <div className="text-white/60 text-sm">Total Tasks</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">{completedTasks}</div>
                  <div className="text-white/60 text-sm">Completed</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{taskCompletionRate}%</div>
                  <div className="text-white/60 text-sm">Completion Rate</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">{totalHours}h</div>
                  <div className="text-white/60 text-sm">Estimated Time</div>
                </div>
              </div>
            </motion.div>

            {/* Goals Progress */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-xl"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white ml-3">Goals Progress</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-white">{totalGoals}</div>
                    <div className="text-white/60 text-xs">Total Goals</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-green-400">{completedGoals}</div>
                    <div className="text-white/60 text-xs">Completed</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">Goal Completion</span>
                    <span className="text-lg font-bold text-white">{goalCompletionRate}%</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${goalCompletionRate}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

      </div>
    </div>
    
    {/* Celebration Animation */}
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 0.6, repeat: 3 }}
              className="text-8xl mb-4"
            >
              🎉
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Level Up!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/80"
            >
              You're now Level {level}!
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    
    {/* Motivational Message Modal */}
    <MotivationalMessage
      isVisible={showMotivationalMessage}
      duration={motivationalData.duration}
      subject={motivationalData.subject}
      type={motivationalData.type}
      onClose={closeMotivationalMessage}
    />
    </StudyPlanLimit>
  );
};

export default WeekPlan;
