# Subscription System Setup Guide

## 🚀 Quick Start

### 1. Backend Setup

1. **Install Stripe dependency:**
   ```bash
   cd backend
   npm install stripe
   ```

2. **Environment Variables:**
   Add these to your `.env` file:
   ```env
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   FRONTEND_URL=http://localhost:5173
   
   # Stripe Price IDs (Create these in your Stripe dashboard)
   PREMIUM_MONTHLY_PRICE_ID=price_premium_monthly
   PREMIUM_YEARLY_PRICE_ID=price_premium_yearly
   ENTERPRISE_MONTHLY_PRICE_ID=price_enterprise_monthly
   ENTERPRISE_YEARLY_PRICE_ID=price_enterprise_yearly
   ```

### 2. Stripe Dashboard Setup

1. **Create Stripe Account:**
   - Go to [stripe.com](https://stripe.com)
   - Create a free account
   - Get your API keys from the dashboard

2. **Create Products & Prices:**
   - Go to Products → Create Product
   - Create these products:
   
   **Study Pro (Premium)**
   - Name: Study Pro
   - Description: Advanced features for serious students
   - Monthly: $9.99/month
   - Yearly: $99.99/year
   
   **Study Master (Enterprise)**
   - Name: Study Master
   - Description: Complete solution for power users
   - Monthly: $19.99/month
   - Yearly: $199.99/year

3. **Get Price IDs:**
   - Copy the Price IDs from Stripe dashboard
   - Update your `.env` file with the actual Price IDs

### 3. Frontend Setup

The frontend is already configured with:
- ✅ Pricing page (`/pricing`)
- ✅ Subscription management (`/subscription`)
- ✅ Payment success page (`/subscription/success`)
- ✅ Feature gating utilities
- ✅ Navigation links

### 4. Test the System

1. **Start the backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the flow:**
   - Go to `/pricing`
   - Click "Upgrade to Pro"
   - Complete Stripe checkout (use test card: 4242 4242 4242 4242)
   - Verify subscription is created

## 📊 Features Implemented

### Backend
- ✅ Subscription model with feature limits
- ✅ Payment model for transaction tracking
- ✅ Stripe integration for payments
- ✅ Feature access checking
- ✅ Usage tracking
- ✅ Subscription management (cancel, upgrade)

### Frontend
- ✅ Beautiful pricing page with 3 tiers
- ✅ Subscription management dashboard
- ✅ Payment success/failure handling
- ✅ Feature gating components
- ✅ Usage tracking utilities

## 💰 Pricing Tiers

### 🆓 Free Tier - "Student Starter"
- 3 documents maximum
- Basic study timer
- 5 AI queries per day
- 1GB storage
- Basic flashcards

### ⭐ Premium Tier - "Study Pro" - $9.99/month
- Unlimited documents
- Advanced study timer
- Unlimited AI queries
- 10GB storage
- Real-time collaboration
- Advanced analytics
- Export features

### 🚀 Enterprise Tier - "Study Master" - $19.99/month
- Everything in Premium
- Unlimited storage
- API access
- Unlimited study groups
- Advanced AI features
- Custom branding
- Priority support

## 🔧 Usage Examples

### Feature Gating in Components
```jsx
import { FeatureGate, useFeatureGate } from '../utils/featureGate';

// Wrap components with feature gates
<FeatureGate feature="documents">
  <DocumentEditor />
</FeatureGate>

// Or use the hook
const { hasAccess, tier } = useFeatureGate('collaboration');
```

### Usage Tracking
```jsx
import { useUsageTracking } from '../utils/featureGate';

const { updateUsage } = useUsageTracking();

// Track when user creates a document
const createDocument = async () => {
  await updateUsage('documents', 1);
  // ... create document logic
};
```

## 🎯 Next Steps

1. **Set up Stripe webhooks** for real-time subscription updates
2. **Add email notifications** for subscription events
3. **Implement usage analytics** dashboard
4. **Add subscription upgrade/downgrade** flows
5. **Create admin dashboard** for subscription management

## 🚨 Important Notes

- **Test Mode**: Currently using Stripe test mode
- **Price IDs**: Must be created in Stripe dashboard
- **Webhooks**: Recommended for production
- **Security**: Validate all payments server-side
- **Backup**: Regular database backups for subscription data

## 📈 Revenue Potential

With 1,000 users:
- 10% conversion to Premium = 100 users × $9.99 = **$999/month**
- 5% conversion to Enterprise = 50 users × $19.99 = **$1,000/month**
- **Total: ~$2,000/month**

With 10,000 users:
- 15% conversion = 1,500 Premium + 100 Enterprise = **$16,000/month**

## 🆘 Support

If you need help:
1. Check Stripe dashboard for payment issues
2. Verify environment variables
3. Check browser console for errors
4. Ensure MongoDB is running
5. Verify all routes are properly configured

Happy monetizing! 💰🚀
