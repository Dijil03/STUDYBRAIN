import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import PageSEO from '../components/PageSEO';
import LoadingSpinner from '../components/LoadingSpinner';
import InviteShareModal from '../components/InviteShareModal';
import api from '../utils/axios';
import { saveUserSession } from '../utils/session';
import { toast } from 'react-toastify';
import {
  Users,
  BookOpen,
  Clock,
  Globe,
  Lock,
  Shield,
  Crown,
  Settings,
  UserPlus,
  UserMinus,
  Edit3,
  Calendar,
  Target,
  Star,
  Award,
  MessageCircle,
  Activity,
  TrendingUp,
  ArrowLeft,
  MoreVertical,
  CheckCircle,
  XCircle,
  Mail,
  Share2,
  FileText,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Phone,
  PhoneOff,
  Send,
  Plus,
  Save
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { io } from 'socket.io-client';

dayjs.extend(relativeTime);

const StudyGroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Collaborative features state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [groupNotes, setGroupNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callSettings, setCallSettings] = useState({ video: true, audio: true });
  const messagesEndRef = useRef(null);
  
  // TipTap editor for collaborative notes
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    editable: true,
    onUpdate: ({ editor }) => {
      if (socket && group) {
        const content = editor.getHTML();
        socket.emit('group-notes-update', {
          groupId: group._id || groupId,
          content,
          userId: user?.id
        });
      }
    },
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      fetchGroupDetails();
    }
  }, [user, groupId]);

  // Setup socket connection for real-time features
  useEffect(() => {
    if (group && user && group.isMember) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001', {
        transports: ['websocket', 'polling']
      });

      newSocket.emit('join-study-group', {
        groupId: group._id || groupId,
        userId: user.id,
        username: user.username
      });

      // Listen for messages
      newSocket.on('group-message', (data) => {
        setMessages(prev => [...prev, data]);
        scrollToBottom();
      });

      // Listen for notes updates
      newSocket.on('group-notes-update', (data) => {
        if (data.userId !== user.id && editor) {
          editor.commands.setContent(data.content);
        }
      });

      // Listen for online users
      newSocket.on('online-users', (users) => {
        setOnlineUsers(users);
      });

      // Listen for user joined/left
      newSocket.on('user-joined-group', (data) => {
        setOnlineUsers(prev => [...prev, data]);
        toast.info(`${data.username} joined the group`);
      });

      newSocket.on('user-left-group', (data) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [group, user, group?.isMember]);

  // Load chat messages
  useEffect(() => {
    if (group && user && group.isMember) {
      fetchMessages();
    }
  }, [group, user, group?.isMember]);

  // Load group notes
  useEffect(() => {
    if (group && user && group.isMember && editor) {
      fetchGroupNotes();
    }
  }, [group, user, group?.isMember, editor]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/study-groups/${groupId}/messages`);
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchGroupNotes = async () => {
    try {
      setNotesLoading(true);
      const response = await api.get(`/study-groups/${groupId}/notes`);
      if (response.data.success && editor) {
        const content = response.data.notes?.content || '';
        editor.commands.setContent(content);
        setGroupNotes(content);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) return;

    const messageData = {
      groupId: group._id || groupId,
      userId: user.id,
      username: user.username,
      message: newMessage.trim(),
      timestamp: new Date()
    };

    socket.emit('group-message', messageData);
    setNewMessage('');
  };

  const saveNotes = async () => {
    if (!editor || !group) return;
    try {
      const content = editor.getHTML();
      await api.post(`/study-groups/${groupId}/notes`, {
        content
      });
      toast.success('Notes saved');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const startCall = () => {
    setIsInCall(true);
    if (socket) {
      socket.emit('start-group-call', {
        groupId: group._id || groupId,
        userId: user.id,
        username: user.username
      });
    }
  };

  const endCall = () => {
    setIsInCall(false);
    if (socket) {
      socket.emit('end-group-call', {
        groupId: group._id || groupId,
        userId: user.id
      });
    }
  };

  const fetchUserProfile = async () => {
    try {
      const storedUserId = localStorage.getItem('userId');
      const storedUsername = localStorage.getItem('username');
      
      if (storedUserId) {
        const hasCompleted = localStorage.getItem('hasCompletedPersonalization') === 'true';
        setUser({
          id: storedUserId,
          username: storedUsername || 'User',
          hasCompletedPersonalization: hasCompleted,
        });
        return;
      }
      
      const response = await api.get('/auth/google/success');
      if (response.status === 200) {
        const userData = response.data.user;
        setUser(userData);
        saveUserSession(userData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        const hasCompleted = localStorage.getItem('hasCompletedPersonalization') === 'true';
        setUser({
          id: storedUserId,
          username: 'User',
          hasCompletedPersonalization: hasCompleted,
        });
      }
    }
  };

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/study-groups/${groupId}?userId=${user.id}`);
      
      if (response.data.success) {
        setGroup(response.data.group);
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      toast.error('Failed to load study group');
      navigate('/study-groups');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const response = await api.post(`/study-groups/${groupId}/join`, {
        userId: user.id,
        userName: user.username
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchGroupDetails();
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error(error.response?.data?.error || 'Failed to join study group');
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this study group?')) {
      try {
        const response = await api.post(`/study-groups/${groupId}/leave`, {
          userId: user.id
        });

        if (response.data.success) {
          toast.success(response.data.message);
          navigate('/study-groups');
        }
      } catch (error) {
        console.error('Error leaving group:', error);
        toast.error(error.response?.data?.error || 'Failed to leave study group');
      }
    }
  };

  const handleManageRequest = async (requestUserId, action) => {
    try {
      const response = await api.post(`/study-groups/${groupId}/manage-request`, {
        requestUserId,
        action,
        adminUserId: user.id
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchGroupDetails();
      }
    } catch (error) {
      console.error('Error managing request:', error);
      toast.error(error.response?.data?.error || 'Failed to manage request');
    }
  };

  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'public': return <Globe className="w-5 h-5 text-green-400" />;
      case 'private': return <Lock className="w-5 h-5 text-red-400" />;
      case 'invite-only': return <Shield className="w-5 h-5 text-yellow-400" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-yellow-400 bg-yellow-400/20';
      case 'moderator': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-green-400 bg-green-400/20';
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

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Study Group Not Found</h1>
            <p className="text-slate-400 mb-6">The study group you're looking for doesn't exist or has been deleted.</p>
            <button
              onClick={() => navigate('/study-groups')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Back to Study Groups
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = group.userRole === 'admin';
  const isModerator = group.userRole === 'moderator' || isAdmin;
  const isMember = group.isMember;
  const isCreator = user && group.creator === user.id;

  return (
    <>
      <PageSEO 
        page="study-group-detail"
        title={`${group.name} - Study Group`}
        description={group.description}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />

        <div className="max-w-6xl mx-auto px-4 py-8">
          
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/study-groups')}
            className="flex items-center text-slate-300 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Study Groups
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-8"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              
              {/* Group Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  {isCreator && <Crown className="w-6 h-6 text-yellow-400" />}
                  <h1 className="text-3xl font-bold text-white">{group.name}</h1>
                  {getPrivacyIcon(group.privacy)}
                </div>
                
                <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                  {group.description}
                </p>

                {/* Meta Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {!isMember ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleJoinGroup}
                    disabled={group.currentMembers >= group.memberLimit}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    {group.privacy === 'invite-only' ? 'Request to Join' : 'Join Group'}
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    {isAdmin && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold"
                      >
                        <Settings className="w-5 h-5 mr-2" />
                        Manage
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLeaveGroup}
                      className="flex items-center px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold"
                    >
                      <UserMinus className="w-5 h-5 mr-2" />
                      Leave
                    </motion.button>
                  </div>
                )}

                {/* Share Button (for members and moderators) */}
                {(isMember && isModerator) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold shadow-lg shadow-cyan-500/25"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share Invite
                  </motion.button>
                )}
                
                {/* Member role indicator */}
                {isMember && group.userRole && (
                  <div className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium ${getRoleColor(group.userRole)}`}>
                    {group.userRole === 'admin' && <Crown className="w-4 h-4 mr-1" />}
                    {group.userRole.toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {group.tags && group.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/10">
                {group.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 flex flex-wrap gap-2">
              {['overview', 'members', 'notes', 'chat', 'voice', 'activity'].map((tab) => {
                // Only show collaborative tabs if user is a member
                if ((tab === 'notes' || tab === 'chat' || tab === 'voice') && !isMember) {
                  return null;
                }
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab === 'notes' && <FileText className="w-4 h-4" />}
                    {tab === 'chat' && <MessageCircle className="w-4 h-4" />}
                    {tab === 'voice' && <Video className="w-4 h-4" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === 'chat' && messages.length > 0 && (
                      <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                        {messages.length}
                      </span>
                    )}
                  </button>
                );
              })}
              {isModerator && (
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative ${
                    activeTab === 'requests'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Requests
                  {group.joinRequests && group.joinRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {group.joinRequests.length}
                    </span>
                  )}
                </button>
              )}
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Stats */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
                    Group Statistics
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold text-white mb-1">{group.stats?.totalSessions || 0}</div>
                      <div className="text-sm text-slate-400">Study Sessions</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold text-white mb-1">{group.stats?.totalStudyHours || 0}h</div>
                      <div className="text-sm text-slate-400">Study Hours</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold text-white mb-1">{group.stats?.averageScore || 0}%</div>
                      <div className="text-sm text-slate-400">Average Score</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold text-white mb-1">{group.stats?.completedAssessments || 0}</div>
                      <div className="text-sm text-slate-400">Assessments</div>
                    </div>
                  </div>
                </div>

                {/* Group Rules */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Shield className="w-6 h-6 mr-2 text-blue-400" />
                    Group Rules
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {group.rules || 'No specific rules have been set for this group.'}
                  </p>
                </div>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-purple-400" />
                  Group Members ({group.members?.length || 0})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.members?.map((member, index) => (
                    <motion.div
                      key={member.userId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">{member.userName}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {member.role === 'admin' && <Crown className="w-3 h-3 mr-1 inline" />}
                          {member.role.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="text-sm text-slate-400 space-y-1">
                        <div>Joined: {dayjs(member.joinedAt).format('MMM D, YYYY')}</div>
                        <div>Last active: {dayjs(member.lastActivity).fromNow()}</div>
                      </div>
                      
                      {member.contributions && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-400">Notes:</span>
                              <span className="text-white ml-1">{member.contributions.notesShared || 0}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Hours:</span>
                              <span className="text-white ml-1">{member.contributions.studyHours || 0}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Join Requests Tab (Admin/Moderator only) */}
            {activeTab === 'requests' && isModerator && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Mail className="w-6 h-6 mr-2 text-yellow-400" />
                  Join Requests ({group.joinRequests?.length || 0})
                </h3>
                
                {group.joinRequests && group.joinRequests.length > 0 ? (
                  <div className="space-y-4">
                    {group.joinRequests.map((request, index) => (
                      <motion.div
                        key={request.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{request.userName}</h4>
                            <p className="text-sm text-slate-400">
                              Requested {dayjs(request.requestedAt).fromNow()}
                            </p>
                            {request.message && (
                              <p className="text-sm text-slate-300 mt-2 italic">"{request.message}"</p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleManageRequest(request.userId, 'approve')}
                              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleManageRequest(request.userId, 'reject')}
                              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No pending join requests</p>
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab - Collaborative Note Taking */}
            {activeTab === 'notes' && isMember && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex flex-col h-[600px]">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <FileText className="w-6 h-6 mr-2 text-purple-400" />
                    Collaborative Notes
                  </h3>
                  <div className="flex items-center gap-2">
                    {onlineUsers.length > 0 && (
                      <div className="flex items-center gap-2 mr-4">
                        <span className="text-sm text-slate-400">Online:</span>
                        <div className="flex -space-x-2">
                          {onlineUsers.slice(0, 3).map((onlineUser) => (
                            <div
                              key={onlineUser.userId}
                              className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white/20"
                              title={onlineUser.username}
                            >
                              {onlineUser.username.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {onlineUsers.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-semibold border-2 border-white/20">
                              +{onlineUsers.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={saveNotes}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-semibold"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </motion.button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  {notesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <EditorContent 
                        editor={editor} 
                        className="min-h-[500px] bg-white/5 rounded-xl p-6 text-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chat Tab - Real-time Messaging */}
            {activeTab === 'chat' && isMember && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex flex-col h-[600px]">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <MessageCircle className="w-6 h-6 mr-2 text-cyan-400" />
                    Group Chat
                    {onlineUsers.length > 0 && (
                      <span className="ml-3 text-sm text-slate-400">
                        ({onlineUsers.length} online)
                      </span>
                    )}
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${msg.userId === user?.id ? 'order-2' : 'order-1'}`}>
                          {msg.userId !== user?.id && (
                            <div className="text-xs text-slate-400 mb-1 ml-2">{msg.username}</div>
                          )}
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              msg.userId === user?.id
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            <p className={`text-xs mt-1 ${
                              msg.userId === user?.id ? 'text-white/70' : 'text-slate-400'
                            }`}>
                              {dayjs(msg.timestamp).format('h:mm A')}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </form>
              </div>
            )}

            {/* Voice/Video Tab */}
            {activeTab === 'voice' && isMember && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Video className="w-6 h-6 mr-2 text-red-400" />
                  Voice & Video Call
                </h3>

                {!isInCall ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                      <Video className="w-16 h-16 text-purple-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-4">Start a Group Call</h4>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                      Start a voice or video call with your study group members. Perfect for collaborative study sessions!
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startCall}
                        className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-semibold text-lg"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Start Voice Call
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCallSettings({ ...callSettings, video: true });
                          startCall();
                        }}
                        className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-semibold text-lg"
                      >
                        <Video className="w-5 h-5 mr-2" />
                        Start Video Call
                      </motion.button>
                    </div>

                    <div className="mt-8 p-4 bg-white/5 rounded-xl max-w-md mx-auto">
                      <p className="text-sm text-slate-400 mb-2">Participants:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {group.members?.slice(0, 5).map((member) => (
                          <div
                            key={member.userId}
                            className="px-3 py-1 bg-white/10 rounded-full text-sm text-white"
                          >
                            {member.userName}
                          </div>
                        ))}
                        {group.members?.length > 5 && (
                          <div className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                            +{group.members.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                      <Phone className="w-16 h-16 text-red-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-4">Call in Progress</h4>
                    <p className="text-slate-400 mb-8">
                      Your group call is active. You can toggle audio and video settings below.
                    </p>

                    <div className="flex justify-center gap-4 mb-8">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCallSettings({ ...callSettings, audio: !callSettings.audio })}
                        className={`p-4 rounded-full ${
                          callSettings.audio
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-red-500 hover:bg-red-600'
                        } text-white transition-all`}
                      >
                        {callSettings.audio ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCallSettings({ ...callSettings, video: !callSettings.video })}
                        className={`p-4 rounded-full ${
                          callSettings.video
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-red-500 hover:bg-red-600'
                        } text-white transition-all`}
                      >
                        {callSettings.video ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={endCall}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all"
                      >
                        <PhoneOff className="w-6 h-6" />
                      </motion.button>
                    </div>

                    <div className="text-sm text-slate-400">
                      <p>Note: Full WebRTC integration requires additional setup</p>
                      <p className="mt-2">This is a demonstration of the call interface</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Activity className="w-6 h-6 mr-2 text-green-400" />
                  Recent Activity
                </h3>
                
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Activity feed coming soon!</p>
                  <p className="text-slate-500 text-sm mt-2">
                    Track study sessions, shared notes, and member interactions here.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Invite Share Modal */}
        {showInviteModal && (
          <InviteShareModal
            group={group}
            user={user}
            onClose={() => setShowInviteModal(false)}
          />
        )}
      </div>
    </>
  );
};

export default StudyGroupDetail;
