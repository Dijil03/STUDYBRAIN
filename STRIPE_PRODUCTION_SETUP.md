# Stripe Production Setup Guide

## 🔄 Switching from Sandbox to Production

### 1. **Update Environment Variables**

Replace your test keys with production keys in your `.env` file:

```env
# Production Stripe Keys (Replace test keys)
STRIPE_SECRET_KEY=sk_live_...  # Your live secret key
STRIPE_PUBLISHABLE_KEY=pk_live_...  # Your live publishable key

# Production Price IDs (Create these in Stripe Dashboard)
STUDY_PRO_MONTHLY_PRICE_ID=price_...  # Create monthly price for Study Pro
STUDY_PRO_YEARLY_PRICE_ID=price_...   # Create yearly price for Study Pro
STUDY_MASTER_MONTHLY_PRICE_ID=price_...  # Create monthly price for Study Master
STUDY_MASTER_YEARLY_PRICE_ID=price_...   # Create yearly price for Study Master

# Webhook Secret (Create webhook endpoint in Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL (Your production domain)
FRONTEND_URL=https://yourdomain.com
```

### 2. **Create Products and Prices in Stripe Dashboard**

1. **Go to Stripe Dashboard** → Products
2. **Create Study Pro Product:**
   - Name: "Study Pro"
   - Description: "Premium study features with unlimited access"
   - Create Monthly Price: $9.99/month
   - Create Yearly Price: $99.99/year (save 17%)

3. **Create Study Master Product:**
   - Name: "Study Master" 
   - Description: "Enterprise study features with advanced analytics"
   - Create Monthly Price: $19.99/month
   - Create Yearly Price: $199.99/year (save 17%)

### 3. **Set Up Webhook Endpoint**

1. **Go to Stripe Dashboard** → Webhooks
2. **Add Endpoint:** `https://yourdomain.com/api/stripe/webhook`
3. **Select Events:**
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. **Copy Webhook Secret** to your `.env` file

### 4. **Update Frontend Environment**

Update your frontend `.env` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_SITE_URL=https://yourdomain.com
```

### 5. **Test Production Setup**

1. **Use Test Cards First:**
   - 4242 4242 4242 4242 (Visa)
   - 4000 0000 0000 0002 (Declined card)
   - 4000 0000 0000 9995 (Insufficient funds)

2. **Verify Webhook Delivery:**
   - Check Stripe Dashboard → Webhooks → Recent deliveries
   - Ensure your endpoint receives and processes events

### 6. **Go Live Checklist**

- [ ] Production keys configured
- [ ] Products and prices created
- [ ] Webhook endpoint active
- [ ] Test payments working
- [ ] Email notifications working
- [ ] Subscription management working
- [ ] Cancellation flow working

## 🚨 Important Notes

- **Never commit production keys to version control**
- **Use environment variables for all sensitive data**
- **Test thoroughly with real payment methods before going live**
- **Monitor webhook deliveries and error logs**
- **Set up proper error handling and logging**

## 📞 Support

If you encounter issues:
1. Check Stripe Dashboard logs
2. Verify webhook endpoint is accessible
3. Test with Stripe's test cards first
4. Contact Stripe support for production issues
