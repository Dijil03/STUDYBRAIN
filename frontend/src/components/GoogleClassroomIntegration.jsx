import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Users, 
  TrendingUp, 
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const GoogleClassroomIntegration = ({ userId, onAssignmentsSynced }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(false);

  useEffect(() => {
    checkGoogleClassroomConnection();
  }, [userId]);

  const checkGoogleClassroomConnection = async () => {
    try {
      setCheckingConnection(true);
      const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');
      const apiUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
      const response = await fetch(`${apiUrl}/google-classroom/${userId}/courses`);
      
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(true);
        setCourses(data.courses || []);
        loadAssignments();
        setError(null);
      } else if (data.needsReauth || response.status === 403) {
        // User needs to authorize Classroom access
        setIsConnected(false);
        setError('Google Classroom access not authorized');
        // Store auth URL for button
        if (data.authUrl) {
          window._classroomAuthUrl = data.authUrl;
        }
      } else {
        setIsConnected(false);
        setError(data.message || 'Failed to connect to Google Classroom');
      }
    } catch (err) {
      console.error('Error checking Google Classroom connection:', err);
      setIsConnected(false);
      setError('Failed to check Google Classroom connection');
    } finally {
      setCheckingConnection(false);
      setIsLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');
      const apiUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
      const response = await fetch(`${apiUrl}/google-classroom/${userId}/assignments`);
      const data = await response.json();
      
      if (data.success) {
        setAssignments(data.assignments || []);
        setError(null);
      } else if (data.needsReauth || response.status === 403) {
        setError('Google Classroom access not authorized');
        if (data.authUrl) {
          window._classroomAuthUrl = data.authUrl;
        }
      } else {
        setError(data.message || 'Failed to load assignments');
      }
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const syncAssignmentsToHomework = async () => {
    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');
      const apiUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
      const response = await fetch(`${apiUrl}/google-classroom/${userId}/sync-assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Assignments synced to homework:', data);
        if (onAssignmentsSynced) {
          onAssignmentsSynced(data.assignments);
        }
        alert(`Successfully synced ${data.totalCount} assignments to homework!`);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error syncing assignments:', err);
      setError('Failed to sync assignments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return 'No due date';
    const date = new Date(dateObj.year, (dateObj.month || 1) - 1, dateObj.day || 1);
    return date.toLocaleDateString();
  };

  const getUpcomingAssignments = () => {
    const now = new Date();
    return assignments.filter(assignment => {
      if (!assignment.dueDate) return false;
      const dueDate = new Date(assignment.dueDate.year, (assignment.dueDate.month || 1) - 1, assignment.dueDate.day || 1);
      return dueDate > now;
    }).slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-lg border border-slate-700/50 p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 text-blue-400 animate-spin mr-2" />
          <span className="text-white">Checking Google Classroom connection...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-lg border border-slate-700/50 p-6">
        <div className="text-center">
          <GraduationCap className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Google Classroom Not Connected</h3>
          <p className="text-slate-400 mb-6">
            Connect your Google Classroom account to sync assignments, track grades, and organize your studies.
          </p>
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
            className="px-6 py-3 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center space-x-2 mx-auto"
          >
            <GraduationCap className="h-5 w-5" />
            <span>Authorize Google Classroom</span>
          </button>
        </div>
      </div>
    );
  }

  const upcomingAssignments = getUpcomingAssignments();

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-xl rounded-lg border border-blue-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-blue-400" />
            <div>
              <h3 className="text-xl font-semibold text-white">Google Classroom Connected</h3>
              <p className="text-blue-300 text-sm">
                {courses.length} courses • {assignments.length} assignments
              </p>
            </div>
          </div>
          <button
            onClick={checkGoogleClassroomConnection}
            disabled={checkingConnection}
            className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${checkingConnection ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              <span className="text-white font-medium">Courses</span>
            </div>
            <p className="text-2xl font-bold text-white">{courses.length}</p>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-5 w-5 text-green-400" />
              <span className="text-white font-medium">Assignments</span>
            </div>
            <p className="text-2xl font-bold text-white">{assignments.length}</p>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-orange-400" />
              <span className="text-white font-medium">Upcoming</span>
            </div>
            <p className="text-2xl font-bold text-white">{upcomingAssignments.length}</p>
          </div>
        </div>

        {/* Sync Button */}
        <button
          onClick={syncAssignmentsToHomework}
          disabled={loading}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
          <span>{loading ? 'Syncing...' : 'Sync Assignments to Homework'}</span>
        </button>
      </div>

      {/* Upcoming Assignments */}
      {upcomingAssignments.length > 0 && (
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-lg border border-slate-700/50 p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-400" />
            <span>Upcoming Assignments</span>
          </h4>
          
          <div className="space-y-3">
            {upcomingAssignments.map((assignment, index) => (
              <motion.div
                key={assignment.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 p-4 rounded-lg border border-slate-600/50 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="text-white font-medium mb-1">{assignment.title}</h5>
                    <p className="text-slate-400 text-sm mb-2">
                      {assignment.courseInfo?.name || 'Unknown Course'}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-orange-400 flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                      </span>
                      {assignment.maxPoints && (
                        <span className="text-blue-400">
                          {assignment.maxPoints} points
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(assignment.alternateLink, '_blank')}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleClassroomIntegration;
