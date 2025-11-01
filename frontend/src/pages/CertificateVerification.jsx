import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Award, Medal, Crown, Gem, Calendar, ExternalLink, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import PageSEO from '../components/PageSEO';
import api from '../utils/axios';
import dayjs from 'dayjs';

const CertificateVerification = () => {
  const { certId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (certId) {
      verifyCertificate();
    }
  }, [certId]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      // Use the public verification endpoint (no auth required)
      const response = await fetch(`${api.defaults.baseURL}/certificates/verify/${certId}`);
      const data = await response.json();
      
      if (data.success && data.verified) {
        setCertificate(data.certificate);
      } else {
        setError('Certificate not found or invalid');
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setError('Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'platinum': return <Gem className="h-12 w-12" />;
      case 'gold': return <Crown className="h-12 w-12" />;
      case 'silver': return <Medal className="h-12 w-12" />;
      default: return <Award className="h-12 w-12" />;
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

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-purple-400" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PageSEO page="certificate-verification" />
      <div className="min-h-screen page-bg relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <Navbar />
        
        <div className="container mx-auto px-4 py-8 relative z-10 max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">
              Certificate Verification
            </h1>
            <p className="text-slate-400 text-lg">
              Verify the authenticity of a BrainPlatform certificate
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden"
          >
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-red-500/20 border-2 border-red-500/30"
                >
                  <XCircle className="h-12 w-12 text-red-400" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-red-300 mb-4">Verification Failed</h2>
                <p className="text-red-400 mb-6">{error}</p>
                <p className="text-slate-400 text-sm mb-8">
                  The certificate ID "{certId}" could not be verified. It may be invalid, revoked, or expired.
                </p>
                
                <button
                  onClick={verifyCertificate}
                  className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-red-700 transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            ) : certificate ? (
              <div className="p-8 md:p-12">
                {/* Verification Success Badge */}
                <div className="flex items-center justify-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center px-6 py-3 bg-green-500/20 border-2 border-green-500/30 rounded-full"
                  >
                    <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                    <span className="text-green-400 font-bold text-lg">VERIFIED AUTHENTIC</span>
                  </motion.div>
                </div>

                {/* Certificate Display */}
                <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-8 border border-slate-600/30 mb-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`p-4 rounded-full bg-gradient-to-r ${getLevelColor(certificate.level)}`}>
                        {getLevelIcon(certificate.level)}
                      </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Certificate of Achievement
                    </h2>
                    
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r ${getLevelColor(certificate.level)} text-white`}>
                      {certificate.level.toUpperCase()} LEVEL
                    </div>
                  </div>

                  {/* Recipient */}
                  <div className="text-center mb-8">
                    <p className="text-slate-400 text-lg mb-2">This is to certify that</p>
                    <h3 className="text-4xl font-bold text-white mb-4">
                      {certificate.userName}
                    </h3>
                    <div className="w-64 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto"></div>
                  </div>

                  {/* Achievement */}
                  <div className="text-center mb-8">
                    <p className="text-slate-400 text-lg mb-4">has successfully completed</p>
                    <h4 className="text-2xl font-bold text-white mb-4">
                      {certificate.title}
                    </h4>
                    
                    {certificate.achievement?.subject && certificate.achievement.subject !== 'General' && (
                      <p className="text-purple-400 text-lg mb-4">
                        Subject: {certificate.achievement.subject}
                      </p>
                    )}

                    {certificate.achievement?.percentage && (
                      <div className="inline-flex items-center px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-green-400 mr-2" />
                        <span className="text-green-400 font-bold text-xl">
                          {certificate.achievement.percentage}% Score
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-center">
                    <div className="flex items-center justify-center text-slate-400">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>Completed on {dayjs(certificate.completionDate).format('MMMM D, YYYY')}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
                    <h5 className="font-bold text-white mb-4">Certificate Details</h5>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-slate-400">Certificate ID:</span>
                        <p className="text-white font-mono text-xs break-all">{certificate.certificateId}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Status:</span>
                        <p className="text-green-400 font-semibold">
                          {certificate.isVerified ? 'Verified & Active' : 'Invalid'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
                    <h5 className="font-bold text-white mb-4">Issuer Information</h5>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-slate-400">Institution:</span>
                        <p className="text-white">BrainPlatform Learning Institute</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Issued Date:</span>
                        <p className="text-white">{dayjs(certificate.earnedAt).format('MMMM D, YYYY')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="text-center">
                  <a
                    href="/certificates"
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 transition duration-300"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    View My Certificates
                  </a>
                </div>
              </div>
            ) : null}
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

export default CertificateVerification;
