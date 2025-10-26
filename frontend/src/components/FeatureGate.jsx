import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, Star, Zap, ArrowRight } from 'lucide-react';
import { useFeatureGate } from '../utils/featureGate';

const FeatureGate = ({ 
  feature, 
  children, 
  fallback, 
  showUpgrade = true,
  className = "",
  title = "Premium Feature",
  description = "This feature requires a premium subscription.",
  icon = Lock
}) => {
  const { canAccess, getUpgradeMessage, userSubscription } = useFeatureGate();

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgrade) {
    const Icon = icon;
    
    // Handle undefined feature gracefully
    if (!feature) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8 text-center backdrop-blur-lg ${className}`}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
          <p className="text-white/70 mb-6 text-lg">{description}</p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <Crown className="w-5 h-5" />
            <span>Upgrade Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      );
    }
    
    const planName = feature.plan === 'premium' ? 'Study Pro' : 'Study Master';
    const planIcon = feature.plan === 'premium' ? Star : Crown;
    const PlanIcon = planIcon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8 text-center backdrop-blur-lg ${className}`}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center justify-center mb-6"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-white/70 mb-6 text-lg">{description}</p>
        
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center mb-3">
            <PlanIcon className="w-6 h-6 text-yellow-400 mr-2" />
            <span className="text-lg font-semibold text-white">{planName} Required</span>
          </div>
          <p className="text-white/70 text-sm">
            Unlock this feature and many more with {planName}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <span>Upgrade to {planName}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-white/10 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            View Plans
          </button>
        </div>

        {/* Feature benefits */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-white/70">
            <Zap className="w-4 h-4 text-yellow-400 mr-2" />
            <span>Unlock all features</span>
          </div>
          <div className="flex items-center text-white/70">
            <Crown className="w-4 h-4 text-purple-400 mr-2" />
            <span>Priority support</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default FeatureGate;
