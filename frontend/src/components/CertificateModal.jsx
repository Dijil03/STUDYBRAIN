import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Medal, Crown, Gem, Download, Share, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const CertificateModal = ({ certificate, isOpen, onClose, onDownload }) => {
  if (!certificate) return null;

  const getLevelIcon = (level) => {
    switch (level) {
      case 'platinum': return <Gem className="h-8 w-8" />;
      case 'gold': return <Crown className="h-8 w-8" />;
      case 'silver': return <Medal className="h-8 w-8" />;
      default: return <Award className="h-8 w-8" />;
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

  const formatDate = (date) => {
    return dayjs(date).format('MMMM D, YYYY [at] h:mm A');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white transition-colors rounded-full bg-slate-800/50 hover:bg-slate-700/50"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
              {/* Certificate Display */}
              <div className="p-8 md:p-12">
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"
                  >
                    {getLevelIcon(certificate.certificateData.level)}
                  </motion.div>
                  
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                    Certificate of Achievement
                  </h1>
                  
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r ${getLevelColor(certificate.certificateData.level)} text-white`}>
                    {certificate.certificateData.level.toUpperCase()} LEVEL
                  </div>
                </div>

                {/* Certificate Content */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-2xl p-8 mb-8 border border-slate-600/30">
                  {/* Recipient */}
                  <div className="text-center mb-8">
                    <p className="text-slate-400 text-lg mb-2">This is to certify that</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      {certificate.certificateData.userName}
                    </h2>
                    <div className="w-64 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto"></div>
                  </div>

                  {/* Achievement Details */}
                  <div className="text-center mb-8">
                    <p className="text-slate-400 text-lg mb-4">has successfully completed</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      {certificate.achievement.assessmentName}
                    </h3>
                    
                    {certificate.achievement.subject && certificate.achievement.subject !== 'General' && (
                      <p className="text-purple-400 text-lg mb-4">
                        Subject: {certificate.achievement.subject}
                      </p>
                    )}

                    <div className="inline-flex items-center px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-green-400 mr-2" />
                      <span className="text-green-400 font-bold text-xl">
                        {certificate.achievement.percentage}% ({certificate.achievement.score}/{certificate.achievement.totalQuestions})
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-center">
                    <div className="flex items-center justify-center text-slate-400 mb-2">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>Completed on {formatDate(certificate.certificateData.completionDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Info */}
                <div className="bg-slate-800/30 rounded-xl p-6 mb-8 border border-slate-700/50">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    Verification Details
                  </h4>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Certificate ID:</span>
                      <p className="text-white font-mono break-all">{certificate.certificateId}</p>
                    </div>
                    
                    <div>
                      <span className="text-slate-400">Earned Date:</span>
                      <p className="text-white">{formatDate(certificate.earnedAt)}</p>
                    </div>
                    
                    <div>
                      <span className="text-slate-400">Status:</span>
                      <p className="text-green-400 font-semibold">Verified & Active</p>
                    </div>
                    
                    <div>
                      <span className="text-slate-400">Views:</span>
                      <p className="text-white">{certificate.viewCount || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => onDownload(certificate.certificateId)}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:from-green-700 hover:to-emerald-700 transition duration-300"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download PDF
                  </button>
                  
                  <button
                    onClick={shareCertificate}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 transition duration-300"
                  >
                    <Share className="h-5 w-5 mr-2" />
                    Share Verification Link
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CertificateModal;


