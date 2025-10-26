import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/axios';

const StripeTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');

  const testCheckout = async (tier, billingCycle) => {
    setLoading(true);
    setResult(null);

    try {
      if (!userId) {
        setResult({ 
          type: 'error', 
          message: 'Please log in first. Go to /login to sign in.' 
        });
        return;
      }

      console.log('Testing checkout for:', { userId, tier, billingCycle });

      const response = await api.post(`/subscriptions/${userId}/checkout`, {
        tier,
        billingCycle
      });

      console.log('Checkout response:', response.data);

      if (response.data.success) {
        setResult({ 
          type: 'success', 
          message: `Checkout session created! Redirecting to: ${response.data.url}` 
        });
        
        // Redirect to Stripe Checkout
        setTimeout(() => {
          window.location.href = response.data.url;
        }, 2000);
      } else {
        setResult({ 
          type: 'error', 
          message: response.data.message || 'Failed to create checkout session' 
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setResult({ 
        type: 'error', 
        message: `Error: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
              Stripe Integration Test
            </h1>
            <p className="text-xl text-gray-300">
              Test your Stripe checkout integration
            </p>
          </motion.div>

          {/* User Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Current User</h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
                className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400"
              />
              <button
                onClick={() => {
                  localStorage.setItem('userId', userId);
                  setResult({ type: 'success', message: 'User ID saved!' });
                }}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Current: {localStorage.getItem('userId') || 'None'}
            </p>
          </motion.div>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4">Study Pro</h3>
              <p className="text-gray-300 mb-4">£7.99/month</p>
              <button
                onClick={() => testCheckout('premium', 'monthly')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-2" />
                )}
                Test Pro Checkout
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4">Study Master</h3>
              <p className="text-gray-300 mb-4">£9.99/month</p>
              <button
                onClick={() => testCheckout('enterprise', 'monthly')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-2" />
                )}
                Test Master Checkout
              </button>
            </motion.div>
          </div>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border ${
                result.type === 'success' 
                  ? 'bg-green-500/20 border-green-200' 
                  : 'bg-red-500/20 border-red-200'
              }`}
            >
              <div className="flex items-center">
                {result.type === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-400 mr-3" />
                )}
                <span className={`text-lg ${
                  result.type === 'success' ? 'text-green-200' : 'text-red-200'
                }`}>
                  {result.message}
                </span>
              </div>
            </motion.div>
          )}

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-blue-500/20 border border-blue-200 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-blue-200 mb-4">Test Instructions</h3>
            <ol className="text-blue-100 space-y-2 list-decimal list-inside">
              <li>Make sure you're logged in (User ID should be set)</li>
              <li>Click "Test Pro Checkout" or "Test Master Checkout"</li>
              <li>You should be redirected to Stripe Checkout</li>
              <li>Use test card: <code className="bg-blue-600 px-2 py-1 rounded">4242 4242 4242 4242</code></li>
              <li>Complete the payment to test the full flow</li>
            </ol>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default StripeTest;

