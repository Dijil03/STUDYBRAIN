# Stripe Setup Guide

## 🔧 Environment Variables Required

Add these to your `backend/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51SKjIII6A2TpsaBngiqeZ9heZsuf3IUXjb8FZTKpRQO2DGFWJdmbZrKAke199WIWlazL2eYUQkR6Z9q6cggHT3je00hWBbGdIV
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Session Secret
SESSION_SECRET=your_session_secret_here
```

## 🛍️ Stripe Products Setup

### 1. Create Products in Stripe Dashboard

Go to [Stripe Dashboard > Products](https://dashboard.stripe.com/products) and create these products:

#### Study Pro (Monthly)
- **Name**: Study Pro Monthly
- **Lookup Key**: `study-pro-monthly`
- **Price**: £7.99
- **Billing**: Recurring monthly

#### Study Pro (Yearly)
- **Name**: Study Pro Yearly  
- **Lookup Key**: `study-pro-yearly`
- **Price**: £79.99
- **Billing**: Recurring yearly

#### Study Master (Monthly)
- **Name**: Study Master Monthly
- **Lookup Key**: `study-master-monthly`
- **Price**: £9.99
- **Billing**: Recurring monthly

#### Study Master (Yearly)
- **Name**: Study Master Yearly
- **Lookup Key**: `study-master-yearly`
- **Price**: £99.99
- **Billing**: Recurring yearly

### 2. Test Cards

Use these test card numbers:

**Successful Payments:**
- Visa: `4242 4242 4242 4242`
- Mastercard: `5555 5555 5555 4444`
- Amex: `3782 822463 10005`

**Failed Payments:**
- Declined: `4000 0000 0000 0002`
- Insufficient Funds: `4000 0000 0000 9995`

Use any future expiry date (e.g., 12/25) and any 3-digit CVC (e.g., 123).

## 🚀 How to Test

1. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Payment Flow:**
   - Go to `http://localhost:5173/stripe-pricing`
   - Click "Select Pro" or "Select Master"
   - Use test card `4242 4242 4242 4242`
   - Complete payment
   - You'll be redirected to success page

## 🔗 API Endpoints

### Frontend Routes
- `/stripe-pricing` - Pricing page with plan selection
- `/payment-success` - Success page after payment
- `/?success=true&session_id={CHECKOUT_SESSION_ID}` - Success redirect

### Backend Routes
- `POST /api/stripe/:userId/checkout` - Create checkout session
- `POST /api/stripe/:userId/portal` - Create customer portal session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## 🎯 Features

- ✅ **Secure Payments** - Stripe handles all payment data
- ✅ **Test Mode** - Use test cards for development
- ✅ **Webhook Support** - Automatic subscription updates
- ✅ **Customer Portal** - Users can manage billing
- ✅ **Mobile Optimized** - Works on all devices
- ✅ **PCI Compliant** - No sensitive data stored

## 🔄 Webhook Events Handled

- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Subscription cancelled
- `customer.subscription.trial_will_end` - Trial ending
- `entitlements.active_entitlement_summary.updated` - Entitlement changes

## 🛠️ Troubleshooting

### Common Issues:

1. **"Stripe is not configured"**
   - Check `STRIPE_SECRET_KEY` in `.env`
   - Restart backend server

2. **"Price not found"**
   - Create products in Stripe dashboard
   - Use correct lookup keys

3. **"Authentication failed"**
   - Make sure user is logged in
   - Check session configuration

4. **Webhook not working**
   - Set up webhook endpoint in Stripe dashboard
   - Use `stripe listen` for local testing
