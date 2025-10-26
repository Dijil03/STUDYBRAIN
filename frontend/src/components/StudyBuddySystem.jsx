import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Video, 
  Calendar, 
  Clock, 
  Target, 
  Trophy, 
  Heart, 
  Star, 
  Zap, 
  BookOpen, 
  Brain, 
  Send, 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff,
  Settings,
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Shield,
  Flame
} from 'lucide-react';

const StudyBuddySystem = ({ userId, onBuddyUpdate }) => {
  const [buddies, setBuddies] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedBuddy, setSelectedBuddy] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callSettings, setCallSettings] = useState({
    video: true,
    audio: true,
    screenShare: false
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockBuddies = [
      {
        id: 'buddy-1',
        name: 'Alex Johnson',
        avatar: null,
        status: 'online',
        subjects: ['Mathematics', 'Physics'],
        studyStreak: 15,
        level: 8,
        timezone: 'EST',
        availability: {
          monday: { start: '18:00', end: '22:00' },
          tuesday: { start: '18:00', end: '22:00' },
          wednesday: { start: '18:00', end: '22:00' },
          thursday: { start: '18:00', end: '22:00' },
          friday: { start: '18:00', end: '22:00' },
          saturday: { start: '10:00', end: '16:00' },
          sunday: { start: '10:00', end: '16:00' }
        },
        preferences: {
          studyStyle: 'collaborative',
          sessionLength: 60,
          breakLength: 10,
          music: false,
          video: true
        },
        stats: {
          totalSessions: 45,
          averageRating: 4.8,
          completionRate: 92
        }
      },
      {
        id: 'buddy-2',
        name: 'Sarah Chen',
        avatar: null,
        status: 'studying',
        subjects: ['Chemistry', 'Biology'],
        studyStreak: 22,
        level: 12,
        timezone: 'PST',
        availability: {
          monday: { start: '19:00', end: '23:00' },
          tuesday: { start: '19:00', end: '23:00' },
          wednesday: { start: '19:00', end: '23:00' },
          thursday: { start: '19:00', end: '23:00' },
          friday: { start: '19:00', end: '23:00' },
          saturday: { start: '14:00', end: '20:00' },
          sunday: { start: '14:00', end: '20:00' }
        },
        preferences: {
          studyStyle: 'focused',
          sessionLength: 90,
          breakLength: 15,
          music: true,
          video: false
        },
        stats: {
          totalSessions: 67,
          averageRating: 4.9,
          completionRate: 95
        }
      }
    ];

    const mockStudyGroups = [
      {
        id: 'group-1',
        name: 'Math Masters',
        description: 'Advanced mathematics study group',
        members: 8,
        maxMembers: 12,
        subjects: ['Calculus', 'Linear Algebra', 'Statistics'],
        schedule: {
          frequency: 'weekly',
          day: 'saturday',
          time: '14:00',
          duration: 120
        },
        privacy: 'public',
        requirements: {
          minLevel: 5,
          subjects: ['Mathematics']
        }
      },
      {
        id: 'group-2',
        name: 'Science Squad',
        description: 'Comprehensive science study group',
        members: 15,
        maxMembers: 20,
        subjects: ['Physics', 'Chemistry', 'Biology'],
        schedule: {
          frequency: 'bi-weekly',
          day: 'sunday',
          time: '10:00',
          duration: 180
        },
        privacy: 'private',
        requirements: {
          minLevel: 3,
          subjects: ['Science']
        }
      }
    ];

    setBuddies(mockBuddies);
    setStudyGroups(mockStudyGroups);
  }, []);

  // Find compatible study buddies
  const findCompatibleBuddies = (userSubjects, userLevel, userTimezone) => {
    return buddies.filter(buddy => {
      const subjectMatch = buddy.subjects.some(subject => 
        userSubjects.includes(subject)
      );
      const levelMatch = Math.abs(buddy.level - userLevel) <= 3;
      const timezoneMatch = buddy.timezone === userTimezone || 
        Math.abs(getTimezoneOffset(buddy.timezone) - getTimezoneOffset(userTimezone)) <= 3;
      
      return subjectMatch && levelMatch && timezoneMatch;
    });
  };

  // Get timezone offset in hours
  const getTimezoneOffset = (timezone) => {
    const offsets = {
      'EST': -5, 'PST': -8, 'CST': -6, 'MST': -7,
      'GMT': 0, 'CET': 1, 'JST': 9, 'AEST': 10
    };
    return offsets[timezone] || 0;
  };

  // Start study session with buddy
  const startStudySession = (buddyId, sessionType = 'collaborative') => {
    const buddy = buddies.find(b => b.id === buddyId);
    if (!buddy) return;

    const session = {
      id: `session-${Date.now()}`,
      buddyId,
      buddyName: buddy.name,
      type: sessionType,
      startTime: new Date(),
      duration: 0,
      status: 'active',
      participants: [userId, buddyId],
      settings: {
        video: callSettings.video,
        audio: callSettings.audio,
        screenShare: callSettings.screenShare
      }
    };

    setActiveSessions(prev => [...prev, session]);
    setIsInCall(true);
    
    // Send notification to buddy
    sendNotification(buddyId, {
      type: 'study_invitation',
      message: `${buddy.name} wants to start a study session`,
      action: 'accept_session'
    });
  };

  // Send notification
  const sendNotification = (buddyId, notification) => {
    const newNotification = {
      id: `notif-${Date.now()}`,
      buddyId,
      ...notification,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [...prev, newNotification]);
  };

  // Join study group
  const joinStudyGroup = (groupId) => {
    const group = studyGroups.find(g => g.id === groupId);
    if (!group) return;

    if (group.members >= group.maxMembers) {
      alert('This group is full');
      return;
    }

    // Update group membership
    setStudyGroups(prev => 
      prev.map(g => 
        g.id === groupId 
          ? { ...g, members: g.members + 1 }
          : g
      )
    );

    // Send notification to group members
    group.members.forEach(memberId => {
      sendNotification(memberId, {
        type: 'group_join',
        message: 'A new member joined the study group',
        action: 'view_group'
      });
    });
  };

  // Get buddy status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'studying': return 'text-blue-400';
      case 'away': return 'text-yellow-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return CheckCircle;
      case 'studying': return BookOpen;
      case 'away': return Clock;
      case 'offline': return XCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Study Buddies</h2>
        <div className="flex items-center space-x-2">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
            <UserPlus className="w-4 h-4 mr-2" />
            Find Buddies
          </button>
          <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Users className="w-4 h-4 mr-2" />
            Join Group
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Video className="w-5 h-5 mr-2 text-blue-400" />
            Active Study Sessions
          </h3>
          <div className="space-y-3">
            {activeSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {session.buddyName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{session.buddyName}</div>
                    <div className="text-sm text-gray-400">
                      {session.type} • {Math.floor(session.duration / 60)}m
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors">
                    <PhoneOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Buddies List */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-400" />
          Your Study Buddies
        </h3>
        <div className="space-y-4">
          {buddies.map(buddy => {
            const StatusIcon = getStatusIcon(buddy.status);
            return (
              <motion.div
                key={buddy.id}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors cursor-pointer"
                onClick={() => setSelectedBuddy(buddy)}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {buddy.name.charAt(0)}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${getStatusColor(buddy.status)}`}>
                      <StatusIcon className="w-3 h-3" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-white font-medium">{buddy.name}</div>
                    <div className="text-sm text-gray-400">
                      Level {buddy.level} • {buddy.subjects.join(', ')}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center text-sm text-gray-400">
                        <Flame className="w-3 h-3 mr-1 text-orange-400" />
                        {buddy.studyStreak} day streak
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Star className="w-3 h-3 mr-1 text-yellow-400" />
                        {buddy.stats.averageRating}/5
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startStudySession(buddy.id, 'collaborative');
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    <Video className="w-4 h-4 mr-1" />
                    Study
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open chat
                    }}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Study Groups */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-400" />
          Study Groups
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studyGroups.map(group => (
            <motion.div
              key={group.id}
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold">{group.name}</h4>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-400">
                    {group.members}/{group.maxMembers}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    group.privacy === 'public' ? 'bg-green-400' : 'bg-yellow-400'
                  }`} />
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-3">{group.description}</p>
              
              <div className="flex items-center space-x-4 mb-3">
                <div className="text-sm text-gray-400">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {group.schedule.day}s at {group.schedule.time}
                </div>
                <div className="text-sm text-gray-400">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {group.schedule.duration}m
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {group.subjects.join(', ')}
                </div>
                <button
                  onClick={() => joinStudyGroup(group.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors text-sm"
                >
                  Join
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-yellow-400" />
            Notifications
          </h3>
          <div className="space-y-3">
            {notifications.slice(-5).map(notification => (
              <div key={notification.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm">{notification.message}</div>
                    <div className="text-gray-400 text-xs">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyBuddySystem;
