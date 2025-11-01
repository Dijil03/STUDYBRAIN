import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Copy, 
  Share2, 
  Link2, 
  Mail, 
  MessageCircle,
  CheckCircle,
  RefreshCw,
  Calendar,
  Users,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const InviteShareModal = ({ group, user, onClose }) => {
  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchInviteLink();
  }, []);

  const fetchInviteLink = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/study-groups/${group._id}/invite-link?userId=${user.id}`);
      
      if (response.data.success) {
        setInviteData(response.data);
      }
    } catch (error) {
      console.error('Error fetching invite link:', error);
      toast.error('Failed to load invite link');
    } finally {
      setLoading(false);
    }
  };

  const generateNewToken = async () => {
    try {
      setGenerating(true);
      const response = await api.post(`/study-groups/${group._id}/generate-invite`, {
        userId: user.id
      });
      
      if (response.data.success) {
        setInviteData({
          inviteLink: response.data.inviteLink,
          inviteToken: response.data.inviteToken,
          expiryDate: response.data.expiryDate,
          isEnabled: true
        });
        toast.success('New invite link generated!');
      }
    } catch (error) {
      console.error('Error generating new invite link:', error);
      toast.error('Failed to generate new invite link');
    } finally {
      setGenerating(false);
    }
  };

  const toggleInviteEnabled = async () => {
    try {
      const newEnabledState = !inviteData.isEnabled;
      const response = await api.post(`/study-groups/${group._id}/toggle-invite`, {
        userId: user.id,
        enabled: newEnabledState
      });
      
      if (response.data.success) {
        setInviteData(prev => ({ ...prev, isEnabled: newEnabledState }));
        toast.success(`Invite link ${newEnabledState ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling invite link:', error);
      toast.error('Failed to toggle invite link');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteData.inviteLink);
      setCopied(true);
      toast.success('Invite link copied to clipboard!');
      
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy link');
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join our study group: ${group.name}`);
    const body = encodeURIComponent(
      `Hi! I'd like to invite you to join our study group "${group.name}" on BrainPlatform.\n\n` +
      `About the group:\n` +
      `📚 Subject: ${group.subject}\n` +
      `🎯 Level: ${group.difficulty}\n` +
      `⏰ Schedule: ${group.studySchedule}\n\n` +
      `Click here to join: ${inviteData.inviteLink}\n\n` +
      `This link expires on ${dayjs(inviteData.expiryDate).format('MMMM D, YYYY')}.\n\n` +
      `Looking forward to studying together!`
    );
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `🎓 Join our study group "${group.name}" on BrainPlatform!\n\n` +
      `📚 ${group.subject} • 🎯 ${group.difficulty} level\n\n` +
      `Join here: ${inviteData.inviteLink}`
    );
    
    window.open(`https://wa.me/?text=${message}`);
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${group.name} - Study Group`,
          text: `Join our ${group.subject} study group on BrainPlatform!`,
          url: inviteData.inviteLink
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-center">Loading invite link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Share2 className="w-6 h-6 mr-2 text-purple-400" />
            Share Invite Link
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Group Info */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="font-semibold text-white mb-2">{group.name}</h3>
            <div className="text-sm text-slate-300 space-y-1">
              <div>📚 {group.subject}</div>
              <div>🎯 {group.difficulty} level</div>
              <div>👥 {group.currentMembers}/{group.memberLimit} members</div>
            </div>
          </div>

          {/* Invite Link Status */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <p className="text-sm font-medium text-white">Invite Link Status</p>
              <p className="text-xs text-slate-400">
                {inviteData?.isEnabled ? 'Active' : 'Disabled'} • Expires {dayjs(inviteData?.expiryDate).fromNow()}
              </p>
            </div>
            <button
              onClick={toggleInviteEnabled}
              className={`p-2 rounded-lg transition-colors ${
                inviteData?.isEnabled 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              }`}
            >
              {inviteData?.isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Invite Link */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Invite Link
            </label>
            
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-300 text-sm font-mono truncate">
                {inviteData?.inviteLink || 'Loading...'}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                disabled={!inviteData?.isEnabled}
                className="flex items-center px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </motion.button>
            </div>

            {/* Generate New Link */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateNewToken}
              disabled={generating}
              className="w-full flex items-center justify-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New Link
                </>
              )}
            </motion.button>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Share Via
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={shareViaEmail}
                disabled={!inviteData?.isEnabled}
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={shareViaWhatsApp}
                disabled={!inviteData?.isEnabled}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={shareViaWebShare}
              disabled={!inviteData?.isEnabled}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {navigator.share ? 'Share' : 'Copy Link'}
            </motion.button>
          </div>

          {/* Expiry Info */}
          <div className="text-center text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-center">
              <Calendar className="w-3 h-3 mr-1" />
              Expires: {dayjs(inviteData?.expiryDate).format('MMM D, YYYY [at] h:mm A')}
            </div>
            <div>({dayjs(inviteData?.expiryDate).fromNow()})</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InviteShareModal;
