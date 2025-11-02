import Stripe from 'stripe';
import User from '../models/auth.model.js';
import Subscription from '../models/subscription.model.js';
import Payment from '../models/payment.model.js';
// Email service removed

import dotenv from 'dotenv';
dotenv.config();

// Initialize Stripe with your key (test or live based on environment)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to get frontend URL with proper fallbacks
const getFrontendUrl = () => {
  // Priority: FRONTEND_URL > CLIENT_URL > Vercel production URL > localhost
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  if (process.env.CLIENT_URL) {
    return process.env.CLIENT_URL;
  }
  // In production, default to Vercel URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://studybrain.vercel.app';
  }
  // Development fallback
  return 'http://localhost:5173';
};

// Create checkout session
export const createCheckoutSession = async (req, res) => {
  try {
    console.log('=== STRIPE CHECKOUT SESSION START ===');
    const { userId } = req.params;
    const { tier, billingCycle } = req.body;

    console.log('Creating checkout session for:', { userId, tier, billingCycle });

    // Debug environment variables
    console.log('Environment variables:');
    console.log('STUDY_PRO_MONTHLY_PRICE_ID:', process.env.STUDY_PRO_MONTHLY_PRICE_ID ? 'Set' : 'Not set');
    console.log('STUDY_PRO_YEARLY_PRICE_ID:', process.env.STUDY_PRO_YEARLY_PRICE_ID ? 'Set' : 'Not set');
    console.log('STUDY_MASTER_MONTHLY_PRICE_ID:', process.env.STUDY_MASTER_MONTHLY_PRICE_ID ? 'Set' : 'Not set');
    console.log('STUDY_MASTER_YEARLY_PRICE_ID:', process.env.STUDY_MASTER_YEARLY_PRICE_ID ? 'Set' : 'Not set');

    // Get user from database
    console.log('Looking up user with ID:', userId);
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    console.log('User found:', { id: user._id, email: user.email, username: user.username });

    // Map tier names to price IDs from environment variables
    const priceIds = {
      'premium': {
        'monthly': process.env.STUDY_PRO_MONTHLY_PRICE_ID,
        'yearly': process.env.STUDY_PRO_YEARLY_PRICE_ID
      },
      'enterprise': {
        'monthly': process.env.STUDY_MASTER_MONTHLY_PRICE_ID,
        'yearly': process.env.STUDY_MASTER_YEARLY_PRICE_ID
      }
    };

    const priceId = priceIds[tier]?.[billingCycle];
    console.log('Selected price ID:', priceId);
    console.log('Price ID exists:', !!priceId);
    console.log('Price ID starts with "price_":', priceId?.startsWith('price_'));
    console.log('Price ID starts with "prod_":', priceId?.startsWith('prod_'));

    if (!priceId) {
      console.log('Price ID not found for tier:', tier, 'billingCycle:', billingCycle);
      return res.status(400).json({
        success: false,
        message: 'Invalid tier or billing cycle, or price ID not configured'
      });
    }

    console.log('Using price ID:', priceId);
    console.log('User email:', user.email);
    console.log('Tier:', tier, 'Billing Cycle:', billingCycle);

    // Get frontend URL with proper fallback
    const frontendUrl = getFrontendUrl();
    console.log('Using frontend URL for Stripe redirects:', frontendUrl);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/payment-success?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        tier: tier,
        billingCycle: billingCycle
      }
    });

    console.log('Checkout session created:', session.id);

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Stripe error details:', {
      type: error.type,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode
    });

    res.status(500).json({
      success: false,
      message: `Stripe error: ${error.message}`,
      error: error.message,
      stripeError: {
        type: error.type,
        code: error.code,
        statusCode: error.statusCode
      }
    });
  }
};

// Create portal session for customer management
export const createPortalSession = async (req, res) => {
  try {
    const { userId } = req.params;
    const { customerId, session_id } = req.body;

    console.log('Creating portal session for user:', userId);

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let customerIdToUse = customerId;

    // If no customerId provided, try to get it from session_id or user subscription
    if (!customerIdToUse) {
      if (session_id) {
        // Get checkout session to retrieve customer
        const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
        customerIdToUse = checkoutSession.customer;
      } else if (user.subscription?.stripeCustomerId) {
        customerIdToUse = user.subscription.stripeCustomerId;
      }
    }

    if (!customerIdToUse) {
      return res.status(400).json({
        success: false,
        message: 'No customer ID found. Please subscribe first.'
      });
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerIdToUse,
      return_url: `${getFrontendUrl()}/profile`,
    });

    console.log('Portal session created:', portalSession.id);

    res.status(200).json({
      success: true,
      url: portalSession.url
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating portal session',
      error: error.message
    });
  }
};

