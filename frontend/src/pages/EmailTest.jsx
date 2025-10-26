import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from '../utils/axios';

const EmailTest = () => {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [planName, setPlanName] = useState('Study Pro');
  const [amount, setAmount] = useState('9.99');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testWelcomeEmail = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await axios.post('/api/email/welcome', {
        email,
        userName: userName || 'Test User'
      });
      
      setResult({
        success: true,
        message: 'Welcome email sent successfully!',
        type: 'welcome'
      });
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Failed to send email',
        type: 'welcome'
      });
    } finally {
      setLoading(false);
    }
  };

  const testSubscriptionEmail = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await axios.post('/api/email/subscription', {
        email,
        userName: userName || 'Test User',
        planName,
        amount
      });
      
      setResult({
        success: true,
        message: 'Subscription email sent successfully!',
        type: 'subscription'
      });
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Failed to send email',
        type: 'subscription'
      });
    } finally {
      setLoading(false);
    }
  };

  const testCancellationEmail = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await axios.post('/api/email/cancellation', {
        email,
        userName: userName || 'Test User'
      });
      
      setResult({
        success: true,
        message: 'Cancellation email sent successfully!',
        type: 'cancellation'
      });
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Failed to send email',
        type: 'cancellation'
      });
    } finally {
      setLoading(false);
    }
  };

  const testPasswordResetEmail = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await axios.post('/api/email/password-reset', {
        email,
        userName: userName || 'Test User',
        resetLink: 'https://example.com/reset?token=test123'
      });
      
      setResult({
        success: true,
        message: 'Password reset email sent successfully!',
        type: 'password-reset'
      });
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Failed to send email',
        type: 'password-reset'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Mail className="w-10 h-10" />
            Email Testing Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Test your Mailtrap email integration with different templates
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Email Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Email Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  User Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Test User"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Plan Name
                </label>
                <select
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Study Pro">Study Pro</option>
                  <option value="Study Master">Study Master</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Amount
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="9.99"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Email Tests */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Test Email Templates</h2>
            
            <div className="space-y-4">
              <button
                onClick={testWelcomeEmail}
                disabled={!email || loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Test Welcome Email
              </button>

              <button
                onClick={testSubscriptionEmail}
                disabled={!email || loading}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Test Subscription Email
              </button>

              <button
                onClick={testCancellationEmail}
                disabled={!email || loading}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Test Cancellation Email
              </button>

              <button
                onClick={testPasswordResetEmail}
                disabled={!email || loading}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Test Password Reset Email
              </button>
            </div>
          </motion.div>
        </div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className={`flex items-center gap-3 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.success ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
              <h3 className="text-xl font-semibold">
                {result.success ? 'Success!' : 'Error'}
              </h3>
            </div>
            <p className="text-gray-300 mt-2">{result.message}</p>
            {result.success && (
              <p className="text-sm text-gray-400 mt-2">
                Check your Mailtrap inbox to see the email preview.
              </p>
            )}
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-blue-500/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30"
        >
          <h3 className="text-xl font-semibold text-white mb-4">📧 How to Test</h3>
          <div className="text-gray-300 space-y-2">
            <p>1. Make sure your backend server is running on port 5001</p>
            <p>2. Configure Mailtrap credentials in your .env file</p>
            <p>3. Enter a test email address above</p>
            <p>4. Click any test button to send an email</p>
            <p>5. Check your Mailtrap inbox to see the email preview</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailTest;

