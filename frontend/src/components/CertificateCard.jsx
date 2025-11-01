import React from 'react';
import { motion } from 'framer-motion';
import { Award, Medal, Crown, Gem, Download, Eye, Calendar, Share } from 'lucide-react';
import { ShareIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

const CertificateCard = ({ certificate, onView, onDownload }) => {
  const getLevelIcon = (level) => {
    switch (level) {
      case 'platinum': return <Gem className="h-4 w-4" />;
      case 'gold': return <Crown className="h-4 w-4" />;
      case 'silver': return <Medal className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'platinum': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      default: return 'from-orange-400 to-orange-600';
    }
  };

  const shareCertificate = () => {
    const shareUrl = `${window.location.origin}/certificates/verify/${certificate.certificateId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Certificate verification link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-700/50 ring-1 ring-slate-700/80 hover:ring-purple-500/50 transition-all duration-300"
    >
      {/* Level Badge and Score */}
      <div className="flex justify-between items-start mb-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getLevelColor(certificate.certificateData.level)} text-white`}>
          {getLevelIcon(certificate.certificateData.level)}
          <span className="ml-1">{certificate.certificateData.level.toUpperCase()}</span>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-green-400">{certificate.achievement.percentage}%</div>
          <div className="text-xs text-slate-400">
            {certificate.achievement.score}/{certificate.achievement.totalQuestions}
          </div>
        </div>
      </div>

      {/* Certificate Info */}
      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
        {certificate.achievement.assessmentName}
      </h3>
      
      <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
        <span>Subject: {certificate.achievement.subject}</span>
        {certificate.verification.isVerified && (
          <div className="flex items-center text-green-400">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        )}
      </div>
      
      <p className="text-slate-300 text-sm mb-4 line-clamp-2">
        {certificate.certificateData.description}
      </p>

      {/* Date and Views */}
      <div className="flex items-center justify-between text-slate-400 text-xs mb-4">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {dayjs(certificate.earnedAt).format('MMM D, YYYY')}
        </div>
        <div className="flex items-center">
          <Eye className="h-3 w-3 mr-1" />
          {certificate.viewCount || 0} views
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onView(certificate.certificateId)}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </button>
        
        <button
          onClick={() => onDownload(certificate.certificateId)}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-1" />
          PDF
        </button>
        
        <button
          onClick={shareCertificate}
          className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          title="Share certificate verification link"
        >
          <Share className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default CertificateCard;


