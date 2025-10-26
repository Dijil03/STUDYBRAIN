import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/axios';

const StripePricing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userStatus, setUserStatus] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);

  // Check user authentication status and subscription
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (userId) {
      setUserStatus({ 
        type: 'success', 
        message: `Logged in as: ${username || 'User'} (ID: ${userId})` 
      });
      fetchUserSubscription(userId);
    } else {
      setUserStatus({ 
        type: 'error', 
        message: 'Not logged in. Please go to /login to sign in first.' 
      });
    }
  }, []);

  const fetchUserSubscription = async (userId) => {
    try {
      // For now, we'll simulate the subscription data
      // In a real app, you'd fetch this from your backend
      const mockSubscription = {
        status: 'active',
        plan: 'premium',
        planName: 'Study Pro',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      setUserSubscription(mockSubscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handlePlanSelection = async (tier, billingCycle) => {
    setLoading(true);
    setError('');

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('Please log in first. Go to /login to sign in.');
        return;
      }

      console.log('Creating checkout session for:', { tier, billingCycle, userId });

      const response = await api.post(`/stripe/${userId}/checkout-test`, {
        tier,
        billingCycle
      });

      if (response.data.success) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      } else {
        setError(response.data.message || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Plan selection error:', error);
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        setError(errorData.message || 'Invalid request data');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(`Network error: ${error.message}. Please check your connection and try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '£0',
      duration: 'forever',
      icon: <Check className="w-8 h-8 text-green-500" />,
      features: [
        'Basic study tools',
        'Limited flashcards',
        'Basic analytics',
        'Community support'
      ],
      buttonText: userSubscription?.plan === 'free' ? 'Current Plan' : 'Downgrade',
      buttonClass: userSubscription?.plan === 'free' ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700',
      disabled: userSubscription?.plan === 'free'
    },
    {
      id: 'premium',
      name: 'Study Pro',
      price: '£7.99',
      duration: 'per month',
      icon: <Star className="w-8 h-8 text-purple-500" />,
      features: [
        'Unlimited documents',
        '10GB storage',
        'Advanced AI assistance',
        'Study groups',
        'Priority support'
      ],
      buttonText: userSubscription?.plan === 'premium' ? 'Current Plan' : 'Select Pro',
      buttonClass: userSubscription?.plan === 'premium' ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
      disabled: userSubscription?.plan === 'premium'
    },
    {
      id: 'enterprise',
      name: 'Study Master',
      price: '£9.99',
      duration: 'per month',
      icon: <Crown className="w-8 h-8 text-yellow-500" />,
      features: [
        'Everything in Pro',
        'Unlimited storage',
        'Advanced analytics & insights',
        'API access',
        'White-label options',
        '24/7 premium support'
      ],
      buttonText: userSubscription?.plan === 'enterprise' ? 'Current Plan' : 'Select Master',
      buttonClass: userSubscription?.plan === 'enterprise' ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
      disabled: userSubscription?.plan === 'enterprise'
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6 drop-shadow-lg">
              Choose a Study Plan
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Unlock your full potential with our premium study tools and features
            </p>
          </motion.div>

          {/* User Status */}
          {userStatus && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-md mx-auto mb-8 p-4 rounded-lg ${
                userStatus.type === 'success' 
                  ? 'bg-green-500/20 border border-green-200' 
                  : 'bg-red-500/20 border border-red-200'
              }`}
            >
              <div className="flex items-center justify-center">
                {userStatus.type === 'success' ? (
                  <Check className="w-5 h-5 text-green-400 mr-2" />
                ) : (
                  <Zap className="w-5 h-5 text-red-400 mr-2" />
                )}
                <span className={`text-sm ${
                  userStatus.type === 'success' ? 'text-green-200' : 'text-red-200'
                }`}>
                  {userStatus.message}
                </span>
              </div>
            </motion.div>
          )}

          {/* Subscription Status */}
          {userSubscription && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto mb-8 p-4 bg-blue-500/20 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Crown className="w-5 h-5 text-blue-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-200">
                      Current Plan: {userSubscription.planName}
                    </p>
                    <p className="text-xs text-blue-300">
                      Status: {userSubscription.status} • 
                      Next billing: {userSubscription.currentPeriodEnd.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-blue-500/30 text-blue-200 text-xs font-medium rounded-full">
                  Active
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto mb-8 p-4 bg-red-500/20 border border-red-200 rounded-lg"
            >
              <div className="flex items-center justify-center">
                <Zap className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-sm text-red-200">{error}</span>
              </div>
            </motion.div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 ${
                  plan.id === 'premium' ? 'ring-2 ring-purple-400 scale-105' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.id === 'premium' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Icon */}
                <div className="flex justify-center mb-6">
                  {plan.icon}
                </div>

                {/* Plan Name */}
                <h3 className="text-3xl font-bold text-white text-center mb-4">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="text-center mb-6">
                  <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-gray-300 ml-2">{plan.duration}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-200">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  onClick={() => !plan.disabled && handlePlanSelection(plan.id, 'monthly')}
                  disabled={plan.disabled || loading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    plan.disabled 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : plan.buttonClass
                  } text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Test Cards Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-4xl mx-auto border border-white/20"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <CreditCard className="w-6 h-6 mr-3 text-blue-400" />
              Test Cards for Development
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-500/20 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-green-400 mb-3">Successful Payments</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Visa:</span>
                    <code className="text-green-400">4242 4242 4242 4242</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Mastercard:</span>
                    <code className="text-green-400">5555 5555 5555 4444</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Amex:</span>
                    <code className="text-green-400">3782 822463 10005</code>
                  </div>
                </div>
              </div>
              <div className="bg-red-500/20 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-red-400 mb-3">Failed Payments</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Declined:</span>
                    <code className="text-red-400">4000 0000 0000 0002</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Insufficient Funds:</span>
                    <code className="text-red-400">4000 0000 0000 9995</code>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Use any future expiry date (e.g., 12/25) and any 3-digit CVC (e.g., 123)
            </p>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-16"
          >
            <p className="text-gray-300 mb-4">
              All plans include 30-day money-back guarantee
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-400">
              <span>✓ Secure payments</span>
              <span>✓ Cancel anytime</span>
              <span>✓ 24/7 support</span>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default StripePricing;
