import React, { useState, useEffect } from "react";
import api from "../utils/axios";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

// Helper icon imports
import {
  BookOpenIcon,
  ClockIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import FeatureGate from "../components/FeatureGate";
import StudyTimeLimit from "../components/StudyTimeLimit";
import MotivationalMessage from "../components/MotivationalMessage";
import { FEATURES } from "../utils/featureGate";

const StudyTime = () => {
  const userId = localStorage.getItem("userId");
  const [homeworkName, setHomeworkName] = useState("");
  const [duration, setDuration] = useState("");
  const [feedback, setFeedback] = useState("");
  const [studyLog, setStudyLog] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [todaySessionCount, setTodaySessionCount] = useState(0);
  const [studyTimeLimits, setStudyTimeLimits] = useState(null);
  
  // Motivational message state
  const [showMotivationalMessage, setShowMotivationalMessage] = useState(false);
  const [motivationalData, setMotivationalData] = useState({ duration: '', subject: '', type: 'success' });

  // Fetch study time limits
  const fetchStudyTimeLimits = async () => {
    try {
      const response = await api.get(`/studytime/${userId}/limits`);
      setStudyTimeLimits(response.data.limits);
    } catch (error) {
      console.error('Error fetching study time limits:', error);
    }
  };

  // Count today's sessions for limit checking
  useEffect(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const todaySessions = studyLog.filter(session => 
      dayjs(session.createdAt).format('YYYY-MM-DD') === today
    );
    setTodaySessionCount(todaySessions.length);
  }, [studyLog]);

  // Listen for subscription updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'subscriptionUpdated' || e.key === 'userSubscription') {
        fetchStudyTimeLimits();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch study sessions from backend when component loads
  useEffect(() => {
    const fetchStudySessions = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching study sessions for userId:", userId);
        
        const response = await api.get(`/studytime/${userId}`);
        console.log("Study sessions response:", response.data);
        console.log("First session structure:", response.data[0]);
        
        // Transform backend data to match frontend format
        const sessions = response.data.map((session, index) => ({
          id: session._id || session.id || `temp-${index}`, // Fallback to temp ID
          homeworkName: session.subject,
          duration: session.duration,
          feedback: session.notes || "",
          timestamp: dayjs(session.date).format("MMM D, YYYY [at] h:mm A"),
          productivity: session.productivity,
          originalData: session // Keep original data for debugging
        }));
        
        console.log("Transformed sessions:", sessions);
        setStudyLog(sessions);
        
        // Fetch study time limits
        await fetchStudyTimeLimits();
      } catch (error) {
        console.error("Error fetching study sessions:", error);
        toast.error("Failed to load study sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchStudySessions();
  }, [userId]);

  // Delete a study session
  const handleDeleteSession = async (sessionId, index) => {
    if (deleting) return;
    
    try {
      setDeleting(true);
      console.log("Deleting study session:", sessionId);
      console.log("Session ID type:", typeof sessionId);
      console.log("Session ID value:", sessionId);
      console.log("Full session object:", studyLog[index]);
      
      if (!sessionId || sessionId.startsWith('temp-')) {
        toast.error("Cannot delete session: Invalid session ID. Please refresh the page and try again.");
        return;
      }
      
      await api.delete(`/studytime/${userId}/${sessionId}`);
      
      // Remove from local state
      const updatedSessions = studyLog.filter((_, i) => i !== index);
      setStudyLog(updatedSessions);
      
      toast.success("Study session deleted successfully!");
    } catch (error) {
      console.error("Error deleting study session:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Failed to delete study session. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogStudy = async () => {
    // Basic validation
    if (
      !homeworkName.trim() ||
      !duration ||
      isNaN(parseInt(duration)) ||
      parseInt(duration) <= 0
    )
      return;

    // Check study time limits before creating session
    if (studyTimeLimits && !studyTimeLimits.isUnlimited && studyTimeLimits.remaining <= 0) {
      toast.error('Daily study session limit reached. Upgrade to Pro for unlimited study sessions!');
      return;
    }

    const newEntry = {
      homeworkName: homeworkName.trim(),
      duration: parseInt(duration),
      feedback: feedback.trim(),
      timestamp: dayjs().format("MMM D, YYYY [at] h:mm A"), // A more readable format
    };

    try {
      setSubmitting(true);
      
      // Save to backend
      const response = await api.post(`/studytime/${userId}`, {
        homeworkName: homeworkName.trim(),
        duration: parseInt(duration),
        feedback: feedback.trim(),
        date: dayjs().format("YYYY-MM-DD"),
        time: dayjs().format("HH:mm:ss")
      });

      // Update local state
      setStudyLog([newEntry, ...studyLog]);
      setHomeworkName("");
      setDuration("");
      setFeedback("");
      
      // Update limits if response includes them
      if (response.data.limits) {
        setStudyTimeLimits(response.data.limits);
      } else {
        // Refresh limits from backend
        await fetchStudyTimeLimits();
      }
      
      // Show success message
      toast.success("Study session logged successfully! 🎉");
      
      // Determine motivational message type based on session data
      let motivationalType = 'success';
      const sessionDuration = parseInt(duration);
      const totalTodaySessions = todaySessionCount + 1;
      
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
        duration: duration,
        subject: homeworkName.trim(),
        type: motivationalType
      });
      setShowMotivationalMessage(true);
      
      // Refresh study sessions from backend to ensure consistency
      try {
        const response = await api.get(`/studytime/${userId}`);
        const sessions = response.data.map((session, index) => ({
          id: session._id || session.id || `temp-${index}`, // Fallback to temp ID
          homeworkName: session.subject,
          duration: session.duration,
          feedback: session.notes || "",
          timestamp: dayjs(session.date).format("MMM D, YYYY [at] h:mm A"),
          productivity: session.productivity,
          originalData: session // Keep original data for debugging
        }));
        setStudyLog(sessions);
      } catch (refreshError) {
        console.error("Error refreshing study sessions:", refreshError);
      }
    } catch (error) {
      console.error("Error logging study session:", error);
      if (error.response?.data?.requiresUpgrade) {
        toast.error('Daily study session limit reached. Upgrade to Pro for unlimited study sessions!');
      } else {
        toast.error("Failed to log study session. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Close motivational message
  const closeMotivationalMessage = () => {
    setShowMotivationalMessage(false);
  };

  return (
    <StudyTimeLimit limits={studyTimeLimits}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />

      {/* Main card styling */}
      <div className="max-w-4xl mx-auto p-8 lg:p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl mt-12 mb-10 border-t-4 border-indigo-500 transform transition duration-500 hover:shadow-indigo-500/30">
        {/* Header Section with the new Timer Button */}
        <header className="mb-8 border-b pb-4 border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center">
              <RocketLaunchIcon className="w-8 h-8 mr-3 text-indigo-500" />
              Study Session Logger
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              Log your focused time to track your progress and goals.
            </p>
          </div>

          <div className="flex gap-2 space-x-2">
            {/* --- New Timer Button --- */}
            <Link
              to="/study-timer"
              // Prominent styling to draw attention
              className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-xl text-md font-semibold shadow-md shadow-purple-500/50 hover:bg-purple-700 transition duration-300 transform hover:scale-105"
            >
              <ClockIcon className="w-5 h-5 mr-2" />
              Start Timer
            </Link>
            
            {/* Refresh Limits Button */}
            <button
              onClick={fetchStudyTimeLimits}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-xl text-md font-semibold shadow-md shadow-blue-500/50 hover:bg-blue-700 transition duration-300 transform hover:scale-105"
              title="Refresh limits from backend"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          {/* ------------------------- */}
        </header>

        {/* Session Limit Warning */}
        {studyTimeLimits && !studyTimeLimits.isUnlimited && studyTimeLimits.remaining <= 0 && (
          <div className="mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">⚠️</span>
                </div>
                <div>
                  <p className="text-gray-800 dark:text-white font-semibold">Daily Session Limit Reached</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    You've reached your limit of {studyTimeLimits.max} sessions per day. 
                    Upgrade to Study Pro for unlimited sessions!
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}


        {/* Session Counter */}
        {studyTimeLimits && !studyTimeLimits.isUnlimited && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-gray-800 dark:text-white font-semibold">Today's Sessions</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {studyTimeLimits.current} / {studyTimeLimits.max} sessions used
                  </p>
                </div>
              </div>
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((studyTimeLimits.current / studyTimeLimits.max) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- Logging Form --- */}
        <section className="space-y-6">
          {/* Homework Name Input */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 flex items-center text-lg">
              <BookOpenIcon className="w-5 h-5 mr-2 text-indigo-500" />
              Homework/Subject Name
            </label>
            <input
              type="text"
              value={homeworkName}
              onChange={(e) => setHomeworkName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 text-lg placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              placeholder="e.g. Math Algebra, Science Biology, English Essay"
            />
          </div>

          {/* Duration Input */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 flex items-center text-lg">
              <ClockIcon className="w-5 h-5 mr-2 text-indigo-500" />
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 text-xl placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              placeholder="e.g. 45"
            />
          </div>

          {/* Feedback Input */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 flex items-center text-lg">
              <PencilSquareIcon className="w-5 h-5 mr-2 text-indigo-500" />
              Study Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              rows={4}
              placeholder="How did the study session go? What did you learn? Any challenges or insights?"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleLogStudy}
            disabled={!homeworkName.trim() || !duration || duration <= 0 || submitting}
            className="w-full flex justify-center items-center bg-indigo-600 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg shadow-indigo-500/50 hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400 disabled:shadow-none"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging Session...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-6 h-6 mr-2" />
                Log Study Session
              </>
            )}
          </button>
        </section>

        {/* --- Study Log Section --- */}
        {loading ? (
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading study sessions...</span>
            </div>
          </div>
        ) : studyLog.length > 0 ? (
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
              📋 Recent Study Log Entries
            </h3>

            <ul className="space-y-4">
              {studyLog.map((entry, index) => (
                <li
                  key={entry.id || index}
                  className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 hover:shadow-xl transition duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {entry.homeworkName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <strong className="font-semibold">Logged:</strong>{" "}
                        {entry.timestamp}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSession(entry.id, index)}
                      disabled={deleting}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Study Session"
                    >
                      {deleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                    <ClockIcon className="w-5 h-5 mr-1" />
                    <span className="text-lg">{entry.duration} minutes</span>
                  </div>

                  {entry.feedback && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border-l-2 border-indigo-200 dark:border-indigo-800">
                      <strong className="text-gray-800 dark:text-gray-200">
                        Feedback:
                      </strong>{" "}
                      {entry.feedback}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpenIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No Study Sessions Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Start logging your study sessions to track your progress!
              </p>
            </div>
          </div>
        )}
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
    </StudyTimeLimit>
  );
};

export default StudyTime;
