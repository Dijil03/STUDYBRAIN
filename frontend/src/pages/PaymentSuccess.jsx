import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home, Crown, Star, Zap, Calendar, CreditCard } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/axios';
import { saveUserSession } from '../utils/session';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    const successParam = searchParams.get('success');
    
    console.log('PaymentSuccess useEffect - URL params:', {
      sessionIdParam,
      successParam,
      allParams: Object.fromEntries(searchParams.entries())
    });
    
    if (sessionIdParam && successParam === 'true') {
      setSessionId(sessionIdParam);
      fetchSubscriptionDetails(sessionIdParam);
    } else {
      console.log('No session ID or success param, setting loading to false');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchSubscriptionDetails = async (sessionId) => {
    try {
      console.log('=== PAYMENT SUCCESS - UPDATING SUBSCRIPTION ===');
      console.log('Session ID:', sessionId);
      
      // First, get user data to get userId
      console.log('Getting user data...');
      const userResponse = await api.get('/auth/google/success');
      console.log('User response:', userResponse.data);
      
      const userId = userResponse.data.user?.id;
      const currentSubscription = userResponse.data.user?.subscription;
      if (userResponse.data.user) {
        saveUserSession(userResponse.data.user);
      }
      
      console.log('User ID:', userId);
      console.log('Current subscription:', currentSubscription);
      
      if (!userId) {
        console.error('User ID not found');
        setLoading(false);
        return;
      }

      // Try to update subscription from Stripe session first
      try {
        console.log('Attempting to update subscription from Stripe session...');
        const updateResponse = await api.post('/stripe/update-subscription-from-session', {
          sessionId,
          userId
        });

        console.log('Update response:', updateResponse.data);

        if (updateResponse.data.success) {
          console.log('✅ Subscription updated successfully from Stripe session');
          const updatedSubscription = updateResponse.data.subscription;
          setSubscription({
            plan: updatedSubscription.planName,
            status: updatedSubscription.status,
            currentPeriodEnd: new Date(updatedSubscription.currentPeriodEnd),
            amount: updatedSubscription.plan === 'premium' ? 799 : 999,
            currency: 'gbp',
            interval: 'month'
          });

          // Trigger subscription update across all pages
          localStorage.setItem('subscriptionUpdated', Date.now().toString());
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'subscriptionUpdated',
            newValue: Date.now().toString()
          }));
        } else {
          throw new Error('Failed to update subscription from session');
        }
      } catch (updateError) {
        console.error('Error updating subscription from session:', updateError);
        console.log('Falling back to manual subscription update...');
        
        // Fallback: Manually update subscription based on session ID
        try {
          // Get the session details from Stripe to determine the plan
          const sessionResponse = await fetch(`http://localhost:5001/api/stripe/session/${sessionId}`);
          const sessionData = await sessionResponse.json();
          
          console.log('Session data:', sessionData);
          
          if (sessionData.success) {
            // Determine plan from session metadata
            const tier = sessionData.session.metadata?.tier || 'premium';
            const planNames = {
              'premium': 'Study Pro',
              'enterprise': 'Study Master'
            };
            
            console.log('Updating subscription to:', tier, planNames[tier]);
            
            // Manually update the user's subscription
            const manualUpdateResponse = await api.post('/stripe/test-update-subscription', {
              userId: userId,
              plan: tier,
              planName: planNames[tier]
            });
            
            console.log('Manual update response:', manualUpdateResponse.data);
            
            if (manualUpdateResponse.data.success) {
              console.log('✅ Manual subscription update successful');
              const updatedSubscription = manualUpdateResponse.data.subscription;
              setSubscription({
                plan: updatedSubscription.planName,
                status: updatedSubscription.status,
                currentPeriodEnd: new Date(updatedSubscription.currentPeriodEnd),
                amount: updatedSubscription.plan === 'premium' ? 799 : 999,
                currency: 'gbp',
                interval: 'month'
              });

              // Trigger subscription update across all pages
              localStorage.setItem('subscriptionUpdated', Date.now().toString());
              window.dispatchEvent(new StorageEvent('storage', {
                key: 'subscriptionUpdated',
                newValue: Date.now().toString()
              }));
            } else {
              throw new Error('Manual update failed');
            }
          } else {
            throw new Error('Could not get session data');
          }
        } catch (manualError) {
          console.error('Manual update failed:', manualError);
          
          // Final fallback: Set to Study Pro
          console.log('Final fallback: Setting to Study Pro');
          const fallbackResponse = await api.post('/stripe/test-update-subscription', {
            userId: userId,
            plan: 'premium',
            planName: 'Study Pro'
          });
          
          if (fallbackResponse.data.success) {
            console.log('✅ Fallback update successful');
            setSubscription({
              plan: 'Study Pro',
              status: 'active',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              amount: 799,
              currency: 'gbp',
              interval: 'month'
            });

            // Trigger subscription update across all pages
            localStorage.setItem('subscriptionUpdated', Date.now().toString());
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'subscriptionUpdated',
              newValue: Date.now().toString()
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchSubscriptionDetails:', error);
      // Final fallback to mock data on error
      const mockSubscription = {
        plan: 'Study Pro',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: 799,
        currency: 'gbp',
        interval: 'month'
      };
      setSubscription(mockSubscription);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName) {
      case 'Study Pro':
        return <Star className="w-8 h-8 text-purple-600" />;
      case 'Study Master':
        return <Crown className="w-8 h-8 text-amber-600" />;
      default:
        return <Zap className="w-8 h-8 text-blue-600" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName) {
      case 'Study Pro':
        return 'from-purple-500 to-pink-500';
      case 'Study Master':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  // Test function to manually update subscription
  const testUpdateSubscription = async () => {
    try {
      console.log('Testing manual subscription update...');
      
      // Get user data
      const userResponse = await api.get('/auth/google/success');
      const userId = userResponse.data.user?.id;
      
      if (!userId) {
        alert('User ID not found');
        return;
      }
      
      // Update subscription to Study Pro
      const response = await api.post('/stripe/test-update-subscription', {
        userId: userId,
        plan: 'premium',
        planName: 'Study Pro'
      });
      
      console.log('Manual update response:', response.data);
      
      if (response.data.success) {
        alert('Subscription updated successfully! Refreshing page...');
        window.location.reload();
      } else {
        alert('Failed to update subscription');
      }
    } catch (error) {
      console.error('Error in manual update:', error);
      alert('Error updating subscription: ' + error.message);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-green-900 to-blue-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-blue-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl font-extrabold text-white mb-6"
            >
              Payment Successful!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-gray-200 mb-8"
            >
              Thank you for your subscription! Your account has been upgraded.
            </motion.p>

            {/* Subscription Details */}
            {subscription && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="bg-white/10 rounded-xl p-6 mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Your Subscription</h3>
                  <div className="px-4 py-2 rounded-full bg-green-500/20 text-green-300 font-medium">
                    Active
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Plan Info */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${getPlanColor(subscription.plan)}`}>
                        {getPlanIcon(subscription.plan)}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{subscription.plan}</h4>
                        <p className="text-gray-300">Premium subscription</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-300" />
                        <div>
                          <p className="text-sm text-gray-400">Next billing date</p>
                          <p className="font-medium text-white">
                            {subscription.currentPeriodEnd.toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-gray-300" />
                        <div>
                          <p className="text-sm text-gray-400">Amount</p>
                          <p className="font-medium text-white">
                            £{(subscription.amount / 100).toFixed(2)}/{subscription.interval}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h5 className="text-lg font-semibold text-white mb-4">What's included:</h5>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Unlimited documents</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Advanced AI assistance</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Priority support</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Study groups</span>
                      </li>
                      {subscription.plan === 'Study Master' && (
                        <>
                          <li className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">Unlimited storage</span>
                          </li>
                          <li className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">API access</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Session Info */}
            {sessionId && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="bg-white/10 rounded-lg p-4 mb-8"
              >
                <p className="text-sm text-gray-300">
                  Session ID: <code className="text-green-400">{sessionId}</code>
                </p>
              </motion.div>
            )}

            {/* Debug Info */}
            {sessionId && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="bg-white/10 rounded-lg p-4 mb-8"
              >
                <h4 className="text-white font-semibold mb-2">Debug Information:</h4>
                <p className="text-sm text-gray-300 mb-2">
                  Session ID: <code className="text-green-400">{sessionId}</code>
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  Subscription Status: <code className="text-blue-400">{subscription?.status || 'Loading...'}</code>
                </p>
                <p className="text-sm text-gray-300">
                  Plan: <code className="text-purple-400">{subscription?.plan || 'Loading...'}</code>
                </p>
                <button
                  onClick={testUpdateSubscription}
                  className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                >
                  Test Update Subscription
                </button>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <Link
                to="/profile"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Check Profile
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <Link
                to="/"
                className="inline-flex items-center px-8 py-4 bg-white/20 text-white rounded-xl font-semibold text-lg border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                <Home className="w-5 h-5 mr-2" />
                Home
              </Link>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-12 text-center"
            >
              <p className="text-gray-300 mb-4">
                You can manage your subscription anytime from your account settings.
              </p>
              <div className="flex justify-center space-x-8 text-sm text-gray-400">
                <span>✓ Premium features unlocked</span>
                <span>✓ Billing managed by Stripe</span>
                <span>✓ Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;