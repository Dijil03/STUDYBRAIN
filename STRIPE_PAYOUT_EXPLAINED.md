# Stripe Payouts - Why Your Balance Shows £0

## Understanding Stripe Payments

When a customer pays £7.99, here's what happens:

### Step 1: Payment Received ✅
- Customer pays £7.99 to Stripe
- Shows in **"Gross Volume"**: £7.99 ✅
- Shows as **"Incoming"**: £7.99 ✅
- This means the payment was successful!

### Step 2: Stripe Balance vs. Bank Account

**Stripe Balance: £0** is NORMAL! Here's why:

- The money is in **Stripe's custody** (not your bank yet)
- Stripe processes the payment and holds it temporarily
- Stripe needs to pay it out to your bank account
- This takes time (usually 2-7 business days)

## When Will You Actually Get The Money?

### Payout Schedule

Stripe pays out money on a **rolling schedule**:

1. **Test Mode**:
   - Payouts can be instant or delayed (for testing)
   - Check your Stripe Dashboard → Settings → Test mode toggle

2. **Live Mode** (Production):
   - **Standard Schedule**: 2-7 business days after the payment
   - **UK/EU**: Usually 2-3 business days
   - **US**: Usually 2 business days
   - **Other regions**: 3-7 business days

### How to Check Your Payout Schedule

1. Go to **Stripe Dashboard**: https://dashboard.stripe.com
2. Click **"Payments"** in the left menu
3. Click **"Payouts"** tab
4. You'll see:
   - **Pending payouts**: Money that will be sent soon
   - **Scheduled payouts**: Money scheduled for future dates
   - **Completed payouts**: Money already sent to your bank

## Setting Up Your Bank Account

⚠️ **IMPORTANT**: You must add your bank account to receive payouts!

### Steps to Add Bank Account:

1. Go to **Stripe Dashboard**: https://dashboard.stripe.com
2. Click **"Settings"** (gear icon) in the left menu
3. Click **"Bank accounts and scheduling"** or **"Payouts"**
4. Click **"Add bank account"** or **"Update details"**
5. Enter your bank account details:
   - Account holder name
   - Sort code (UK) or Routing number (US)
   - Account number
   - Bank name
6. Save the details

### Verify Your Bank Account

- Stripe may require verification
- They'll make small test deposits (a few pence)
- You'll need to confirm these amounts in Stripe
- This can take 1-3 business days

## Checking Your Payment Status

### In Stripe Dashboard:

1. **Payments Tab**:
   - Shows all successful payments ✅
   - Status: "Succeeded" = Payment is confirmed

2. **Payouts Tab**:
   - Shows when money will be transferred to your bank
   - **Pending**: Will be paid out soon
   - **In transit**: On its way to your bank
   - **Paid**: Already in your bank account ✅

3. **Balance Tab**:
   - Shows Stripe's holding balance
   - May show £0 if payout is scheduled
   - This is normal!

## Why Balance Shows £0

The balance shows £0 because:

1. **Payout already scheduled**: Money is queued for payout
2. **Payment processing**: Stripe is verifying the payment
3. **Reserve hold**: Stripe may hold a reserve for new accounts
4. **Payout not yet created**: Takes 1-2 days to create payout

## Timeline Example

**Day 1**: Customer pays £7.99
- ✅ Payment successful
- ✅ Shows in Gross Volume
- ✅ Shows as Incoming
- ⏳ Balance may show £0 (payout scheduled)

**Day 2-3**: Stripe processes payout
- ⏳ Payout appears in "Payouts" tab as "Pending"
- ⏳ Status: "In transit to bank"

**Day 3-5**: Money arrives in your bank
- ✅ Payout status: "Paid"
- ✅ Money in your bank account!

## Common Questions

### Q: Will I definitely get the money?
**A**: Yes! If it shows in "Gross Volume" and "Incoming", the payment is confirmed. It just needs to be paid out.

### Q: Why is there a delay?
**A**: Stripe needs to:
- Verify the payment (prevent fraud)
- Process the transaction
- Transfer to your bank (takes business days)

### Q: Can I speed it up?
**A**: Some accounts qualify for:
- **Instant Payouts** (if enabled)
- Usually costs a small fee
- Check Stripe Dashboard → Settings → Payouts

### Q: What if payout fails?
**A**: Stripe will:
- Email you about the issue
- Retry automatically
- You may need to update bank details

## Checking Right Now

1. **Stripe Dashboard** → **Payments**:
   - You should see the £7.99 payment with status "Succeeded"

2. **Stripe Dashboard** → **Payouts**:
   - Check if there's a pending or scheduled payout
   - This shows when you'll receive the money

3. **Stripe Dashboard** → **Settings** → **Bank accounts**:
   - Make sure your bank account is added and verified

## What You Need to Do

1. ✅ **Verify payment received**: Check "Payments" tab (should show £7.99)
2. ⚠️ **Check bank account**: Make sure it's added in Settings
3. ⏳ **Check payouts**: See when the money will arrive
4. 📧 **Check email**: Stripe will email you when payout is sent

## Summary

- ✅ **Gross Volume £7.99**: Payment is successful!
- ✅ **Incoming £7.99**: Money is confirmed!
- ⏳ **Balance £0**: Normal - payout is scheduled
- 🏦 **Check Payouts tab**: See when money arrives in your bank

The money WILL arrive in your bank account, usually within 2-7 business days. Check the "Payouts" tab in Stripe to see the exact date!

