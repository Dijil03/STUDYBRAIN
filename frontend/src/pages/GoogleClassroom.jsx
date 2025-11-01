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
  AlertCircle,
  Plus,
  Filter,
  Search,
  ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import GoogleClassroomIntegration from '../components/GoogleClassroomIntegration';

const GoogleClassroom = () => {
  const [userId, setUserId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, upcoming, overdue, completed

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);
    
    if (storedUserId) {
      fetchClassroomData();
    }
  }, []);

  const fetchClassroomData = async () => {
    try {
      setLoading(true);
      
      // Use API utility for environment-aware URLs
      const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');
      const apiUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
      
      // Fetch courses
      const coursesResponse = await fetch(`${apiUrl}/google-classroom/${userId}/courses`);
      const coursesData = await coursesResponse.json();
      
      if (coursesData.success) {
        setCourses(coursesData.courses || []);
      } else if (coursesData.needsReauth) {
        setError('Please authorize Google Classroom access');
        // Store auth URL for button click
        if (coursesData.authUrl) {
          window._classroomAuthUrl = coursesData.authUrl;
        }
      }
      
      // Fetch assignments
      const assignmentsResponse = await fetch(`${apiUrl}/google-classroom/${userId}/assignments`);
      const assignmentsData = await assignmentsResponse.json();
      
      if (assignmentsData.success) {
        setAssignments(assignmentsData.assignments || []);
      }
      
    } catch (err) {
      console.error('Error fetching classroom data:', err);
      setError('Failed to load classroom data');
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
    });
  };

  const getOverdueAssignments = () => {
    const now = new Date();
    return assignments.filter(assignment => {
      if (!assignment.dueDate) return false;
      const dueDate = new Date(assignment.dueDate.year, (assignment.dueDate.month || 1) - 1, assignment.dueDate.day || 1);
      return dueDate < now;
    });
  };

  const getFilteredAssignments = () => {
    let filtered = assignments;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(assignment => 
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.courseInfo?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    switch (filterBy) {
      case 'upcoming':
        return getUpcomingAssignments().filter(assignment => 
          filtered.includes(assignment)
        );
      case 'overdue':
        return getOverdueAssignments().filter(assignment => 
          filtered.includes(assignment)
        );
      default:
        return filtered;
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
        alert(`Successfully synced ${data.totalCount} assignments to homework!`);
        fetchClassroomData(); // Refresh data
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

  const upcomingAssignments = getUpcomingAssignments();
  const overdueAssignments = getOverdueAssignments();
  const filteredAssignments = getFilteredAssignments();

  if (loading && assignments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-white">Loading Google Classroom data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <GraduationCap className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Google Classroom</h1>
          </div>
          <p className="text-slate-400">
            Manage your courses, assignments, and academic progress
          </p>
        </div>

        {/* Google Classroom Integration */}
        <div className="mb-8">
          <GoogleClassroomIntegration 
            userId={userId}
            onAssignmentsSynced={(assignments) => {
              console.log('Assignments synced:', assignments);
              fetchClassroomData();
            }}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl rounded-lg border border-blue-500/30 p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <span className="text-white font-medium">Courses</span>
            </div>
            <p className="text-3xl font-bold text-white">{courses.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl rounded-lg border border-green-500/30 p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="h-6 w-6 text-green-400" />
              <span className="text-white font-medium">Assignments</span>
            </div>
            <p className="text-3xl font-bold text-white">{assignments.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-xl rounded-lg border border-orange-500/30 p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="h-6 w-6 text-orange-400" />
              <span className="text-white font-medium">Upcoming</span>
            </div>
            <p className="text-3xl font-bold text-white">{upcomingAssignments.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl rounded-lg border border-red-500/30 p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <span className="text-white font-medium">Overdue</span>
            </div>
            <p className="text-3xl font-bold text-white">{overdueAssignments.length}</p>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-lg border border-slate-700/50 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Assignments</option>
                <option value="upcoming">Upcoming</option>
                <option value="overdue">Overdue</option>
              </select>
              
              <button
                onClick={syncAssignmentsToHomework}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span>Sync to Homework</span>
              </button>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No assignments found</h3>
              <p className="text-slate-400">
                {searchQuery ? 'Try adjusting your search terms' : 'No assignments match your current filter'}
              </p>
            </div>
          ) : (
            filteredAssignments.map((assignment, index) => (
              <motion.div
                key={assignment.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/30 backdrop-blur-xl rounded-lg border border-slate-700/50 hover:border-blue-500/50 transition-all p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{assignment.title}</h3>
                      {assignment.dueDate && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          new Date(assignment.dueDate.year, (assignment.dueDate.month || 1) - 1, assignment.dueDate.day || 1) < new Date()
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {new Date(assignment.dueDate.year, (assignment.dueDate.month || 1) - 1, assignment.dueDate.day || 1) < new Date()
                            ? 'Overdue'
                            : 'Upcoming'
                          }
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-400 mb-3">
                      {assignment.courseInfo?.name || 'Unknown Course'}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                      </span>
                      
                      {assignment.maxPoints && (
                        <span className="text-blue-400">
                          {assignment.maxPoints} points
                        </span>
                      )}
                      
                      {assignment.description && (
                        <span className="text-slate-500 truncate max-w-xs">
                          {assignment.description.substring(0, 100)}...
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(assignment.alternateLink, '_blank')}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                      title="Open in Google Classroom"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleClassroom;
