import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, Users, Shield, Clock, Sparkles } from 'lucide-react';
import Navbar from "../components/Navbar";
import api from '../utils/axios';
import { saveUserSession } from '../utils/session';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();

    // Listen for storage changes (when subscription is updated)
    const handleStorageChange = (e) => {
      if (e.key === 'userSubscription' || e.key === 'subscriptionUpdated') {
        console.log('Subscription updated, refreshing pricing...');
        fetchSubscription();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for subscription updates every 5 seconds
    const interval = setInterval(() => {
      fetchSubscription();
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const fetchSubscription = async () => {
    try {
      // Get user profile which includes subscription info
      const response = await api.get('/auth/google/success');
      if (response.status === 200 && response.data.user) {
        saveUserSession(response.data.user);
        if (response.data.user.subscription) {
          setSubscription(response.data.user.subscription);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier, billingCycle) => {
    try {
      console.log('Starting upgrade process:', { tier, billingCycle });
      
      let userId = null;
      
      // First, try to get userId from localStorage (faster, works even if API is down)
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        userId = storedUserId;
        console.log('User ID from localStorage:', userId);
      }
      
      // Then try to verify with API and get fresh user data (optional)
      try {
        const authResponse = await api.get('/auth/google/success');
        if (authResponse.status === 200 && authResponse.data.user?.id) {
          userId = authResponse.data.user.id;
          console.log('User ID from API:', userId);
          saveUserSession(authResponse.data.user);
        }
      } catch (apiError) {
        console.warn('API auth check failed, using localStorage:', apiError.message);
        // Continue with localStorage userId if available
        if (!userId) {
          throw new Error('Cannot get user ID. Please check your connection and try again.');
        }
      }
      
      if (!userId) {
        console.error('User ID not found in localStorage or API');
        alert('Please log in first to upgrade your subscription.');
        return;
      }

      // Store upgrade information in localStorage for payment form
      localStorage.setItem('upgradeInfo', JSON.stringify({
        tier,
        billingCycle,
        userId,
        timestamp: Date.now()
      }));

      console.log('Upgrade info stored, redirecting to payment form...');
      // Redirect to payment form instead of Stripe checkout
      window.location.href = '/payment-form';
      
    } catch (error) {
      console.error('Error preparing upgrade:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Error preparing upgrade. ';
      
      if (error.message.includes('Network') || error.message.includes('CORS')) {
        errorMessage += 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('log in')) {
        errorMessage = error.message;
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      alert(errorMessage);
    }
  };

  const plans = [
    {
      name: 'Student Starter',
      tier: 'free',
      icon: Users,
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started with your studies',
      features: [
        '3 documents maximum',
        'Basic study timer',
        'Simple homework tracker',
        '5 study sessions per day',
        'Basic flashcards',
        '1GB storage',
        'Standard support'
      ],
      limitations: [
        'Limited study assistance',
        'No collaboration features',
        'Basic analytics'
      ],
      color: 'from-blue-500 to-blue-600',
      buttonText: 'Current Plan',
      buttonColor: 'bg-gray-500',
      popular: false
    },
    {
      name: 'Study Pro',
      tier: 'premium',
      icon: Star,
      price: { monthly: 7.99, yearly: 79.99 },
      description: 'Advanced features for serious students',
      features: [
        'Unlimited documents',
        'Advanced study timer with custom sessions',
        'Advanced homework tracker with analytics',
        'Unlimited study tools',
        'Advanced flashcards with spaced repetition',
        '10GB storage',
        'Export to PDF/Word',
        'Basic analytics dashboard',
        'Study groups (up to 5 members)',
        'Real-time collaboration',
        'Priority support'
      ],
      limitations: [],
      color: 'from-purple-500 to-purple-600',
      buttonText: 'Upgrade to Pro',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      popular: true
    },
    {
      name: 'Study Master',
      tier: 'enterprise',
      icon: Crown,
      price: { monthly: 9.99, yearly: 99.99 },
      description: 'Complete solution for power users',
      features: [
        'Everything in Study Pro',
        'Unlimited storage',
        'Advanced analytics & insights',
        'Unlimited study groups',
        'Document collaboration (real-time)',
        'Advanced study features',
        'Custom themes & branding',
        'API access',
        'Advanced goal tracking',
        'Study session analytics',
        'White-label options',
        'Dedicated support'
      ],
      limitations: [],
      color: 'from-amber-500 to-amber-600',
      buttonText: 'Upgrade to Master',
      buttonColor: 'bg-amber-600 hover:bg-amber-700',
      popular: false
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-6">
            Choose Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Study Plan</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Unlock your full potential with our comprehensive study platform. 
            Start free and upgrade as you grow.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`text-lg ${!isYearly ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="mx-4 relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${isYearly ? 'text-white' : 'text-gray-400'}`}>Yearly</span>
            {isYearly && (
              <span className="ml-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                Save 17%
              </span>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border ${
                plan.popular 
                  ? 'border-purple-500 shadow-2xl shadow-purple-500/25 scale-105' 
                  : 'border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${plan.color} mb-4`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-300 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    £{isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-gray-400 ml-2">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                  {isYearly && plan.price.yearly > 0 && (
                    <div className="text-sm text-green-400 mt-1">
                      £{((plan.price.monthly * 12 - plan.price.yearly) / (plan.price.monthly * 12) * 100).toFixed(0)}% savings
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, limitIndex) => (
                  <div key={limitIndex} className="flex items-center">
                    <span className="w-5 h-5 mr-3 flex-shrink-0 text-gray-500">✗</span>
                    <span className="text-gray-500 line-through">{limitation}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (plan.tier === 'free') {
                    return; // Do nothing for free plan
                  }
                  const billingCycle = isYearly ? 'yearly' : 'monthly';
                  handleUpgrade(plan.tier, billingCycle);
                }}
                disabled={plan.tier === 'free' || (subscription && subscription.plan === plan.tier)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  plan.tier === 'free' || (subscription && subscription.plan === plan.tier)
                    ? 'bg-gray-500 cursor-not-allowed'
                    : plan.buttonColor
                } text-white hover:scale-105 disabled:hover:scale-100`}
              >
                {subscription && subscription.plan === plan.tier ? 'Current Plan' : plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Why Choose Our Platform?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-white mb-2">Secure & Private</h4>
                <p className="text-gray-300">Your data is encrypted and secure</p>
              </div>
              <div className="text-center">
                <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-white mb-2">Lightning Fast</h4>
                <p className="text-gray-300">Optimized for speed and performance</p>
              </div>
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-white mb-2">Smart Features</h4>
                <p className="text-gray-300">Smart features to boost your productivity</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default Pricing;
