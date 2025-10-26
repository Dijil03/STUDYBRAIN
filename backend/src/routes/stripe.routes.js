import express from 'express';
import { createCheckoutSession, createPortalSession, handleWebhook, updateUserSubscription, migrateUserSubscriptions, updateSubscriptionFromSession, fetchStripeSubscriptionData } from '../controllers/stripe.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import User from '../models/auth.model.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Create checkout session (protected route)
router.post('/:userId/checkout', authMiddleware, createCheckoutSession);

// Test endpoint without auth for debugging
router.post('/:userId/checkout-test', createCheckoutSession);

// Simple test endpoint to verify checkout flow
router.post('/test-checkout', async (req, res) => {
  try {
    const { tier, billingCycle } = req.body;

    console.log('Test checkout request:', { tier, billingCycle });

    // Check if environment variables are set
    const envVars = {
      STUDY_PRO_MONTHLY_PRICE_ID: process.env.STUDY_PRO_MONTHLY_PRICE_ID ? 'Set' : 'Not set',
      STUDY_PRO_YEARLY_PRICE_ID: process.env.STUDY_PRO_YEARLY_PRICE_ID ? 'Set' : 'Not set',
      STUDY_MASTER_MONTHLY_PRICE_ID: process.env.STUDY_MASTER_MONTHLY_PRICE_ID ? 'Set' : 'Not set',
      STUDY_MASTER_YEARLY_PRICE_ID: process.env.STUDY_MASTER_YEARLY_PRICE_ID ? 'Set' : 'Not set',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not set'
    };

    res.status(200).json({
      success: true,
      message: 'Test checkout endpoint working',
      envVars,
      requestData: { tier, billingCycle }
    });
  } catch (error) {
    console.error('Test checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Test checkout failed',
      error: error.message
    });
  }
});

// Manual subscription update for testing
router.post('/:userId/update-subscription', updateUserSubscription);

// Migration endpoint to initialize subscriptions for all users
router.post('/migrate-subscriptions', migrateUserSubscriptions);

// Create portal session (protected route)
router.post('/:userId/portal', authMiddleware, createPortalSession);

// Cancel subscription (protected route)
router.post('/:userId/cancel-subscription', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { subscriptionId } = req.body;

    console.log('=== CANCEL SUBSCRIPTION REQUEST ===');
    console.log('User ID:', userId);
    console.log('Subscription ID:', subscriptionId);
    console.log('Request body:', req.body);

    if (!subscriptionId) {
      console.log('❌ No subscription ID provided');
      return res.status(400).json({
        success: false,
        message: 'Subscription ID is required'
      });
    }

    // Check if this is a test subscription ID
    if (subscriptionId.startsWith('test_') || subscriptionId.startsWith('manual_') || subscriptionId.startsWith('test_subscription_')) {
      console.log('⚠️ Test subscription ID detected, simulating cancellation');

      // For test subscriptions, just return success without calling Stripe
      return res.status(200).json({
        success: true,
        message: 'Test subscription cancelled (simulated)',
        subscription: {
          id: subscriptionId,
          cancel_at_period_end: true,
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      });
    }

    console.log('🔄 Calling Stripe API to cancel subscription...');

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    console.log('✅ Subscription cancelled at period end:', subscription.id);

    res.status(200).json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current period',
      subscription: {
        id: subscription.id,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: subscription.current_period_end
      }
    });
  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    });

    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: error.message,
      details: error.type || 'Unknown error'
    });
  }
});

// Get user subscription
router.get('/:userId/subscription', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
      error: error.message
    });
  }
});

// Fetch real subscription data from Stripe
router.get('/:userId/stripe-data', authMiddleware, fetchStripeSubscriptionData);

// Update subscription from successful payment
router.post('/update-subscription-from-session', updateSubscriptionFromSession);

// Get session details from Stripe
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    console.log('Getting session details for:', sessionId);

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Retrieved session:', session.id, 'Status:', session.payment_status);

    res.status(200).json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        customer: session.customer,
        subscription: session.subscription,
        metadata: session.metadata
      }
    });
  } catch (error) {
    console.error('Error getting session details:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting session details',
      error: error.message
    });
  }
});

