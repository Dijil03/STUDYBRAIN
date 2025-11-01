# 🔧 Google OAuth "Access Blocked: Request is Invalid" Fix

## Common Causes & Solutions

### ❌ Error: "Access blocked: BrainHubs request is invalid"

This error means Google rejected your OAuth request. Here's how to fix it:

---

## ✅ Step 1: Publish Your OAuth Consent Screen

**This is the #1 cause of this error!**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to: **APIs & Services** → **OAuth consent screen**
4. Check the status at the top:
   - If it says **"Testing"** → You MUST publish it!
   - If it says **"In production"** → You're good ✓

### To Publish:
1. Click **"PUBLISH APP"** button (top right)
2. Click **"CONFIRM"** in the dialog
3. Wait 2-5 minutes for changes to propagate

**Why**: In "Testing" mode, only users added as "Test users" can sign in. Publishing allows ANY Google user to sign in.

---

## ✅ Step 2: Verify Redirect URI Matches Exactly

The redirect URI in Google Cloud Console **MUST match exactly** what your backend uses.

### ⚠️ IMPORTANT: Use BACKEND URL (Render), NOT Frontend (Vercel)!

The OAuth callback goes to your **backend server** (Render), not your frontend (Vercel).

### Check Your Backend URL:
- Go to Render → Your service → Copy your URL (e.g., `https://studybrain-backend.onrender.com`)

### In Google Cloud Console:
1. Go to **APIs & Services** → **Credentials**
2. Click on your **OAuth 2.0 Client ID** (the one you're using)
3. Scroll to **Authorized redirect URIs**
4. Make sure you have **exactly**:
   ```
   https://your-backend.onrender.com/api/auth/google/callback
   ```
   
   **❌ DO NOT USE:**
   - `https://your-app.vercel.app/api/auth/google/callback` ❌
   - Vercel doesn't handle OAuth callbacks!
   
   **✅ CORRECT:**
   - `https://your-backend.onrender.com/api/auth/google/callback` ✅
   - This is your Render backend URL
   - ✅ Must start with `https://`
   - ✅ Must include `/api/auth/google/callback`
   - ✅ No trailing slash
   - ✅ No extra spaces

5. **Click "SAVE"**

### Common Mistakes:
- ❌ Missing `https://`
- ❌ Wrong domain (e.g., using localhost in production)
- ❌ Wrong path (e.g., `/api/google/callback` instead of `/api/auth/google/callback`)
- ❌ Trailing slash or extra characters

---

## ✅ Step 3: Verify Authorized JavaScript Origins

1. In **APIs & Services** → **Credentials** → Your OAuth Client
2. Scroll to **Authorized JavaScript origins**
3. Add your frontend URL:
   ```
   https://your-app.vercel.app
   ```
4. **Click "SAVE"**

---

## ✅ Step 4: Verify Environment Variables in Render

Make sure these are set correctly in Render:

1. Go to Render → Your service → **Environment**
2. Verify:
   - `GOOGLE_CLIENT_ID` = Your OAuth Client ID
   - `GOOGLE_CLIENT_SECRET` = Your OAuth Client Secret
   - `SERVER_URL` = `https://your-backend.onrender.com` (for callback URL)
   - `CLIENT_URL` = `https://your-app.vercel.app` (for redirect after auth)

3. After adding/updating, **redeploy** your service

---

## ✅ Step 5: Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - ✅ **Google Identity API** (or Google+ API)
   - ✅ **Google Drive API** (if using Google Docs)
   - ✅ **Google Classroom API** (if using Classroom)

---

## ✅ Step 6: Check OAuth Client Configuration

1. In **APIs & Services** → **Credentials**
2. Make sure you're using an **OAuth 2.0 Client ID** (not Service Account)
3. Application type should be **"Web application"**

---

## 🔍 Debugging Checklist

- [ ] OAuth consent screen is **"In production"** (not "Testing")
- [ ] Redirect URI matches **exactly**: `https://your-backend.onrender.com/api/auth/google/callback`
- [ ] JavaScript origin is set: `https://your-app.vercel.app`
- [ ] Environment variables are set in Render (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SERVER_URL`)
- [ ] Backend has been redeployed after adding environment variables
- [ ] Required Google APIs are enabled
- [ ] You're using the correct OAuth Client ID (not from a different project)

---

## ⏰ After Making Changes

- Wait **2-5 minutes** after publishing OAuth consent screen
- Wait **1-2 minutes** after updating redirect URIs
- **Redeploy** your backend after adding environment variables

---

## 🆘 Still Not Working?

1. **Double-check the exact error message** - it might give more clues
2. **Check browser console** for any additional errors
3. **Check Render logs** - Look for OAuth errors in backend logs
4. **Test with a different Google account** - Sometimes cached permissions cause issues
5. **Clear browser cookies** for your site and try again

---

## 📝 Quick Test

After fixing, test the flow:
1. Click "Continue with Google" on your login page
2. You should see Google's consent screen
3. After approving, you should be redirected back to your app

If you still see "Access blocked", go through the checklist above again!

