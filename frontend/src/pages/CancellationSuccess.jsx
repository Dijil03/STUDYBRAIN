import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, RefreshCw, ArrowLeft, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';
import PageSEO from '../components/PageSEO';
import api from '../utils/axios';

const CancellationSuccess = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stripeData, setStripeData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch Stripe data when user is loaded
  useEffect(() => {
    if (user?._id && user?.subscription?.stripeSubscriptionId) {
      fetchStripeData();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/google/success');
      if (response.status === 200) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStripeData = async () => {
    if (!user?._id) return;
    
    try {
      const response = await api.get(`/stripe/${user._id}/stripe-data`);
      if (response.data.success) {
        setStripeData(response.data.subscription);
        console.log('Fetched Stripe data for cancellation:', response.data.subscription);
      }
    } catch (error) {
      console.error('Error fetching Stripe data:', error);
    }
  };

  const getCancellationDate = () => {
    // Use Stripe data first, then fallback to local data
    if (stripeData?.currentPeriodEnd) {
      return new Date(stripeData.currentPeriodEnd).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (user?.subscription?.currentPeriodEnd) {
      return new Date(user.subscription.currentPeriodEnd).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'End of current billing period';
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
    <>
      <PageSEO 
        page="cancellation-success"
        title="Subscription Cancelled | StudyBrain"
        description="Your subscription has been successfully cancelled. You'll retain access until the end of your billing period."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Subscription Cancelled Successfully
              </h1>
              <p className="text-white/70 text-lg mb-6">
                Your subscription has been cancelled. You'll retain access to all premium features until the end of your current billing period.
              </p>
            </motion.div>

            {/* Cancellation Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="bg-white/5 rounded-xl p-6 mb-8"
            >
              <div className="flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Access Until</h3>
              </div>
              <p className="text-2xl font-bold text-blue-400 mb-2">
                {getCancellationDate()}
              </p>
              <p className="text-white/60 text-sm">
                You can continue using all premium features until this date
              </p>
              
              {/* Debug info for billing period */}
              {(stripeData || user?.subscription) && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-sm font-semibold mb-2">Billing Period Details:</p>
                  <div className="text-xs text-blue-200 space-y-1">
                    {stripeData?.currentPeriodEnd && (
                      <p>Stripe End Date: {new Date(stripeData.currentPeriodEnd).toLocaleString()}</p>
                    )}
                    {user?.subscription?.currentPeriodEnd && (
                      <p>Local End Date: {new Date(user.subscription.currentPeriodEnd).toLocaleString()}</p>
                    )}
                    {stripeData?.daysRemaining && (
                      <p>Days Remaining: {stripeData.daysRemaining}</p>
                    )}
                    <p>Data Source: {stripeData ? 'Live Stripe Data' : 'Local Database'}</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* What Happens Next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="bg-white/5 rounded-xl p-6 mb-8 text-left"
            >
              <h3 className="text-xl font-semibold text-white mb-4 text-center">What Happens Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Continue Using Premium Features</p>
                    <p className="text-white/60 text-sm">You'll keep all premium access until {getCancellationDate()}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Automatic Downgrade</p>
                    <p className="text-white/60 text-sm">After {getCancellationDate()}, you'll automatically move to the free plan</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Easy Reactivation</p>
                    <p className="text-white/60 text-sm">You can reactivate your subscription anytime from your profile</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/profile"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Profile
              </Link>
              
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Continue Studying
              </Link>
            </motion.div>

            {/* Reactivation Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
            >
              <div className="flex items-center justify-center mb-2">
                <CreditCard className="w-5 h-5 text-yellow-400 mr-2" />
                <p className="text-yellow-300 font-semibold">Want to Reactivate?</p>
              </div>
              <p className="text-yellow-200 text-sm">
                You can reactivate your subscription anytime from your profile page. No need to set up payment again!
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CancellationSuccess;
