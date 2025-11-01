import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Download, 
  Share2, 
  Eye,
  Award,
  Medal,
  Crown,
  Gem,
  Calendar,
  Trophy,
  Shield,
  CheckCircle,
  ExternalLink,
  QrCode
} from 'lucide-react';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const CertificateViewer = ({ certificateId, onClose }) => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/certificates/${userId}/${certificateId}`);
      setCertificate(response.data.certificate);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      setError('Failed to load certificate');
      toast.error('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    try {
      toast.info('Generating PDF...');
      
      const response = await fetch(`${api.defaults.baseURL}/certificates/${userId}/${certificateId}/pdf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const shareCertificate = () => {
    const shareUrl = `${window.location.origin}/certificates/verify/${certificateId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Certificate verification link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const openVerification = () => {
    window.open(`/certificates/verify/${certificateId}`, '_blank');
  };

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
      case 'platinum': return 'from-gray-300 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      default: return 'from-orange-400 to-orange-600';
    }
  };

  const getLevelBg = (level) => {
    switch (level) {
      case 'platinum': return 'bg-gradient-to-br from-gray-900 via-gray-700 to-gray-900';
      case 'gold': return 'bg-gradient-to-br from-yellow-900 via-yellow-700 to-amber-900';
      case 'silver': return 'bg-gradient-to-br from-gray-700 via-gray-500 to-gray-700';
      default: return 'bg-gradient-to-br from-orange-900 via-orange-700 to-red-900';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-slate-800/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-slate-800/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-red-300 mb-3">Error Loading Certificate</h3>
          <p className="text-red-400 mb-6">{error || 'Certificate not found'}</p>
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-red-700 transition-all duration-300"
          >
            Close
          </button>
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
        className="bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-2xl font-bold text-white">Certificate Viewer</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Certificate Display */}
        <div className="p-8">
          <div className={`${getLevelBg(certificate.certificateData.level)} rounded-2xl p-8 border-4 border-double border-slate-300/30 shadow-2xl`}>
            
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-12 w-12 text-slate-300 mr-3" />
                <h1 className="text-3xl font-bold text-white">BrainPlatform Learning Institute</h1>
              </div>
              <p className="text-lg text-slate-300">Certificate of Achievement</p>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mt-4"></div>
            </div>

            {/* Level Badge */}
            <div className="flex justify-center mb-6">
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-white font-bold bg-gradient-to-r ${getLevelColor(certificate.certificateData.level)} shadow-lg`}>
                {getLevelIcon(certificate.certificateData.level)}
                <span className="ml-2 text-xl">{certificate.certificateData.level.toUpperCase()} LEVEL</span>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                {certificate.certificateData.title}
              </h2>
            </div>

            {/* Recipient Section */}
            <div className="text-center mb-8">
              <p className="text-lg text-slate-300 mb-4">This is to certify that</p>
              <h3 className="text-3xl font-bold text-white mb-2 border-b-2 border-purple-400 inline-block pb-2">
                {certificate.certificateData.userName}
              </h3>
              <p className="text-slate-300">has successfully completed</p>
            </div>

            {/* Achievement Details */}
            <div className="text-center mb-8">
              <h4 className="text-2xl font-bold text-white mb-4">
                {certificate.achievement.assessmentName}
              </h4>
              
              {certificate.achievement.subject && certificate.achievement.subject !== 'General' && (
                <p className="text-lg text-slate-300 mb-4">
                  Subject: <span className="font-semibold">{certificate.achievement.subject}</span>
                </p>
              )}

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-600/50 inline-block">
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">
                      {certificate.achievement.percentage}%
                    </div>
                    <p className="text-sm text-slate-400">Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">
                      {certificate.achievement.score}/{certificate.achievement.totalQuestions}
                    </div>
                    <p className="text-sm text-slate-400">Questions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Date */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center text-slate-300">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Completed on {dayjs(certificate.certificateData.completionDate).format('MMMM D, YYYY')}</span>
              </div>
            </div>

            {/* Footer Section */}
            <div className="flex justify-between items-end">
              <div className="text-center">
                <div className="border-t-2 border-slate-400 w-32 mb-2"></div>
                <p className="text-sm text-slate-400">Director of Education</p>
              </div>

              <div className="text-center">
                <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600/50">
                  <QrCode className="h-16 w-16 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Scan to verify</p>
                </div>
              </div>
            </div>

            {/* Certificate ID */}
            <div className="text-center mt-6">
              <p className="text-xs text-slate-500">
                Certificate ID: {certificate.certificateId}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-slate-700/50">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={downloadCertificate}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-green-500/25"
            >
              <Download className="h-5 w-5 mr-2" />
              Download PDF
            </button>

            <button
              onClick={shareCertificate}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/25"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share Link
            </button>

            <button
              onClick={openVerification}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-blue-500/25"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Verify Online
            </button>

            <button
              onClick={onClose}
              className="flex items-center px-6 py-3 bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CertificateViewer;
