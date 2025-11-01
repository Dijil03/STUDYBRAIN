import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import PageSEO from '../components/PageSEO';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import {
  Users,
  BookOpen,
  Clock,
  Target,
  UserPlus,
  CheckCircle,
  XCircle,
  Calendar,
  Crown,
  Sparkles,
  ArrowLeft,
  Shield
} from 'lucide-react';
import dayjs from 'dayjs';

const JoinViaInvite = () => {
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (user && inviteToken) {
      checkInviteToken();
    }
  }, [user, inviteToken]);

  const fetchUserProfile = async () => {
    try {
      const storedUserId = localStorage.getItem('userId');
      const storedUsername = localStorage.getItem('username');
      
      if (storedUserId) {
        setUser({ 
          id: storedUserId, 
          username: storedUsername || 'User' 
        });
        return;
      }
      
      try {
        const response = await api.get('/auth/google/success');
        if (response.status === 200) {
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem('userId', userData.id);
          localStorage.setItem('username', userData.username || userData.firstName || 'User');
        }
      } catch (authError) {
        // User not authenticated - redirect to login with return URL
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?redirect=${returnUrl}`;
        return;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUser({ 
          id: storedUserId, 
          username: localStorage.getItem('username') || 'User' 
        });
      } else {
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?redirect=${returnUrl}`;
      }
    }
  };

  const checkInviteToken = async () => {
    try {
      setLoading(true);
      // First, try to get group info via the invite token
      // We'll need to make a request to see if the token is valid
      // For now, let's make a simple request to check the token
      
      const response = await api.post(`/study-groups/join/${inviteToken}`, {
        userId: user.id,
        userName: user.username,
        preview: true // Just to check if valid, don't actually join yet
      });

      if (response.data.success) {
        if (response.data.message.includes('already a member')) {
          setJoined(true);
          setGroup(response.data.group);
        } else {
          // Token is valid, but we need to get full group details
          // Let's fetch group details if we have the group ID
          if (response.data.group && response.data.group._id) {
            const groupResponse = await api.get(`/study-groups/${response.data.group._id}?userId=${user.id}`);
            if (groupResponse.data.success) {
              setGroup(groupResponse.data.group);
            }
          } else {
            setGroup(response.data.group);
          }
        }
      }
    } catch (error) {
      console.error('Error checking invite token:', error);
      if (error.response?.status === 404) {
        setError('Invalid or expired invite link');
      } else if (error.response?.status === 400) {
        setError(error.response.data.error || 'Invite link has expired or is disabled');
      } else {
        setError('Failed to process invite link');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      setJoining(true);
      const response = await api.post(`/study-groups/join/${inviteToken}`, {
        userId: user.id,
        userName: user.username
      });

      if (response.data.success) {
        setJoined(true);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error(error.response?.data?.error || 'Failed to join study group');
    } finally {
      setJoining(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <>
        <PageSEO page="invite-error" title="Invite Error" />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Navbar />
          <div className="flex items-center justify-center min-h-[80vh]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center max-w-md mx-4"
            >
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-4">Invalid Invite Link</h1>
              <p className="text-slate-300 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/study-groups')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold"
                >
                  Browse Study Groups
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="w-full flex items-center justify-center px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Go Back
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  if (!group) {
    return (
      <>
        <PageSEO page="invite-loading" title="Processing Invite" />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Navbar />
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <PageSEO 
        page="join-invite" 
        title={`Join ${group.name} - Study Group Invite`}
        description={`You've been invited to join ${group.name}, a ${group.subject} study group on BrainPlatform.`}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-2xl w-full"
          >
            
            {joined ? (
              /* Success State */
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                
                <h1 className="text-3xl font-bold text-white mb-4">
                  🎉 Welcome to the group!
                </h1>
                
                <p className="text-xl text-slate-300 mb-6">
                  You've successfully joined <span className="font-semibold text-purple-400">{group.name}</span>
                </p>
                
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/study-groups/${group._id}`)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/25 font-semibold"
                  >
                    <Users className="w-5 h-5 inline mr-2" />
                    View Study Group
                  </motion.button>
                  
                  <button
                    onClick={() => navigate('/study-groups')}
                    className="w-full px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Browse More Groups
                  </button>
                </div>
              </div>
            ) : (
              /* Join Invitation State */
              <>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Sparkles className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h1 className="text-3xl font-bold text-white mb-4">
                    You're Invited! 🎉
                  </h1>
                  
                  <p className="text-lg text-slate-300">
                    Join this awesome study group and start collaborating
                  </p>
                </div>

                {/* Group Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-white">{group.name}</h2>
                    {group.creator === user?.id && <Crown className="w-6 h-6 text-yellow-400" />}
                  </div>
                  
                  <p className="text-slate-300 mb-6 leading-relaxed">
                    {group.description}
                  </p>

                  {/* Group Meta Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center bg-purple-500/20 text-purple-300 px-4 py-3 rounded-xl">
                      <BookOpen className="w-5 h-5 mr-2" />
                      <span className="font-medium">{group.subject}</span>
                    </div>
                    
                    <div className={`flex items-center px-4 py-3 rounded-xl font-medium ${getDifficultyColor(group.difficulty)}`}>
                      <Target className="w-5 h-5 mr-2" />
                      <span>{group.difficulty}</span>
                    </div>
                    
                    <div className="flex items-center bg-slate-700/50 text-slate-300 px-4 py-3 rounded-xl">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>{group.studySchedule}</span>
                    </div>
                    
                    <div className="flex items-center bg-cyan-500/20 text-cyan-300 px-4 py-3 rounded-xl">
                      <Users className="w-5 h-5 mr-2" />
                      <span>{group.currentMembers}/{group.memberLimit}</span>
                    </div>
                  </div>

                  {/* Group Stats */}
                  {group.stats && (
                    <div className="grid grid-cols-4 gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{group.stats.totalSessions || 0}</div>
                        <div className="text-xs text-slate-400">Sessions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{group.stats.totalStudyHours || 0}h</div>
                        <div className="text-xs text-slate-400">Study Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{group.stats.averageScore || 0}%</div>
                        <div className="text-xs text-slate-400">Avg Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{group.stats.completedAssessments || 0}</div>
                        <div className="text-xs text-slate-400">Assessments</div>
                      </div>
                    </div>
                  )}

                  {/* Creator Info */}
                  <div className="flex items-center text-slate-400 text-sm mt-4 pt-4 border-t border-white/10">
                    <span>Created by {group.creatorName}</span>
                    <span className="mx-2">•</span>
                    <span>{dayjs(group.createdAt).format('MMM D, YYYY')}</span>
                  </div>
                </motion.div>

                {/* Join Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <motion.button
                    whileHover={{ scale: joining ? 1 : 1.02 }}
                    whileTap={{ scale: joining ? 1 : 0.98 }}
                    onClick={handleJoinGroup}
                    disabled={joining || group.currentMembers >= group.memberLimit}
                    className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                      group.currentMembers >= group.memberLimit
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-green-500/25'
                    }`}
                  >
                    {joining ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Joining Group...
                      </div>
                    ) : group.currentMembers >= group.memberLimit ? (
                      <>
                        <Shield className="w-5 h-5 inline mr-2" />
                        Group is Full
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5 inline mr-2" />
                        Join Study Group
                      </>
                    )}
                  </motion.button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/study-groups')}
                      className="flex-1 px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors"
                    >
                      Browse Groups
                    </button>
                    
                    <button
                      onClick={() => navigate(-1)}
                      className="flex items-center px-6 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>

        {/* Styles */}
        <style>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}</style>
      </div>
    </>
  );
};

export default JoinViaInvite;
