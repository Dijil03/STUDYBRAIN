import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RefreshCw, Zap, Crown, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/axios';

const SubscriptionTest = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/google/success');
      if (response.status === 200) {
        setUser(response.data.user);
        console.log('User data:', response.data.user);
        console.log('Subscription data:', response.data.user?.subscription);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testSubscription = async (plan) => {
    if (!user?.id) {
      alert('User ID not found');
      return;
    }

    try {
      const endpoint = plan === 'master' ? 'quick-fix-master' : 'quick-fix';
      const response = await api.post(`/api/stripe/${user.id}/${endpoint}`);
      
      if (response.data.success) {
        setTestResults(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: `Successfully set subscription to ${response.data.subscription.planName}`,
          subscription: response.data.subscription
        }]);
        
        // Refresh user data
        await fetchUserData();
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Error setting subscription: ${error.response?.data?.message || error.message}`
      }]);
    }
  };

  const resetSubscription = async () => {
    if (!user?.id) {
      alert('User ID not found');
      return;
    }

    try {
      const response = await api.post(`/api/stripe/${user.id}/update-subscription`, {
        plan: 'free',
        planName: 'Free Plan'
      });
      
      if (response.data.success) {
        setTestResults(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: 'Successfully reset subscription to Free Plan',
          subscription: response.data.subscription
        }]);
        
        // Refresh user data
        await fetchUserData();
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Error resetting subscription: ${error.response?.data?.message || error.message}`
      }]);
    }
  };

  const simulatePaymentFlow = async (plan, planName) => {
    if (!user?.id) {
      alert('User ID not found');
      return;
    }

    try {
      // Simulate the payment success flow
      const response = await api.post('/api/stripe/manual-update-subscription', {
        userId: user.id,
        plan: plan,
        planName: planName
      });
      
      if (response.data.success) {
        setTestResults(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: `Simulated payment flow: Successfully upgraded to ${planName}`,
          subscription: response.data.subscription
        }]);
        
        // Refresh user data
        await fetchUserData();
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Error simulating payment flow: ${error.response?.data?.message || error.message}`
      }]);
    }
  };

  const testCheckoutFlow = async (tier, billingCycle) => {
    try {
      console.log('Testing checkout flow:', { tier, billingCycle });
      
      // First test the test endpoint
      const testResponse = await api.post('/api/stripe/test-checkout', {
        tier, billingCycle
      });
      
      console.log('Test checkout response:', testResponse.data);
      
      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: `Test checkout endpoint working. Environment variables: ${JSON.stringify(testResponse.data.envVars)}`
      }]);
      
      // Now try the actual checkout
      if (user?.id) {
        const checkoutResponse = await api.post(`/api/stripe/${user.id}/checkout-test`, {
          tier, billingCycle
        });
        
        console.log('Checkout response:', checkoutResponse.data);
        
        if (checkoutResponse.data.success && checkoutResponse.data.url) {
          setTestResults(prev => [...prev, {
            id: Date.now(),
            type: 'success',
            message: `Checkout session created successfully! URL: ${checkoutResponse.data.url}`
          }]);
          
          // Ask user if they want to proceed to checkout
          if (window.confirm('Checkout session created! Do you want to proceed to Stripe checkout?')) {
            window.open(checkoutResponse.data.url, '_blank');
          }
        } else {
          setTestResults(prev => [...prev, {
            id: Date.now(),
            type: 'error',
            message: `Checkout failed: ${checkoutResponse.data.message || 'Unknown error'}`
          }]);
        }
      }
    } catch (error) {
      console.error('Test checkout error:', error);
      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Error testing checkout: ${error.response?.data?.message || error.message}`
      }]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Subscription Test Page</h1>
          
          {/* Current User Info */}
          <div className="bg-white/5 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Current User Info</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-white/70">User ID:</p>
                <p className="text-white font-mono text-sm">{user?.id}</p>
              </div>
              <div>
                <p className="text-white/70">Username:</p>
                <p className="text-white">{user?.username}</p>
              </div>
              <div>
                <p className="text-white/70">Email:</p>
                <p className="text-white">{user?.email}</p>
              </div>
              <div>
                <p className="text-white/70">Subscription Status:</p>
                <p className="text-white">{user?.subscription?.status || 'No subscription'}</p>
              </div>
              <div>
                <p className="text-white/70">Plan:</p>
                <p className="text-white">{user?.subscription?.plan || 'free'}</p>
              </div>
              <div>
                <p className="text-white/70">Plan Name:</p>
                <p className="text-white">{user?.subscription?.planName || 'Free Plan'}</p>
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => testSubscription('pro')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Star className="w-5 h-5" />
              <span>Set to Study Pro</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => testSubscription('master')}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Crown className="w-5 h-5" />
              <span>Set to Study Master</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetSubscription}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>Reset to Free</span>
            </motion.button>
          </div>

          {/* Simulate Payment Flow Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => simulatePaymentFlow('premium', 'Study Pro')}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Star className="w-5 h-5" />
              <span>Simulate Payment → Study Pro</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => simulatePaymentFlow('enterprise', 'Study Master')}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Crown className="w-5 h-5" />
              <span>Simulate Payment → Study Master</span>
            </motion.button>
          </div>

          {/* Test Checkout Flow Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => testCheckoutFlow('premium', 'monthly')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Star className="w-5 h-5" />
              <span>Test Checkout → Study Pro</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => testCheckoutFlow('enterprise', 'monthly')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Crown className="w-5 h-5" />
              <span>Test Checkout → Study Master</span>
            </motion.button>
          </div>

          {/* Refresh Button */}
          <div className="text-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchUserData}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh Data</span>
            </motion.button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Test Results</h3>
              <div className="space-y-3">
                {testResults.slice(-5).reverse().map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      result.type === 'success' 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'bg-red-500/20 border border-red-500/30'
                    }`}
                  >
                    {result.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        result.type === 'success' ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {result.message}
                      </p>
                      {result.subscription && (
                        <p className="text-white/70 text-sm">
                          Plan: {result.subscription.planName} ({result.subscription.plan})
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/profile'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View Profile
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/pricing'}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View Pricing
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionTest;
