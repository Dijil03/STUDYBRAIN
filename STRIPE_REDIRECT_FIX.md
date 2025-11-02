# Stripe Payment Redirect Fix

## Problem

After completing a payment in Stripe, users were redirected to `http://localhost:5173/payment-success` which shows "site can't be reached" because:
- The backend didn't have `FRONTEND_URL` environment variable set
- It defaulted to localhost, which doesn't work in production

## Solution

The code now uses a smart fallback system:

1. **First priority**: `FRONTEND_URL` environment variable (if set)
2. **Second priority**: `CLIENT_URL` environment variable (if set)
3. **Third priority**: In production, defaults to `https://studybrain.vercel.app`
4. **Last resort**: `http://localhost:5173` (for development only)

## What Changed

- Updated `backend/src/controllers/stripe.controller.js`:
  - Added `getFrontendUrl()` helper function
  - Updated `success_url` to use proper frontend URL
  - Updated `cancel_url` to redirect to `/pricing` instead of home
  - Updated `return_url` in portal session creation

## Recommended: Set Environment Variable

To ensure the correct URL is always used, set `FRONTEND_URL` in your Render backend:

### Steps:

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add or update:
   ```
   FRONTEND_URL=https://studybrain.vercel.app
   ```
5. Save and redeploy

### Optional: Also set CLIENT_URL

```
CLIENT_URL=https://studybrain.vercel.app
```

## Testing

After the fix:
1. Complete a test payment in Stripe
2. After payment, you should be redirected to:
   - `https://studybrain.vercel.app/payment-success?success=true&session_id=...`
3. The payment success page should load correctly

## Current Status

✅ Code updated to use smart URL fallback
✅ Production defaults to Vercel URL automatically
⚠️ Still recommended to set `FRONTEND_URL` in Render for clarity

## Notes

- The fix works even without setting `FRONTEND_URL` (uses Vercel URL in production)
- Setting `FRONTEND_URL` explicitly gives you more control
- Cancel URL now redirects to `/pricing` for better UX

