import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Check, 
  ArrowLeft, 
  Shield, 
  Lock, 
  Star, 
  Crown, 
  Zap,
  Users,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/axios';

const PaymentForm = () => {
  const navigate = useNavigate();
  const [upgradeInfo, setUpgradeInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardholderName: '',
    billingAddress: '',
    city: '',
    postalCode: '',
    country: 'UK'
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Payment, 2: Processing, 3: Success

  useEffect(() => {
    // Get upgrade information from localStorage
    const storedUpgradeInfo = localStorage.getItem('upgradeInfo');
    if (storedUpgradeInfo) {
      setUpgradeInfo(JSON.parse(storedUpgradeInfo));
    } else {
      // Redirect back to pricing if no upgrade info
      navigate('/pricing');
    }
  }, [navigate]);

  const getPlanDetails = (tier) => {
    const plans = {
      'premium': {
        name: 'Study Pro',
        icon: Star,
        color: 'from-purple-500 to-purple-600',
        price: { monthly: 7.99, yearly: 79.99 },
        features: [
          'Unlimited documents',
          'Advanced study timer',
          'Advanced homework tracker',
          'Unlimited study tools',
          'Advanced flashcards',
          '10GB storage',
          'Export to PDF/Word',
          'Study groups (up to 5 members)',
          'Real-time collaboration',
          'Priority support'
        ]
      },
      'enterprise': {
        name: 'Study Master',
        icon: Crown,
        color: 'from-amber-500 to-amber-600',
        price: { monthly: 9.99, yearly: 99.99 },
        features: [
          'Everything in Study Pro',
          'Unlimited storage',
          'Advanced analytics',
          'Unlimited study groups',
          'Document collaboration',
          'Custom themes',
          'API access',
          'Advanced goal tracking',
          'Study session analytics',
          'White-label options',
          'Dedicated support'
        ]
      }
    };
    return plans[tier] || plans['premium'];
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!paymentData.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter cardholder name';
    }
    
    if (!paymentData.billingAddress.trim()) {
      newErrors.billingAddress = 'Please enter billing address';
    }
    
    if (!paymentData.city.trim()) {
      newErrors.city = 'Please enter city';
    }
    
    if (!paymentData.postalCode.trim()) {
      newErrors.postalCode = 'Please enter postal code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };


  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setStep(2);
    
    try {
      console.log('Creating Stripe checkout session...');
      
      // Create Stripe checkout session using existing backend
      const response = await api.post(`/stripe/${upgradeInfo.userId}/checkout`, {
        tier: upgradeInfo.tier,
        billingCycle: upgradeInfo.billingCycle
      });
      
      console.log('Stripe checkout response:', response.data);
      
      if (response.data.success && response.data.url) {
        // Store billing info for later use (optional)
        localStorage.setItem('billingInfo', JSON.stringify({
          cardholderName: paymentData.cardholderName,
          billingAddress: paymentData.billingAddress,
          city: paymentData.city,
          postalCode: paymentData.postalCode,
          country: paymentData.country,
          timestamp: Date.now()
        }));
        
        // Clear upgrade info from localStorage
        localStorage.removeItem('upgradeInfo');
        
        console.log('Redirecting to Stripe checkout:', response.data.url);
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        throw new Error(response.data.message || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      setStep(1);
      setLoading(false);
      alert('Failed to create checkout session. Please try again.');
    }
  };

  const goBack = () => {
    navigate('/pricing');
  };

  if (!upgradeInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  const planDetails = getPlanDetails(upgradeInfo.tier);
  const isYearly = upgradeInfo.billingCycle === 'yearly';
  const price = isYearly ? planDetails.price.yearly : planDetails.price.monthly;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <button
              onClick={goBack}
              className="flex items-center text-purple-300 hover:text-purple-100 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pricing
            </button>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Complete Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Upgrade</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Secure payment to unlock your new features
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              {step === 1 && (
                <form onSubmit={handlePayment} className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <CreditCard className="w-6 h-6 mr-2" />
                    Billing Information
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Please provide your billing details. You'll complete payment securely on Stripe.
                  </p>
                  
                  {/* Note about Stripe payment */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center text-blue-400 mb-2">
                      <Shield className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Secure Payment with Stripe</span>
                    </div>
                    <p className="text-blue-300 text-sm">
                      You'll be redirected to Stripe's secure payment page to complete your purchase. 
                      We don't store your payment information.
                    </p>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={paymentData.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.cardholderName ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    {errors.cardholderName && (
                      <p className="text-red-400 text-sm mt-1">{errors.cardholderName}</p>
                    )}
                  </div>

                  {/* Billing Address */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Billing Address
                    </label>
                    <input
                      type="text"
                      value={paymentData.billingAddress}
                      onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                      placeholder="123 Main Street"
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.billingAddress ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    {errors.billingAddress && (
                      <p className="text-red-400 text-sm mt-1">{errors.billingAddress}</p>
                    )}
                </div>

                  {/* City and Postal Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-white text-sm font-medium mb-2">
                      City
                    </label>
                    <input
                      type="text"
                        value={paymentData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="London"
                        className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.city ? 'border-red-500' : 'border-white/20'
                        }`}
                    />
                      {errors.city && (
                        <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                      )}
                  </div>
                    
                  <div>
                      <label className="block text-white text-sm font-medium mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                        value={paymentData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="SW1A 1AA"
                        className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.postalCode ? 'border-red-500' : 'border-white/20'
                        }`}
                    />
                      {errors.postalCode && (
                        <p className="text-red-400 text-sm mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                </div>

                  {/* Security Notice */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center text-green-400 mb-2">
                      <Shield className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Secure Payment</span>
                    </div>
                    <p className="text-green-300 text-sm">
                      Your payment information is encrypted and secure. We use industry-standard security measures.
                    </p>
                  </div>

                {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Redirecting to Stripe...' : `Continue to Stripe Payment - £${price}`}
                  </button>
                </form>
              )}

              {step === 2 && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-6"></div>
                  <h3 className="text-2xl font-bold text-white mb-4">Redirecting to Stripe</h3>
                  <p className="text-gray-300">Please wait while we redirect you to secure payment...</p>
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Payment Successful!</h3>
                  <p className="text-gray-300 mb-6">Your subscription has been activated. Redirecting to dashboard...</p>
                  <div className="animate-pulse">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Order Summary</h3>
              
              {/* Plan Details */}
              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${planDetails.color} mr-4`}>
                    <planDetails.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">{planDetails.name}</h4>
                    <p className="text-gray-300 capitalize">{upgradeInfo.billingCycle} billing</p>
                  </div>
                </div>
                
                <div className="text-3xl font-bold text-white mb-2">
                  £{price}
                  <span className="text-lg text-gray-400 ml-2">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>
                
                {isYearly && (
                  <div className="text-green-400 text-sm font-semibold">
                    Save £{((planDetails.price.monthly * 12 - planDetails.price.yearly)).toFixed(2)} per year!
                  </div>
                )}
              </div>

              {/* Features List */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">What you'll get:</h4>
                <div className="space-y-3">
                  {planDetails.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Features */}
              <div className="bg-white/5 rounded-lg p-4">
                <h5 className="text-white font-semibold mb-3 flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Security & Support
                </h5>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-green-400" />
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                    <span>Instant feature unlock</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-400" />
                    <span>Priority support</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentForm;