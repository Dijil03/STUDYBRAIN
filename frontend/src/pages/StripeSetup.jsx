import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react';

const StripeSetup = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const envVars = `# Database
MONGODB_URI=mongodb://localhost:27017/brain

# JWT
JWT_SECRET=your_jwt_secret_here

# Server
PORT=5001
FRONTEND_URL=http://localhost:5173

# Stripe (Get these from your Stripe dashboard)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Stripe Price IDs (Create these in your Stripe dashboard)
STUDY_PRO_MONTHLY_PRICE_ID=price_study_pro_monthly_gbp
STUDY_PRO_YEARLY_PRICE_ID=price_study_pro_yearly_gbp
STUDY_MASTER_MONTHLY_PRICE_ID=price_study_master_monthly_gbp
STUDY_MASTER_YEARLY_PRICE_ID=price_study_master_yearly_gbp`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertCircle className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Stripe Setup Required
            </h1>
            <p className="text-xl text-gray-300">
              To enable subscription payments, you need to configure Stripe
            </p>
          </div>

          {/* Setup Steps */}
          <div className="space-y-8">
            {/* Step 1: Create Stripe Account */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Create Stripe Account</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Go to Stripe and create a free account to get your API keys.
              </p>
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Go to Stripe Dashboard
              </a>
            </motion.div>

            {/* Step 2: Get API Keys */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Get Your API Keys</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-300">
                  In your Stripe dashboard, go to <strong>Developers → API Keys</strong>
                </p>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-300">Test Mode Keys</span>
                    <span className="text-xs text-yellow-400">Use these for development</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <code className="text-green-400">STRIPE_SECRET_KEY</code>
                      <span className="text-xs text-gray-400">starts with sk_test_</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-blue-400">STRIPE_PUBLISHABLE_KEY</code>
                      <span className="text-xs text-gray-400">starts with pk_test_</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 3: Create Products */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Create Products & Prices</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Create these products in your Stripe dashboard:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Study Pro</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Monthly:</span>
                        <span className="text-green-400">£7.99/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Yearly:</span>
                        <span className="text-green-400">£79.99/year</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Study Master</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Monthly:</span>
                        <span className="text-green-400">£9.99/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Yearly:</span>
                        <span className="text-green-400">£99.99/year</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 4: Environment Variables */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">4</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Add Environment Variables</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Create a <code className="bg-gray-800 px-2 py-1 rounded">.env</code> file in your backend folder:
                </p>
                <div className="bg-gray-900 rounded-lg p-4 relative">
                  <button
                    onClick={() => copyToClipboard(envVars)}
                    className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    {envVars}
                  </pre>
                </div>
                <p className="text-sm text-gray-400">
                  Replace the placeholder values with your actual Stripe keys and price IDs
                </p>
              </div>
            </motion.div>

            {/* Step 5: Test Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">5</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Test Cards for Development</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Use these test cards to test your payment flow (no real money charged):
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">✅ Successful Payments</h3>
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
                    <div className="mt-3 text-xs text-gray-400">
                      Expiry: Any future date (12/25)<br/>
                      CVC: Any 3 digits (123)
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">❌ Failed Payments</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Declined:</span>
                        <code className="text-red-400">4000 0000 0000 0002</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Insufficient:</span>
                        <code className="text-red-400">4000 0000 0000 9995</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Lost card:</span>
                        <code className="text-red-400">4000 0000 0000 9987</code>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      Use these to test error handling
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 6: Test Flow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">6</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Test Your Payment Flow</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Follow these steps to test your complete payment system:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div>
                      <span className="text-white font-semibold">Start your servers</span>
                      <p className="text-gray-400 text-sm">Backend: npm run dev (port 5001) | Frontend: npm run dev (port 5173)</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div>
                      <span className="text-white font-semibold">Go to pricing page</span>
                      <p className="text-gray-400 text-sm">Navigate to http://localhost:5173/pricing</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div>
                      <span className="text-white font-semibold">Click "Upgrade to Pro"</span>
                      <p className="text-gray-400 text-sm">This should open Stripe Checkout with your products</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-sm font-bold">4</span>
                    </div>
                    <div>
                      <span className="text-white font-semibold">Use test card</span>
                      <p className="text-gray-400 text-sm">Card: 4242 4242 4242 4242 | Expiry: 12/25 | CVC: 123</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-sm font-bold">5</span>
                    </div>
                    <div>
                      <span className="text-white font-semibold">Complete payment</span>
                      <p className="text-gray-400 text-sm">Check Stripe dashboard for test payment and your app for subscription activation</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/payment-test'}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              >
                <CreditCard className="w-5 h-5 mr-2 inline" />
                Test Payments
              </button>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              >
                <CreditCard className="w-5 h-5 mr-2 inline" />
                Go to Pricing
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default StripeSetup;