// Handle webhook events
// Manual subscription update for testing
// Migration endpoint to initialize subscription for all users
export const migrateUserSubscriptions = async (req, res) => {
  try {
    console.log('Starting subscription migration for all users...');

    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    let updatedCount = 0;

    for (const user of users) {
      if (!user.subscription) {
        user.subscription = {
          status: 'inactive',
          plan: 'free',
          planName: 'Free Plan',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false
        };

        await user.save();
        updatedCount++;
        console.log(`✅ Migrated user: ${user.username} (${user.email})`);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} users.`);

    res.status(200).json({
      success: true,
      message: `Migration complete. Updated ${updatedCount} users.`,
      totalUsers: users.length,
      updatedUsers: updatedCount
    });
  } catch (error) {
    console.error('Error during migration:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
};

// Fetch real subscription data from Stripe
export const fetchStripeSubscriptionData = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Fetching Stripe subscription data for user:', userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.subscription?.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No Stripe subscription found for this user'
      });
    }

    // Fetch subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      user.subscription.stripeSubscriptionId,
      {
        expand: ['items.data.price.product', 'customer']
      }
    );

    // Fetch customer data
    const customer = await stripe.customers.retrieve(stripeSubscription.customer);

    // Get price and product information
    const price = stripeSubscription.items.data[0].price;
    const product = price.product;

    // Calculate billing information
    const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    const daysRemaining = Math.ceil((currentPeriodEnd - new Date()) / (1000 * 60 * 60 * 24));

    // Determine plan details
    let planName = 'Unknown Plan';
    let planTier = 'free';
    let billingCycle = 'monthly';

    if (product.name.includes('Study Pro')) {
      planName = 'Study Pro';
      planTier = 'premium';
    } else if (product.name.includes('Study Master')) {
      planName = 'Study Master';
      planTier = 'enterprise';
    }

    if (price.recurring.interval === 'year') {
      billingCycle = 'yearly';
    }

    const subscriptionData = {
      // Basic info
      id: stripeSubscription.id,
      status: stripeSubscription.status,
      plan: planTier,
      planName: planName,
      billingCycle: billingCycle,
      
      // Billing periods
      currentPeriodStart: currentPeriodStart,
      currentPeriodEnd: currentPeriodEnd,
      daysRemaining: daysRemaining,
      
      // Cancellation info
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null,
      
      // Pricing info
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring.interval,
      intervalCount: price.recurring.interval_count,
      
      // Customer info
      customerId: stripeSubscription.customer,
      customerEmail: customer.email,
      customerName: customer.name,
      
      // Timestamps
      created: new Date(stripeSubscription.created * 1000),
      trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
      
      // Raw Stripe data for debugging
      rawStripeData: {
        subscription: stripeSubscription,
        customer: customer,
        price: price,
        product: product
      }
    };

    console.log('Fetched subscription data:', {
      planName,
      status: stripeSubscription.status,
      currentPeriodEnd: currentPeriodEnd.toISOString(),
      daysRemaining
    });

    res.status(200).json({
      success: true,
      subscription: subscriptionData
    });

  } catch (error) {
    console.error('Error fetching Stripe subscription data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription data from Stripe',
      error: error.message
    });
  }
};

export const updateUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { plan, planName } = req.body;

    console.log('Manually updating subscription for user:', userId, 'to plan:', plan);

    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ User not found with ID:', userId);
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

    // Initialize subscription if it doesn't exist
    if (!user.subscription) {
      user.subscription = {
        status: 'inactive',
        plan: 'free',
        planName: 'Free Plan',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      };
    }

    // Update user subscription
    user.subscription.status = 'active';
    user.subscription.plan = plan;
    user.subscription.planName = planName;
    user.subscription.stripeCustomerId = 'test_customer';
    user.subscription.stripeSubscriptionId = 'test_subscription';
    user.subscription.currentPeriodStart = new Date();
    user.subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    user.subscription.cancelAtPeriodEnd = false;

    await user.save();
    console.log(`✅ Manually updated user ${userId} subscription to ${plan}`);
    console.log('Updated subscription:', user.subscription);

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subscription',
      error: error.message
    });
  }
};

// Update subscription from Stripe session
export const updateSubscriptionFromSession = async (req, res) => {
  try {
    const { sessionId, userId } = req.body;

    console.log('Updating subscription from session:', { sessionId, userId });

    if (!sessionId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and User ID are required'
      });
    }

    // Get the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Retrieved session:', session.id, 'Status:', session.payment_status);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ User not found with ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    console.log('Retrieved subscription:', subscription.id, 'Status:', subscription.status);

    // Map tier from metadata
    const tier = session.metadata?.tier || 'premium';
    const billingCycle = session.metadata?.billingCycle || 'monthly';
    
    const planNames = {
      'premium': 'Study Pro',
      'enterprise': 'Study Master'
    };

    // Update user subscription
    user.subscription = {
      status: 'active',
      plan: tier,
      planName: planNames[tier] || 'Study Pro',
      stripeCustomerId: session.customer,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: false,
      billingCycle: billingCycle
    };

    await user.save();
    console.log(`✅ Updated user ${userId} subscription to ${tier} (${planNames[tier]})`);

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Error updating subscription from session:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subscription from session',
      error: error.message
    });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    console.log('🔔 Webhook received!');
    console.log('Headers:', req.headers);
    console.log('Body length:', req.body?.length);

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      console.log('Endpoint secret exists:', !!endpointSecret);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('✅ Webhook signature verified');
    console.log('Received webhook event:', event.type);
    console.log('Event data:', JSON.stringify(event.data.object, null, 2));

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.trial_will_end':
        await handleSubscriptionTrialEnding(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'entitlements.active_entitlement_summary.updated':
        await handleEntitlementUpdated(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}.`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook error',
      error: error.message
    });
  }
};

