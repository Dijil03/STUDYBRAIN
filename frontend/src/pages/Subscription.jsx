import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Star, 
  Users, 
  Check, 
  X, 
  Calendar, 
  CreditCard, 
  Download,
  BarChart3,
  Users2,
  FileText,
  Brain,
  HardDrive,
  MessageSquare,
  Settings
} from 'lucide-react';
import Navbar from '../components/Navbar';

const Subscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:5001/api/subscriptions/${userId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      return;
    }

    setCancelling(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:5001/api/subscriptions/${userId}/cancel`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        await fetchSubscription(); // Refresh subscription data
        alert('Subscription cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Error cancelling subscription');
    } finally {
      setCancelling(false);
    }
  };

  const getTierInfo = (tier) => {
    switch (tier) {
      case 'free':
        return {
          name: 'Student Starter',
          icon: Users,
          color: 'from-blue-500 to-blue-600',
          description: 'Basic features for getting started'
        };
      case 'premium':
        return {
          name: 'Study Pro',
          icon: Star,
          color: 'from-purple-500 to-purple-600',
          description: 'Advanced features for serious students'
        };
      case 'enterprise':
        return {
          name: 'Study Master',
          icon: Crown,
          color: 'from-amber-500 to-amber-600',
          description: 'Complete solution for power users'
        };
      default:
        return {
          name: 'Unknown',
          icon: Users,
          color: 'from-gray-500 to-gray-600',
          description: 'Unknown tier'
        };
    }
  };

  const getFeatureIcon = (feature) => {
    switch (feature) {
      case 'documents': return FileText;
      case 'storage': return HardDrive;
      case 'aiQueries': return Brain;
      case 'studyGroups': return Users2;
      case 'collaboration': return Users2;
      case 'analytics': return BarChart3;
      case 'export': return Download;
      case 'apiAccess': return Settings;
      default: return Check;
    }
  };

  const getFeatureName = (feature) => {
    switch (feature) {
      case 'documents': return 'Documents';
      case 'storage': return 'Storage';
      case 'aiQueries': return 'Study Sessions';
      case 'studyGroups': return 'Study Groups';
      case 'collaboration': return 'Collaboration';
      case 'analytics': return 'Analytics';
      case 'export': return 'Export';
      case 'apiAccess': return 'API Access';
      default: return feature;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  const tierInfo = getTierInfo(subscription?.tier || 'free');

  return (
    <>
      <Navbar />
    
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Subscription Management
          </h1>
          <p className="text-xl text-gray-300">
            Manage your subscription and view your current plan
          </p>
        </motion.div>

        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${tierInfo.color} mr-4`}>
                  <tierInfo.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{tierInfo.name}</h2>
                  <p className="text-gray-300">{tierInfo.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Status</div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  subscription?.status === 'active' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {subscription?.status?.charAt(0).toUpperCase() + subscription?.status?.slice(1)}
                </div>
              </div>
            </div>

            {subscription?.endDate && (
              <div className="flex items-center text-gray-300 mb-4">
                <Calendar className="w-5 h-5 mr-2" />
                <span>
                  {subscription.status === 'active' ? 'Renews on' : 'Expires on'}: {' '}
                  {new Date(subscription.endDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {subscription?.tier !== 'free' && (
              <div className="flex gap-4">
                <button
                  onClick={() => window.location.href = '/pricing'}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Change Plan
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Your Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(subscription?.features || {}).map(([feature, data]) => {
              const Icon = getFeatureIcon(feature);
              const isUnlimited = data.max === -1;
              const isEnabled = data.enabled;
              const usage = data.used || 0;
              const max = data.max || 0;
              
              return (
                <div key={feature} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                  <div className="flex items-center mb-4">
                    <Icon className="w-6 h-6 text-purple-400 mr-3" />
                    <h4 className="text-lg font-semibold text-white">
                      {getFeatureName(feature)}
                    </h4>
                  </div>
                  
                  {isEnabled !== undefined ? (
                    <div className="flex items-center">
                      {isEnabled ? (
                        <Check className="w-5 h-5 text-green-400 mr-2" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mr-2" />
                      )}
                      <span className={isEnabled ? 'text-green-400' : 'text-red-400'}>
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-sm text-gray-300 mb-2">
                        <span>{usage}</span>
                        <span>{isUnlimited ? '∞' : max}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            isUnlimited ? 'bg-green-500' : 
                            usage >= max ? 'bg-red-500' : 'bg-purple-500'
                          }`}
                          style={{ 
                            width: isUnlimited ? '100%' : `${Math.min((usage / max) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {isUnlimited ? 'Unlimited' : `${usage}/${max} used`}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Upgrade Prompt */}
        {subscription?.tier === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to unlock your potential?
              </h3>
              <p className="text-gray-300 mb-6">
                Upgrade to Premium or Enterprise to access advanced features, 
                unlimited storage, and advanced study tools.
              </p>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              >
                View Pricing Plans
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
};

export default Subscription;
