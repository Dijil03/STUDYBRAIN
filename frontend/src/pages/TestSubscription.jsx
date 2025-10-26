import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Zap, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/axios';

const TestSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const debugUser = async () => {
    setLoading(true);
    setResult(null);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setResult({
          type: 'error',
          message: 'No user ID found. Please log in first.'
        });
        return;
      }

      const response = await api.get(`/auth/debug/${userId}`);
      
      if (response.data.success) {
        setResult({
          type: 'success',
          message: `Debug successful! User has subscription: ${response.data.user.hasSubscription}`,
          subscription: response.data.user.subscription
        });
      } else {
        setResult({
          type: 'error',
          message: response.data.message || 'Debug failed'
        });
      }
    } catch (error) {
      console.error('Error debugging user:', error);
      setResult({
        type: 'error',
        message: `Error: ${error.response?.data?.message || error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const migrateSubscriptions = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/stripe/migrate-subscriptions');
      
      if (response.data.success) {
        setResult({
          type: 'success',
          message: `Migration successful! Updated ${response.data.updatedUsers} out of ${response.data.totalUsers} users.`
        });
      } else {
        setResult({
          type: 'error',
          message: response.data.message || 'Migration failed'
        });
      }
    } catch (error) {
      console.error('Error migrating subscriptions:', error);
      setResult({
        type: 'error',
        message: `Error: ${error.response?.data?.message || error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await api.get('/auth/google/success');
      
      if (response.status === 200) {
        const user = response.data.user;
        setResult({
          type: 'success',
          message: 'Profile refreshed successfully!',
          subscription: user.subscription,
          user: user
        });
      } else {
        setResult({
          type: 'error',
          message: 'Failed to refresh profile'
        });
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setResult({
        type: 'error',
        message: `Error: ${error.response?.data?.message || error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const quickFixSubscription = async () => {
    setLoading(true);
    setResult(null);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setResult({
          type: 'error',
          message: 'No user ID found. Please log in first.'
        });
        return;
      }

      const response = await api.post(`/stripe/${userId}/quick-fix`);
      
      if (response.data.success) {
        setResult({
          type: 'success',
          message: 'Quick fix successful! Your subscription has been updated to Study Pro.',
          subscription: response.data.subscription
        });
      } else {
        setResult({
          type: 'error',
          message: response.data.message || 'Quick fix failed'
        });
      }
    } catch (error) {
      console.error('Error in quick fix:', error);
      setResult({
        type: 'error',
        message: `Error: ${error.response?.data?.message || error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (plan, planName) => {
    setLoading(true);
    setResult(null);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setResult({
          type: 'error',
          message: 'No user ID found. Please log in first.'
        });
        return;
      }

      const response = await api.post(`/stripe/${userId}/update-subscription`, {
        plan,
        planName
      });

      if (response.data.success) {
        setResult({
          type: 'success',
          message: `Successfully updated subscription to ${planName}!`,
          subscription: response.data.subscription
        });
      } else {
        setResult({
          type: 'error',
          message: response.data.message || 'Failed to update subscription'
        });
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      setResult({
        type: 'error',
        message: `Error: ${error.response?.data?.message || error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'premium',
      name: 'Study Pro',
      icon: <Star className="w-6 h-6 text-purple-500" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'enterprise',
      name: 'Study Master',
      icon: <Crown className="w-6 h-6 text-amber-500" />,
      color: 'from-amber-500 to-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Test Subscription Update</h1>
            <p className="text-white/70">
              This page allows you to manually update your subscription for testing purposes.
            </p>
          </div>

          {/* Result Display */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg ${
                result.type === 'success'
                  ? 'bg-green-500/20 border border-green-500/30'
                  : 'bg-red-500/20 border border-red-500/30'
              }`}
            >
              <div className="flex items-center">
                {result.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                ) : (
                  <div className="w-5 h-5 bg-red-400 rounded-full mr-2" />
                )}
                <span className={`text-sm ${
                  result.type === 'success' ? 'text-green-200' : 'text-red-200'
                }`}>
                  {result.message}
                </span>
              </div>
              {result.subscription && (
                <div className="mt-2 text-xs text-white/70">
                  <pre>{JSON.stringify(result.subscription, null, 2)}</pre>
                </div>
              )}
            </motion.div>
          )}

          {/* Plan Selection */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/5 rounded-xl p-6 text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <button
                  onClick={() => updateSubscription(plan.id, plan.name)}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : `Set to ${plan.name}`}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Debug Button */}
          <div className="mt-8 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-2">🔍 Debug User Data:</h4>
            <p className="text-sm text-white/70 mb-4">
              Check what subscription data is stored for your user.
            </p>
            <button
              onClick={debugUser}
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Debugging...' : 'Debug User Subscription'}
            </button>
          </div>

          {/* Refresh Profile Button */}
          <div className="mt-8 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-2">🔄 Refresh Profile:</h4>
            <p className="text-sm text-white/70 mb-4">
              Fetch the latest user data from the backend to see updated subscription.
            </p>
            <button
              onClick={refreshProfile}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh Profile Data'}
            </button>
          </div>

          {/* Quick Fix Button */}
          <div className="mt-8 p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-2">⚡ Quick Fix:</h4>
            <p className="text-sm text-white/70 mb-4">
              If you're still seeing "Free Plan", click this to force update your subscription to Study Pro.
            </p>
            <button
              onClick={quickFixSubscription}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Fixing...' : 'Quick Fix to Study Pro'}
            </button>
          </div>

          {/* Migration Button */}
          <div className="mt-8 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-2">⚠️ First Time Setup:</h4>
            <p className="text-sm text-white/70 mb-4">
              If you're seeing "Free Plan" even after updating, you need to run the migration first.
            </p>
            <button
              onClick={migrateSubscriptions}
              disabled={loading}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Migrating...' : 'Run Migration (Initialize All Users)'}
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-2">Instructions:</h4>
            <ol className="text-sm text-white/70 space-y-1 list-decimal list-inside">
              <li><strong>First:</strong> Click "Debug User Subscription" to see current data</li>
              <li><strong>Then:</strong> Click "Run Migration" to initialize all users</li>
              <li>Make sure you're logged in (check the navbar for your username)</li>
              <li>Click on any plan to update your subscription</li>
              <li>Check your profile page to see the updated subscription</li>
              <li>Visit the pricing page to see your current plan status</li>
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TestSubscription;