// Handle subscription trial ending
const handleSubscriptionTrialEnding = async (subscription) => {
  console.log(`Subscription trial ending: ${subscription.id}`);
  // Add your logic here
};

// Handle subscription deleted
const handleSubscriptionDeleted = async (subscription) => {
  console.log(`Subscription deleted: ${subscription.id}`);

  try {
    // Update subscription in database
    const subscriptionRecord = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: 'cancelled',
        endDate: new Date()
      }
    );
    console.log('Subscription cancelled in database');

    // Send cancellation email if user found
    if (subscriptionRecord) {
      try {
        // Email service removed - no cancellation email sent
      } catch (error) {
        console.error('Error processing cancellation:', error);
      }
    }
  } catch (error) {
    console.error('Error updating cancelled subscription:', error);
  }
};

// Handle subscription created
const handleSubscriptionCreated = async (subscription) => {
  console.log(`Subscription created: ${subscription.id}`);
  console.log('Subscription metadata:', subscription.metadata);

  try {
    const userId = subscription.metadata?.userId;
    const tier = subscription.metadata?.tier;
    const billingCycle = subscription.metadata?.billingCycle;

    console.log('Looking for user with ID:', userId);

    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Update user subscription in database
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return;
    }

    console.log('User found:', user.username, user.email);

    // Map tier to plan name
    const planNames = {
      'premium': 'Study Pro',
      'enterprise': 'Study Master'
    };

    // Update user subscription
    user.subscription = {
      status: 'active',
      plan: tier,
      planName: planNames[tier] || 'Unknown Plan',
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: false
    };

    await user.save();
    console.log(`✅ Updated user ${userId} subscription to ${tier} (${planNames[tier]})`);

    // Email service removed - no subscription success email sent
  } catch (error) {
    console.error('Error creating subscription:', error);
  }
};

// Handle subscription updated
const handleSubscriptionUpdated = async (subscription) => {
  console.log(`Subscription updated: ${subscription.id}`);

  try {
    // Update subscription in database
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: subscription.status,
        startDate: new Date(subscription.current_period_start * 1000),
        endDate: new Date(subscription.current_period_end * 1000)
      }
    );

    console.log('Subscription updated in database');
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
};

// Handle entitlement updated
const handleEntitlementUpdated = async (entitlement) => {
  console.log(`Entitlement updated: ${entitlement}`);
  // Add your logic here
};