// Webhook endpoint (no auth needed - Stripe signs the request)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Test endpoint to check user subscription
router.get('/:userId/test-subscription', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`Testing subscription for user ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User subscription:', user.subscription);

    res.status(200).json({
      success: true,
      message: 'User subscription retrieved',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Error testing subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing subscription',
      error: error.message
    });
  }
});

// Quick fix endpoint to set any user to Study Pro
router.post('/:userId/quick-fix', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`Quick fix subscription for user ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Force update subscription to Study Pro
    user.subscription = {
      status: 'active',
      plan: 'premium',
      planName: 'Study Pro',
      stripeCustomerId: 'test_customer_' + Date.now(),
      stripeSubscriptionId: 'test_subscription_' + Date.now(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false
    };

    await user.save();
    console.log(`✅ Quick fix: Updated user ${userId} to Study Pro`);

    res.status(200).json({
      success: true,
      message: 'Subscription quick fixed to Study Pro',
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Error in quick fix:', error);
    res.status(500).json({
      success: false,
      message: 'Error in quick fix',
      error: error.message
    });
  }
});

// Test endpoint to update any user's subscription (for debugging)
router.post('/test-update-subscription', async (req, res) => {
  try {
    const { userId, plan, planName } = req.body;

    console.log('=== TEST UPDATE SUBSCRIPTION ===');
    console.log('Request body:', req.body);
    console.log('User ID:', userId);
    console.log('Plan:', plan);
    console.log('Plan Name:', planName);

    if (!userId) {
      console.log('❌ No userId provided');
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    console.log('Looking for user with ID:', userId);
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found with ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User found:', {
      id: user._id,
      username: user.username,
      email: user.email,
      currentSubscription: user.subscription
    });

    // Update subscription
    user.subscription = {
      status: 'active',
      plan: plan || 'premium',
      planName: planName || 'Study Pro',
      stripeCustomerId: 'test_customer_' + Date.now(),
      stripeSubscriptionId: 'test_subscription_' + Date.now(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false
    };

    await user.save();
    console.log(`✅ Test update: Updated user ${userId} to ${planName}`);
    console.log('New subscription:', user.subscription);

    res.status(200).json({
      success: true,
      message: `Subscription updated to ${planName}`,
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Error in test update:', error);
    res.status(500).json({
      success: false,
      message: 'Error in test update',
      error: error.message
    });
  }
});

// Quick fix endpoint to set any user to Study Master
router.post('/:userId/quick-fix-master', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`Quick fix subscription for user ${userId} to Study Master`);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Force update subscription to Study Master
    user.subscription = {
      status: 'active',
      plan: 'enterprise',
      planName: 'Study Master',
      stripeCustomerId: 'test_customer_' + Date.now(),
      stripeSubscriptionId: 'test_subscription_' + Date.now(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false
    };

    await user.save();
    console.log(`✅ Quick fix: Updated user ${userId} to Study Master`);

    res.status(200).json({
      success: true,
      message: 'Subscription quick fixed to Study Master',
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Error in quick fix:', error);
    res.status(500).json({
      success: false,
      message: 'Error in quick fix',
      error: error.message
    });
  }
});

// Manual subscription update endpoint (for testing)
router.post('/manual-update-subscription', async (req, res) => {
  try {
    const { userId, plan, planName } = req.body;

    console.log(`Manual subscription update for user ${userId} to ${planName}`);

    if (!userId || !plan || !planName) {
      return res.status(400).json({
        success: false,
        message: 'userId, plan, and planName are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update subscription
    user.subscription = {
      status: 'active',
      plan: plan,
      planName: planName,
      stripeCustomerId: 'manual_' + Date.now(),
      stripeSubscriptionId: 'manual_sub_' + Date.now(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false
    };

    await user.save();
    console.log(`✅ Manual update: Updated user ${userId} to ${planName}`);

    res.status(200).json({
      success: true,
      message: `Subscription updated to ${planName}`,
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Error in manual update:', error);
    res.status(500).json({
      success: false,
      message: 'Error in manual update',
      error: error.message
    });
  }
});

export default router;
