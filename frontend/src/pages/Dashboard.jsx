import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageSEO from "../components/PageSEO";
import api from "../utils/axios";
import { useTheme } from "../contexts/ThemeContext";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  BookOpenIcon,
  TrophyIcon,
  StarIcon,
  CalendarIcon,
  DocumentIcon,
  FolderIcon,
  SparklesIcon, // Used for the Study Tools quick link
  ArrowTopRightOnSquareIcon, // Added for external link icon
} from "@heroicons/react/24/outline";
import { GraduationCap, BookOpen, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Brain } from "lucide-react";
import MotivationalMessage from '../components/MotivationalMessage';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
);

// Custom Chart.js Global Config for dark theme (outside of component for efficiency)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(30, 41, 59, 0.9)', // slate-800
      titleColor: '#f8fafc', // slate-50
      bodyColor: '#cbd5e1', // slate-300
      borderColor: 'rgba(100, 116, 139, 0.5)', // slate-500
      borderWidth: 1,
      borderRadius: 6,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 80,
      ticks: {
        color: '#94a3b8', // slate-400
        font: { size: 12 }
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.1)', // subtle grid lines
      }
    },
    x: {
      ticks: {
        color: '#94a3b8',
        font: { size: 12 }
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.1)'
      }
    }
  }
};

const Dashboard = () => {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const userId = localStorage.getItem("userId");
  const [username, setUsername] = useState(localStorage.getItem("username") || "Student");
  const [world, setWorld] = useState(null);
  const [progress, setProgress] = useState(null);
  const [weeklyLog, setWeeklyLog] = useState([]);
  const [homeworkChart, setHomeworkChart] = useState({ labels: [], data: [] });
        const [classroomData, setClassroomData] = useState({ courses: [], assignments: [], upcoming: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsClassroomAuth, setNeedsClassroomAuth] = useState(false);
  const [hasClassroomError, setHasClassroomError] = useState(false);
  
  // Study logging state
  const [studySession, setStudySession] = useState({
    homeworkName: "",
    duration: "",
    feedback: ""
  });
  const [submittingStudy, setSubmittingStudy] = useState(false);
  const [recentStudySessions, setRecentStudySessions] = useState([]);
  const [studyTimeLimits, setStudyTimeLimits] = useState(null);
  
  // Motivational message state
  const [showMotivationalMessage, setShowMotivationalMessage] = useState(false);
  const [motivationalData, setMotivationalData] = useState({ duration: '', subject: '', type: 'success' });

  // Set week start to Monday (add 1 day to Sunday start)
  const weekStart = dayjs().startOf("week").add(1, "day").format("YYYY-MM-DD");

  // Handle user data from URL parameters (Google OAuth redirect)
  useEffect(() => {
    const userParam = searchParams.get('user');
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        setUsername(userData.username || userData.firstName || "Student");
        localStorage.setItem("username", userData.username || userData.firstName || "Student");
        localStorage.setItem("userId", userData.id);
        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        let currentUserId = userId;
        
        // First, try to get user data from the session
        try {
          const userRes = await api.get('/auth/google/success');
          if (userRes.status === 200) {
            const userData = userRes.data;
            setUsername(userData.user.username || userData.user.firstName || "Student");
            localStorage.setItem("username", userData.user.username || userData.user.firstName || "Student");
            currentUserId = userData.user.id;
            localStorage.setItem("userId", userData.user.id);
          }
        } catch (userErr) {
          console.log('Could not fetch user data, using localStorage');
        }

        // If no userId, skip API calls
        if (!currentUserId) {
          console.log('No userId available, skipping API calls');
          setLoading(false);
          return;
        }

        console.log('Fetching data for userId:', currentUserId);

        // Use Promise.allSettled so one failure doesn't break everything
        const results = await Promise.allSettled([
          api.get(`/myworld/${currentUserId}`),
          api.get(`/homework/progress/${currentUserId}`),
          api.get(`/homeworklog/${currentUserId}`, { params: { weekStart } }),
          api.get(`/homework/chart/${currentUserId}`),
          api.get(`/google-classroom/${currentUserId}/assignments`)
        ]);
        
        // Process results - handle both fulfilled and rejected promises
        const worldRes = results[0].status === 'fulfilled' ? results[0].value : { data: null };
        const progressRes = results[1].status === 'fulfilled' ? results[1].value : { data: null };
        const logRes = results[2].status === 'fulfilled' ? results[2].value : { data: { tasks: [] } };
        const chartRes = results[3].status === 'fulfilled' ? results[3].value : { data: { labels: [], data: [] } };
        const classroomRes = results[4].status === 'fulfilled' 
          ? results[4].value 
          : { data: { success: false, assignments: [] } };
        
        // Handle Google Classroom response
        if (classroomRes.data?.needsReauth || classroomRes.status === 403) {
          setNeedsClassroomAuth(true);
          setHasClassroomError(true);
          if (classroomRes.data?.authUrl) {
            window._classroomAuthUrl = classroomRes.data.authUrl;
          }
        }
        
        // Handle Google Classroom errors
        if (results[4].status === 'rejected') {
          const err = results[4].reason;
          if (err?.response?.status === 403 || err?.response?.data?.needsReauth) {
            setNeedsClassroomAuth(true);
            setHasClassroomError(true);
            if (err.response?.data?.authUrl) {
              window._classroomAuthUrl = err.response.data.authUrl;
            }
          }
        }
        
        // Check if critical API calls failed
        const criticalFailures = [];
        if (results[0].status === 'rejected') {
          console.error('Failed to load MyWorld:', results[0].reason);
          criticalFailures.push('MyWorld');
        }
        if (results[1].status === 'rejected') {
          console.error('Failed to load progress:', results[1].reason);
          criticalFailures.push('Progress');
        }
        
        // Only show error if critical APIs failed (not Google Classroom)
        if (criticalFailures.length > 0 && !hasClassroomError) {
          setError(`Failed to load ${criticalFailures.join(', ')}. Please try again.`);
        }
        
        setWorld(worldRes.data);
        setProgress(progressRes.data);
        
        // If no weekly log data, try to get regular homework data
        let tasks = logRes.data?.tasks || [];
        if (tasks.length === 0) {
          try {
            const homeworkRes = await api.get(`/homework/${currentUserId}`);
            tasks = homeworkRes.data || [];
          } catch (homeworkErr) {
            console.log('No regular homework data available:', homeworkErr.message);
          }
        }
        
        setWeeklyLog(tasks);
        setHomeworkChart(chartRes.data || { labels: [], data: [] });
        
        // Process Google Classroom data
        const classroomData = results[4].status === 'fulfilled' 
          ? results[4].value.data 
          : (results[4].status === 'rejected' && results[4].reason?.response?.data 
            ? results[4].reason.response.data 
            : { success: false, assignments: [] });
            
        if (classroomData.success && classroomData.assignments) {
          const assignments = classroomData.assignments;
          const now = new Date();
          const upcoming = assignments.filter(assignment => {
            if (!assignment.dueDate) return false;
            const dueDate = new Date(assignment.dueDate.year, (assignment.dueDate.month || 1) - 1, assignment.dueDate.day || 1);
            return dueDate > now;
          }).length;
          
          const overdue = assignments.filter(assignment => {
            if (!assignment.dueDate) return false;
            const dueDate = new Date(assignment.dueDate.year, (assignment.dueDate.month || 1) - 1, assignment.dueDate.day || 1);
            return dueDate < now;
          }).length;
          
          setClassroomData({
            courses: [...new Set(assignments.map(a => a.courseInfo?.name).filter(Boolean))],
            assignments: assignments,
            upcoming: upcoming,
            overdue: overdue
          });
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
        
        // Only show error if it's not related to Google Classroom and not already handled
        if (!hasClassroomError && !needsClassroomAuth) {
          // Check if it's a critical error (not just Google Classroom)
          const isClassroomAuthError = err.message?.includes('Google Classroom') || 
                                       err.response?.status === 403;
          
          if (!isClassroomAuthError) {
            setError("Failed to load dashboard data. Please try again.");
          } else {
            // Google Classroom error - don't show error, show auth prompt instead
            setNeedsClassroomAuth(true);
            setHasClassroomError(true);
            console.log('Google Classroom requires authorization');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAll();
    }
  }, [userId, weekStart]);

  const totalTasks = weeklyLog.length;
  const completedTasks = weeklyLog.filter((task) => task.completed).length;
  const remainingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const hasChartData = homeworkChart.labels.length > 0 && homeworkChart.data.length > 0 && homeworkChart.data.some(d => d > 0);

  // Study logging functions
  const fetchStudyTimeLimits = async () => {
    try {
      const response = await api.get(`/studytime/${userId}/limits`);
      setStudyTimeLimits(response.data.limits);
    } catch (error) {
      console.error('Error fetching study time limits:', error);
    }
  };

  const fetchRecentStudySessions = async () => {
    try {
      const response = await api.get(`/studytime/${userId}`);
      const sessions = response.data.slice(0, 3).map((session, index) => ({
        id: session._id || session.id || `temp-${index}`,
        homeworkName: session.subject,
        duration: session.duration,
        feedback: session.notes || "",
        timestamp: dayjs(session.date).format("MMM D, YYYY [at] h:mm A"),
        productivity: session.productivity,
      }));
      setRecentStudySessions(sessions);
    } catch (error) {
      console.error('Error fetching recent study sessions:', error);
    }
  };

  const handleLogStudy = async () => {
    if (!studySession.homeworkName.trim() || !studySession.duration || isNaN(parseInt(studySession.duration)) || parseInt(studySession.duration) <= 0) {
      toast.error("Please fill in all required fields with valid data.");
      return;
    }

    if (studyTimeLimits && !studyTimeLimits.isUnlimited && studyTimeLimits.remaining <= 0) {
      toast.error('Daily study session limit reached. Upgrade to Pro for unlimited study sessions!');
      return;
    }

    try {
      setSubmittingStudy(true);
      
      const response = await api.post(`/studytime/${userId}`, {
        homeworkName: studySession.homeworkName.trim(),
        duration: parseInt(studySession.duration),
        feedback: studySession.feedback.trim(),
        date: dayjs().format("YYYY-MM-DD"),
        time: dayjs().format("HH:mm:ss")
      });

      // Update limits if response includes them
      if (response.data.limits) {
        setStudyTimeLimits(response.data.limits);
      } else {
        await fetchStudyTimeLimits();
      }

      // Refresh recent sessions
      await fetchRecentStudySessions();

      // Clear form
      setStudySession({
        homeworkName: "",
        duration: "",
        feedback: ""
      });

      toast.success("Study session logged successfully! 🎉");
      
      // Determine motivational message type based on session data
      let motivationalType = 'success';
      const sessionDuration = parseInt(studySession.duration);
      const totalTodaySessions = recentStudySessions.length + 1;
      
      // Check for milestones
      if (sessionDuration >= 120) {
        motivationalType = 'milestone'; // 2+ hours
      } else if (totalTodaySessions >= 5) {
        motivationalType = 'milestone'; // 5+ sessions today
      } else if (sessionDuration >= 60) {
        motivationalType = 'encouragement'; // 1+ hour
      }
      
      // Show motivational message
      setMotivationalData({
        duration: studySession.duration,
        subject: studySession.homeworkName.trim(),
        type: motivationalType
      });
      setShowMotivationalMessage(true);
    } catch (error) {
      console.error("Error logging study session:", error);
      if (error.response?.data?.requiresUpgrade) {
        toast.error('Daily study session limit reached. Upgrade to Pro for unlimited study sessions!');
      } else {
        toast.error("Failed to log study session. Please try again.");
      }
    } finally {
      setSubmittingStudy(false);
    }
  };

  // Fetch study data when component loads
  useEffect(() => {
    if (userId) {
      fetchStudyTimeLimits();
      fetchRecentStudySessions();
    }
  }, [userId]);

  // Close motivational message
  const closeMotivationalMessage = () => {
    setShowMotivationalMessage(false);
  };

  // --- Chart Data (using custom theme colors) ---

  const doughnutData = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [completedTasks, remainingTasks],
        backgroundColor: ["#10b981", "#f43f5e"], // emerald-500, rose-500
        borderColor: ["#059669", "#e11d48"], // emerald-600, rose-600
        borderWidth: 2,
      },
    ],
  };

  const lineData = {
    labels: hasChartData ? homeworkChart.labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: "Daily Completed Tasks",
        data: hasChartData ? homeworkChart.data : [0, 0, 0, 0, 0, 0, 0], // Empty data for placeholder
        borderColor: "#a78bfa", // violet-400
        backgroundColor: "rgba(167, 139, 250, 0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointBorderColor: "#a78bfa",
        pointBackgroundColor: "#f472b6", // pink-400
        pointBorderWidth: 2
      },
    ],
  };
  
  const barData = {
      labels: hasChartData ? homeworkChart.labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
          label: 'Completed Tasks',
          data: hasChartData ? homeworkChart.data : [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: '#38bdf8', // sky-400
          borderColor: '#0ea5e9', // sky-500
          borderWidth: 2,
          borderRadius: 6,
      }]
  };


  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-700/50 ring-1 ring-slate-700/80 animate-pulse">
            <div className="h-5 bg-slate-600 rounded w-2/5 mb-3"></div>
            <div className="h-10 bg-slate-600 rounded w-3/5"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-700/50 ring-1 ring-slate-700/80 animate-pulse">
            <div className="h-8 bg-slate-600 rounded w-1/4 mb-6"></div>
            <div className="h-80 bg-slate-600 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const NoDataMessage = ({ title, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Icon className="h-12 w-12 text-pink-400 mb-4 opacity-70" />
        <h3 className="text-xl font-semibold text-white mb-2">No Data Yet!</h3>
        <p className="text-gray-400">Log some tasks or wait for your progress to update to see your {title}.</p>
    </div>
);


  return (
    <>
      <PageSEO page="dashboard" />
      <div className="min-h-screen page-bg relative overflow-hidden">
      {/* Background decoration with stronger color accents */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <Navbar />
      
      <div className="flex relative z-10">
        {/* Quick Access Sidebar */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="hidden xl:flex w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 p-6 flex-col shadow-2xl"
        >
          {/* Quick Access Section */}
          <div className="mb-8">
            <h3 className="text-cyan-400 text-lg font-extrabold tracking-wider mb-6 border-b border-cyan-400/20 pb-3">QUICK ACCESS</h3>
            <div className="space-y-3">
              {[
                { icon: Brain, label: "AI Assistant", color: "text-purple-400", href: "/ai-assistant" },
                { icon: ArrowTopRightOnSquareIcon, label: "Google Classroom", color: "text-blue-400", href: "https://classroom.google.com" },
                { icon: SparklesIcon, label: "Study Tools", color: "text-purple-400", href: "/flashcard" },
                { icon: DocumentIcon, label: "Study Notes", color: "text-green-400", href: "/study-notes" },
                { icon: StarIcon, label: "Sparks Maths", color: "text-yellow-400", href: "https://sparxmaths.com/" },
                { icon: CalendarIcon, label: "Study Planner", color: "text-orange-400", href: "/week-plan" },
                { icon: ClockIcon, label: "Focus Timer", color: "text-pink-400", href: "/study-timer" },
                { icon: FolderIcon, label: "Documents", color: "text-cyan-400", href: "/documents" },
              ].map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : '_self'}
                  whileHover={{ x: 8, scale: 1.05 }}
                  className="flex items-center px-4 py-3 rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-700/70 transition-all duration-300 group ring-1 ring-transparent hover:ring-purple-500/50"
                >
                  <item.icon className={`h-5 w-5 mr-3 ${item.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-gray-200 text-sm font-medium group-hover:text-white transition-colors">{item.label}</span>
                  {item.href.startsWith('http') && <ArrowTopRightOnSquareIcon className="ml-auto h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">

          {/* Dashboard Content */}
          <div className="flex-1 p-3 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto">
            
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 sm:mb-8 lg:mb-10"
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{username || "Student"}</span>!
              </h1>
              <p className="text-slate-400 text-sm sm:text-base lg:text-lg">Here's your weekly progress update and study dashboard. Keep up the great work! ✨</p>
            </motion.header>

            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-lg mx-auto backdrop-blur-sm shadow-xl ring-2 ring-red-500/20">
                  <div className="text-red-400 text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-bold text-red-300 mb-3">Oops! Data Load Failed</h3>
                  <p className="text-red-400 mb-6">{error}</p>
                    <button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-red-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-red-700 transition-all duration-300"
                    >
                    Refresh Dashboard
                    </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Top Stats Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10"
                >
                  {[
                    { icon: BookOpenIcon, label: "Total Tasks", value: totalTasks, color: "from-blue-500 to-cyan-500", text: "text-blue-400", detail: "Total tasks this week" },
                    { icon: CheckCircleIcon, label: "Completed Tasks", value: completedTasks, color: "from-green-500 to-emerald-500", text: "text-green-400", detail: "Finished tasks this week" },
                    { icon: ClockIcon, label: "Remaining Tasks", value: remainingTasks, color: "from-orange-500 to-red-500", text: "text-orange-400", detail: "Pending tasks this week" },
                    { icon: TrophyIcon, label: "Completion Rate", value: `${completionPercentage}%`, color: "from-purple-500 to-pink-500", text: "text-purple-400", detail: "Weekly percentage" },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ scale: 1.05, y: -8, rotate: -0.5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-slate-800/50 backdrop-blur-xl p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-xl ring-1 ring-slate-700/80 cursor-pointer hover:shadow-glow-purple"
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className={`p-2 sm:p-3 bg-gradient-to-r ${stat.color} rounded-lg sm:rounded-xl shadow-lg shadow-black/30`}>
                          <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                        </div>
                        <span className={`text-xs sm:text-xs font-bold ${stat.text} uppercase tracking-wider hidden sm:block`}>{stat.label}</span>
                      </div>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-1">{stat.value}</p>
                      <p className="text-xs sm:text-sm text-gray-400">{stat.detail}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Quick Study Logging Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-6 sm:mb-8 lg:mb-10"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Study Session Logger */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="bg-slate-800/50 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/50 ring-1 ring-purple-500/20 transition-all duration-300 hover:ring-purple-500/50"
                    >
                      <div className="flex items-center mb-4 sm:mb-6">
                        <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl mr-3 sm:mr-4 shadow-lg">
                          <BookOpenIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Quick Study Log</h2>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Subject Input */}
                        <div>
                          <label className="block text-gray-300 text-sm font-semibold mb-2">Subject/Topic</label>
                          <input
                            type="text"
                            value={studySession.homeworkName}
                            onChange={(e) => setStudySession({...studySession, homeworkName: e.target.value})}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                            placeholder="e.g. Math Algebra, Science Biology"
                          />
                        </div>

                        {/* Duration Input */}
                        <div>
                          <label className="block text-gray-300 text-sm font-semibold mb-2">Duration (minutes)</label>
                          <input
                            type="number"
                            value={studySession.duration}
                            onChange={(e) => setStudySession({...studySession, duration: e.target.value})}
                            min="1"
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                            placeholder="e.g. 45"
                          />
                        </div>

                        {/* Feedback Input */}
                        <div>
                          <label className="block text-gray-300 text-sm font-semibold mb-2">Notes (optional)</label>
                          <textarea
                            value={studySession.feedback}
                            onChange={(e) => setStudySession({...studySession, feedback: e.target.value})}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                            rows={3}
                            placeholder="How did the study session go? What did you learn?"
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          onClick={handleLogStudy}
                          disabled={!studySession.homeworkName.trim() || !studySession.duration || submittingStudy}
                          className="w-full flex justify-center items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingStudy ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Logging Session...
                            </>
                          ) : (
                            <>
                              <BookOpenIcon className="w-5 h-5 mr-2" />
                              Log Study Session
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>

                    {/* Recent Study Sessions */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="bg-slate-800/50 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/50 ring-1 ring-blue-500/20 transition-all duration-300 hover:ring-blue-500/50"
                    >
                      <div className="flex items-center mb-4 sm:mb-6">
                        <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl mr-3 sm:mr-4 shadow-lg">
                          <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Recent Sessions</h2>
                      </div>
                      
                      <div className="space-y-3">
                        {recentStudySessions.length > 0 ? (
                          recentStudySessions.map((session, index) => (
                            <div key={session.id || index} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-white font-semibold text-sm truncate">{session.homeworkName}</h3>
                                <span className="text-blue-400 text-xs font-semibold">{session.duration}min</span>
                              </div>
                              <p className="text-gray-400 text-xs">{session.timestamp}</p>
                              {session.feedback && (
                                <p className="text-gray-300 text-xs mt-2 line-clamp-2">{session.feedback}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">No study sessions yet</p>
                            <p className="text-gray-500 text-xs">Log your first session to see it here!</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Charts Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-10"
                >
                  {/* Weekly Study Progress Bar Chart */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-slate-800/50 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/50 ring-1 ring-purple-500/20 transition-all duration-300 hover:ring-purple-500/50"
                  >
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl mr-3 sm:mr-4 shadow-lg">
                        <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Daily Task Count</h2>
                    </div>
                    <div className="h-60 sm:h-72 lg:h-80">
                        {hasChartData ? (
                            <Bar data={barData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: true, labels: { color: '#94a3b8' } } } }} />
                        ) : (
                            <NoDataMessage title="Daily Task Count" icon={ChartBarIcon} />
                        )}
                    </div>
                  </motion.div>

                  {/* Task Completion Doughnut Chart */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-slate-800/50 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/50 ring-1 ring-green-500/20 transition-all duration-300 hover:ring-green-500/50"
                  >
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg sm:rounded-xl mr-3 sm:mr-4 shadow-lg">
                        <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Task Completion Overview</h2>
                    </div>
                    <div className="flex flex-col lg:flex-row items-center justify-center h-60 sm:h-72 lg:h-80 pt-4 sm:pt-6 lg:pt-8">
                      <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-8">
                        {/* Doughnut Chart */}
                        <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 mt-2 sm:mt-4">
                          {totalTasks > 0 ? (
                            <Doughnut
                              data={{
                                labels: ['Completed Tasks', 'Remaining Tasks'],
                                datasets: [{
                                  data: [completedTasks, remainingTasks],
                                  backgroundColor: ['#10b981', '#f43f5e'],
                                  borderColor: ['#059669', '#e11d48'],
                                  borderWidth: 3
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '70%',
                                plugins: {
                                  tooltip: chartOptions.plugins.tooltip,
                                  legend: {
                                    display: false
                                  }
                                }
                              }}
                            />
                          ) : (
                            <NoDataMessage title="Task Completion" icon={TrophyIcon} />
                          )}
                        </div>

                        {/* Percentage Display */}
                        {totalTasks > 0 && (
                          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                            <div className="text-center">
                              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                                {completionPercentage}%
                              </div>
                              <div className="text-sm sm:text-base lg:text-lg text-gray-400 font-medium tracking-wider">COMPLETED</div>
                            </div>
                            
                            {/* Key/Legend */}
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full"></div>
                                <span className="text-white font-medium text-sm sm:text-base">Completed Tasks</span>
                                <span className="text-emerald-400 font-bold text-sm sm:text-base">{completedTasks}</span>
                              </div>
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-rose-500 rounded-full"></div>
                                <span className="text-white font-medium text-sm sm:text-base">Remaining Tasks</span>
                                <span className="text-rose-400 font-bold text-sm sm:text-base">{remainingTasks}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Google Classroom Authorization Prompt */}
                {needsClassroomAuth && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="mb-6 sm:mb-8"
                  >
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-yellow-500/30 ring-1 ring-yellow-500/20 transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center">
                          <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg sm:rounded-xl mr-3 sm:mr-4 shadow-lg">
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">Google Classroom Access Required</h2>
                            <p className="text-slate-400 text-sm sm:text-base">Authorize access to sync your Classroom assignments and courses</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const backendUrl = import.meta.env.VITE_API_URL 
                              ? import.meta.env.VITE_API_URL.replace('/api', '')
                              : import.meta.env.PROD 
                                ? '' 
                                : 'http://localhost:5001';
                            const authUrl = window._classroomAuthUrl || `${backendUrl}/api/auth/google-classroom`;
                            window.location.href = authUrl;
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center space-x-2 shadow-lg"
                        >
                          <GraduationCap className="h-5 w-5" />
                          <span>Authorize Google Classroom</span>
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Google Classroom Section */}
                {classroomData.assignments.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="mb-6 sm:mb-8"
                  >
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-500/30 ring-1 ring-blue-500/20 transition-all duration-300 hover:ring-blue-500/50"
                    >
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center">
                          <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg sm:rounded-xl mr-3 sm:mr-4 shadow-lg">
                            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                          </div>
                          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Google Classroom</h2>
                        </div>
                        <a 
                          href="/google-classroom"
                          className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium flex items-center space-x-1"
                        >
                          <span>View All</span>
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-white/5 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <BookOpen className="h-5 w-5 text-blue-400" />
                            <span className="text-white font-medium">Courses</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{classroomData.courses.length}</p>
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-5 w-5 text-orange-400" />
                            <span className="text-white font-medium">Upcoming</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{classroomData.upcoming}</p>
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <span className="text-white font-medium">Overdue</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{classroomData.overdue}</p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Bottom Section - Ongoing Tasks and Trend */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8"
                >
                  {/* Current Tasks List */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-slate-800/50 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/50 ring-1 ring-cyan-500/20 transition-all duration-300 hover:ring-cyan-500/50"
                  >
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl mr-3 sm:mr-4 shadow-lg">
                        <FolderIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Current Tasks (Weekly Log)</h2>
                    </div>
                    <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {weeklyLog.length > 0 ? weeklyLog.slice(0, 5).map((task, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * index }}
                          whileHover={{ scale: 1.01, backgroundColor: 'rgba(30, 41, 59, 0.7)' }}
                          className="bg-slate-700/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-600/50 cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center flex-1 min-w-0">
                              <DocumentIcon className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 ${task.completed ? 'text-emerald-400' : 'text-pink-400'} flex-shrink-0`} />
                              <div className="min-w-0">
                                <h3 className="text-white font-semibold truncate text-sm sm:text-base">{task.title}</h3>
                                <p className="text-gray-400 text-xs truncate">{task.description || task.subject || 'No description'}</p>
                              </div>
                            </div>
                            <div className="ml-2 sm:ml-4 text-right flex-shrink-0">
                                <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${task.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-pink-500/20 text-pink-300'}`}>
                                    {task.completed ? 'DONE' : 'IN PROGRESS'}
                                </span>
                              <p className="text-gray-400 text-xs mt-1">
                                {task.dueDate ? dayjs(task.dueDate).format('MMM D') : 'No Due Date'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )) : (
                        <NoDataMessage title="Current Tasks" icon={FolderIcon} />
                      )}
                    </div>
                  </motion.div>

                  {/* Study Progress Trend Line Chart */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-slate-800/50 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/50 ring-1 ring-pink-500/20 transition-all duration-300 hover:ring-pink-500/50"
                  >
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="p-2 sm:p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg sm:rounded-xl mr-3 sm:mr-4 shadow-lg">
                        <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Cumulative Progress Trend</h2>
                    </div>
                    <div className="h-60 sm:h-72 lg:h-80">
                        {hasChartData ? (
                            <Line data={lineData} options={chartOptions} />
                        ) : (
                            <NoDataMessage title="Progress Trend" icon={ChartBarIcon} />
                        )}
                    </div>
                  </motion.div>
                </motion.div>

              </>
            )}
          </div>
        </div>
      </div>
      {/* Styles for the custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #1e293b; /* slate-800 */
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #a78bfa; /* violet-400 */
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #c084fc; /* violet-500 */
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .shadow-glow-purple:hover {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4), 0 0 10px rgba(236, 72, 153, 0.2);
        }
      `}</style>
      
      {/* Motivational Message Modal */}
      <MotivationalMessage
        isVisible={showMotivationalMessage}
        duration={motivationalData.duration}
        subject={motivationalData.subject}
        type={motivationalData.type}
        onClose={closeMotivationalMessage}
      />
    </div>
    </>
  );
};

export default Dashboard;