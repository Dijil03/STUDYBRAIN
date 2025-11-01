import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageSEO from "../components/PageSEO";
import CertificateViewer from "../components/CertificateViewer";
import api from "../utils/axios";
import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  TrophyIcon,
  StarIcon,
  CalendarIcon,
  EyeIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  ShareIcon
} from "@heroicons/react/24/outline";
import { Award, Medal, Crown, Gem, Download, Eye, Calendar } from 'lucide-react';
import { toast } from "react-toastify";
import dayjs from "dayjs";

const Certificates = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [viewingCertificateId, setViewingCertificateId] = useState(null);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchCertificates();
    fetchStats();
  }, [userId, navigate]);

  const fetchCertificates = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedLevel !== 'all') params.append('level', selectedLevel);
      if (selectedSubject !== 'all') params.append('subject', selectedSubject);
      
      const response = await api.get(`/certificates/${userId}?${params}`);
      setCertificates(response.data.certificates || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setError('Failed to load certificates');
      toast.error('Failed to load certificates');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/certificates/${userId}/stats`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching certificate stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCertificates();
    }
  }, [selectedLevel, selectedSubject]);

  const downloadCertificate = async (certificateId) => {
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

  const viewCertificate = (certificateId) => {
    setViewingCertificateId(certificateId);
  };

  const shareCertificate = (certificate) => {
    const shareUrl = `${window.location.origin}/certificates/verify/${certificate.certificateId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Certificate verification link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'platinum': return <Gem className="h-5 w-5" />;
      case 'gold': return <Crown className="h-5 w-5" />;
      case 'silver': return <Medal className="h-5 w-5" />;
      default: return <Award className="h-5 w-5" />;
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

  const getSubjects = () => {
    if (!certificates.length) return [];
    return [...new Set(certificates.map(cert => cert.achievement.subject))];
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-700/50 animate-pulse">
          <div className="h-6 bg-slate-600 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-slate-600 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-600 rounded w-2/3 mb-4"></div>
          <div className="h-10 bg-slate-600 rounded"></div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <>
        <PageSEO page="certificates" />
        <div className="min-h-screen page-bg relative overflow-hidden">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <LoadingSkeleton />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageSEO page="certificates" />
      <div className="min-h-screen page-bg relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <Navbar />
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                My Certificates
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              Your achievements and certifications earned through assessments
            </p>
          </motion.div>

          {/* Stats Cards */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
            >
              <div className="bg-slate-800/50 backdrop-blur-xl p-4 rounded-xl border border-slate-700/50 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <TrophyIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
                <p className="text-slate-400 text-sm">Total Certificates</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-xl p-4 rounded-xl border border-slate-700/50 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mt-2">{stats.byLevel.bronze}</p>
                <p className="text-slate-400 text-sm">Bronze</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-xl p-4 rounded-xl border border-slate-700/50 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-gradient-to-r from-gray-300 to-gray-500 rounded-lg">
                    <Medal className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mt-2">{stats.byLevel.silver}</p>
                <p className="text-slate-400 text-sm">Silver</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-xl p-4 rounded-xl border border-slate-700/50 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mt-2">{stats.byLevel.gold}</p>
                <p className="text-slate-400 text-sm">Gold</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-xl p-4 rounded-xl border border-slate-700/50 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-gradient-to-r from-gray-400 to-gray-600 rounded-lg">
                    <Gem className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mt-2">{stats.byLevel.platinum}</p>
                <p className="text-slate-400 text-sm">Platinum</p>
              </div>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-4 mb-6"
          >
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Levels</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Subjects</option>
              {getSubjects().map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </motion.div>

          {/* Certificates Grid */}
          {error ? (
            <div className="text-center py-20">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-red-300 mb-3">Error Loading Certificates</h3>
              <p className="text-red-400 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-red-700 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          ) : certificates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="bg-slate-800/50 backdrop-blur-xl p-12 rounded-3xl shadow-xl border border-slate-700/50 max-w-lg mx-auto">
                <AcademicCapIcon className="h-16 w-16 text-purple-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">No Certificates Yet</h3>
                <p className="text-slate-400 mb-8">Complete assessments with a passing grade to earn your first certificate!</p>
                <button
                  onClick={() => navigate('/assessments')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 transition duration-300"
                >
                  Take Assessments
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {certificates.map((certificate, index) => (
                <motion.div
                  key={certificate.certificateId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-700/50 ring-1 ring-slate-700/80 hover:ring-purple-500/50 transition-all duration-300"
                >
                  {/* Level Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getLevelColor(certificate.certificateData.level)} text-white`}>
                      {getLevelIcon(certificate.certificateData.level)}
                      <span className="ml-1">{certificate.certificateData.level.toUpperCase()}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{certificate.achievement.percentage}%</div>
                      <div className="text-xs text-slate-400">Score</div>
                    </div>
                  </div>

                  {/* Certificate Info */}
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {certificate.achievement.assessmentName}
                  </h3>
                  
                  <p className="text-slate-400 text-sm mb-2">
                    Subject: {certificate.achievement.subject}
                  </p>
                  
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                    {certificate.certificateData.description}
                  </p>

                  {/* Date */}
                  <div className="flex items-center text-slate-400 text-xs mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    Earned {dayjs(certificate.earnedAt).format('MMM D, YYYY')}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => viewCertificate(certificate.certificateId)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    
                    <button
                      onClick={() => downloadCertificate(certificate.certificateId)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </button>
                    
                    <button
                      onClick={() => shareCertificate(certificate)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      <ShareIcon className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Certificate Viewer Modal */}
        {viewingCertificateId && (
          <CertificateViewer
            certificateId={viewingCertificateId}
            onClose={() => setViewingCertificateId(null)}
          />
        )}

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
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </>
  );
};

export default Certificates;
