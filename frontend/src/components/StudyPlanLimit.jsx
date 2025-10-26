import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock, AlertTriangle, Zap, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

const StudyPlanLimit = ({ onLimitReached, children }) => {
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await api.get(`/study-plans/${userId}/limits`);
      setLimits(response.data.limits);
    } catch (error) {
      console.error('Error fetching study plan limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    if (limits && !limits.isUnlimited && limits.remaining <= 0) {
      setShowUpgradeModal(true);
      if (onLimitReached) {
        onLimitReached();
      }
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!limits) {
    return children;
  }

  return (
    <>
      {children}
      
      {/* Limit Warning */}
      {!limits.isUnlimited && limits.remaining <= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-amber-200 font-semibold">
                Study Plan Limit Warning
              </h3>
              <p className="text-amber-300/80 text-sm">
                You have {limits.remaining} study plan{limits.remaining !== 1 ? 's' : ''} remaining. 
                {limits.remaining === 0 && ' Upgrade to Pro for unlimited study plans!'}
              </p>
            </div>
            {limits.remaining === 0 && (
              <Link
                to="/pricing"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Upgrade Now
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowUpgradeModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Crown className="w-8 h-8 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Study Plan Limit Reached
              </h2>
              <p className="text-gray-300 mb-6">
                You've reached your limit of 3 study plans. Upgrade to Study Pro for unlimited study plans and advanced features!
              </p>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                  <h3 className="text-white font-semibold mb-2">Study Pro Benefits:</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>Unlimited study plans</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-purple-400" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <Link
                    to="/pricing"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-2"
                    onClick={() => setShowUpgradeModal(false)}
                  >
                    <Crown className="w-5 h-5" />
                    <span>Upgrade to Pro</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="px-6 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default StudyPlanLimit;
