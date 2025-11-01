import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Clock, 
  Shield, 
  Lock, 
  Globe, 
  Star,
  UserPlus,
  Settings,
  Calendar,
  Target,
  Crown
} from 'lucide-react';

const StudyGroupCard = ({ group, user, onJoin, delay = 0, isUserGroup = false }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      case 'invite-only': return <Shield className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getScheduleDisplay = (schedule) => {
    const scheduleMap = {
      'flexible': 'Flexible',
      'morning': 'Mornings',
      'afternoon': 'Afternoons', 
      'evening': 'Evenings',
      'weekend': 'Weekends',
      'weekday': 'Weekdays'
    };
    return scheduleMap[schedule] || schedule;
  };

  const isMember = isUserGroup || (user && group.members?.some(member => member.userId === user.id));
  const isCreator = user && group.creator === user.id;
  const isFull = group.currentMembers >= group.memberLimit;

  const handleJoinClick = () => {
    if (!isMember && !isFull && onJoin) {
      onJoin(group._id);
    }
  };

  const handleManageClick = () => {
    // Navigate to group management page
    window.location.href = `/study-groups/${group._id}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isCreator && (
              <Crown className="w-4 h-4 text-yellow-400" title="You created this group" />
            )}
            <h3 className="text-lg font-bold text-white line-clamp-1">{group.name}</h3>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            {getPrivacyIcon(group.privacy)}
            <span className="text-sm text-slate-400 capitalize">{group.privacy}</span>
          </div>
        </div>

        {/* Member count */}
        <div className="text-right">
          <div className="flex items-center text-purple-300 mb-1">
            <Users className="w-4 h-4 mr-1" />
            <span className="font-semibold">{group.currentMembers || 0}/{group.memberLimit}</span>
          </div>
          {isFull && (
            <span className="text-xs text-red-400 font-medium">FULL</span>
          )}
        </div>
      </div>

      {/* Subject and Difficulty */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
          <BookOpen className="w-4 h-4 mr-1" />
          {group.subject}
        </div>
        
        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(group.difficulty)}`}>
          <Target className="w-4 h-4 mr-1" />
          {group.difficulty}
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed">
        {group.description}
      </p>

      {/* Schedule */}
      <div className="flex items-center text-slate-400 text-sm mb-4">
        <Clock className="w-4 h-4 mr-2" />
        <span>Study Schedule: {getScheduleDisplay(group.studySchedule)}</span>
      </div>

      {/* Tags */}
      {group.tags && group.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {group.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg"
            >
              #{tag}
            </span>
          ))}
          {group.tags.length > 3 && (
            <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-lg">
              +{group.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      {group.stats && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="text-center">
            <div className="text-sm font-bold text-white">{group.stats.totalSessions || 0}</div>
            <div className="text-xs text-slate-400">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-white">{group.stats.totalStudyHours || 0}h</div>
            <div className="text-xs text-slate-400">Study Time</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-white">{group.stats.averageScore || 0}%</div>
            <div className="text-xs text-slate-400">Avg Score</div>
          </div>
        </div>
      )}

      {/* Creator Info */}
      <div className="flex items-center text-slate-400 text-xs mb-4">
        <span>Created by {group.creatorName}</span>
        {group.createdAt && (
          <span className="ml-2">• {new Date(group.createdAt).toLocaleDateString()}</span>
        )}
      </div>

      {/* Action Button */}
      <div className="flex gap-2">
        {isUserGroup || isMember ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleManageClick}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/25 font-semibold"
          >
            {isCreator ? (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Manage Group
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                View Group
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: isFull ? 1 : 1.02 }}
            whileTap={{ scale: isFull ? 1 : 0.98 }}
            onClick={handleJoinClick}
            disabled={isFull || !user}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
              isFull
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-green-500/25'
            }`}
          >
            {isFull ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Group Full
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                {group.privacy === 'invite-only' ? 'Request to Join' : 'Join Group'}
              </>
            )}
          </motion.button>
        )}

        {/* View Details Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = `/study-groups/${group._id}`}
          className="px-4 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors"
          title="View Details"
        >
          <Star className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Membership indicator */}
      {isMember && !isUserGroup && (
        <div className="mt-3 flex items-center justify-center text-xs text-green-400 font-medium">
          <Users className="w-3 h-3 mr-1" />
          You are a member
        </div>
      )}

      {/* User role indicator for user groups */}
      {isUserGroup && group.userRole && (
        <div className="mt-3 flex items-center justify-center text-xs font-medium">
          <div className={`flex items-center px-2 py-1 rounded-full ${
            group.userRole === 'admin' 
              ? 'bg-yellow-500/20 text-yellow-300' 
              : group.userRole === 'moderator'
              ? 'bg-blue-500/20 text-blue-300'
              : 'bg-green-500/20 text-green-300'
          }`}>
            {group.userRole === 'admin' && <Crown className="w-3 h-3 mr-1" />}
            {group.userRole.toUpperCase()}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StudyGroupCard;
