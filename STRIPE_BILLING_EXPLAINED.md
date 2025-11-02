# Stripe Subscription Billing - How It Works

## When You're Charged

### First Payment (Already Happened)
✅ **Immediately** - When you completed the payment in Stripe, your card was charged right away for the first billing period.

### Recurring Payments (Future)

Stripe will automatically charge you on the **same date each month/year** (based on your billing cycle).

## Billing Cycles

### Monthly Subscription
- **First charge**: Happened when you subscribed ✅
- **Next charge**: Same date next month
  - Example: If you subscribed on January 15th, you'll be charged again on February 15th, March 15th, etc.
  - If the date doesn't exist in a month (like Feb 30th), Stripe charges on the last day of that month

### Yearly Subscription
- **First charge**: Happened when you subscribed ✅
- **Next charge**: Same date next year
  - Example: If you subscribed on January 15th, 2024, you'll be charged again on January 15th, 2025

## How to Check Your Next Billing Date

### Option 1: In Your App
1. Go to **Profile** page
2. Look for **"Next billing date"** in the subscription section
3. You'll see the exact date and how many days remain

### Option 2: Payment Success Page
- After payment, the success page shows your next billing date

### Option 3: Stripe Customer Portal
1. In your Profile, click **"Manage Subscription"**
2. This opens Stripe's billing portal
3. You can see:
   - Current subscription details
   - Next invoice date
   - Payment history
   - Update payment method
   - Cancel subscription (if needed)

## Important Notes

### Fixed Date
✅ **Yes, there is a fixed date!**
- Stripe uses the same day of the month/year for recurring charges
- The date is based on when you first subscribed

### Automatic Renewal
- Stripe automatically charges your card on the billing date
- No action needed from you (unless you want to cancel)
- You'll receive an email receipt from Stripe each time

### Payment Method
- Stripe uses the card you provided during checkout
- If payment fails, Stripe will:
  1. Retry automatically
  2. Email you about the failed payment
  3. Give you a grace period to update your payment method

### Cancellation
- You can cancel anytime from your Profile or Stripe portal
- Your subscription stays active until the end of the current billing period
- You'll keep access until your `currentPeriodEnd` date

## Example Timeline

**Monthly Plan:**
- Jan 15, 2024: First payment ✅ (Already happened)
- Feb 15, 2024: Second payment (Automatic)
- Mar 15, 2024: Third payment (Automatic)
- And so on...

**Yearly Plan:**
- Jan 15, 2024: First payment ✅ (Already happened)
- Jan 15, 2025: Second payment (Automatic)
- Jan 15, 2026: Third payment (Automatic)
- And so on...

## Where to Find This Information

1. **Profile Page**: `/profile` - Shows subscription details and next billing date
2. **Payment Success Page**: Shows after successful payment
3. **Stripe Portal**: Access via "Manage Subscription" button in Profile

## Need Help?

- Check your **Profile** page to see the exact next billing date
- Use Stripe's customer portal to manage payments
- Contact support if you have billing questions

