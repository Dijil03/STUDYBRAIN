# 🔧 Fix: redirect_uri_mismatch Error

## ❌ Error: `Error 400: redirect_uri_mismatch`

This means the redirect URI your backend sends to Google **doesn't match** what's in Google Cloud Console.

---

## ✅ Quick Fix Steps

### Step 1: Find Your Exact Backend URL

1. Go to **Render Dashboard** → Your backend service
2. Copy your **exact URL** (e.g., `https://studybrain-backend.onrender.com`)
3. **Write it down** — you'll need it in 2 places

### Step 2: Check SERVER_URL in Render

1. In **Render** → Your service → **Environment** tab
2. Find `SERVER_URL` variable
3. It should be: `https://your-backend.onrender.com` (replace with your actual URL)
   - ✅ Must start with `https://`
   - ✅ Must NOT have a trailing slash
   - ✅ Must NOT include `/api/auth/google/callback` (that's added automatically)
   
4. If it's wrong or missing:
   - Add/Update: `SERVER_URL` = `https://your-backend.onrender.com`
   - Click **"Save Changes"**
   - **Redeploy** your service (important!)

### Step 3: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Click on your **OAuth 2.0 Client ID**
4. Scroll to **Authorized redirect URIs**
5. **Remove ALL old redirect URIs** that don't match
6. Add **EXACTLY** this (replace with your actual backend URL):
   ```
   https://your-backend.onrender.com/api/auth/google/callback
   ```
   
   **Critical checks:**
   - ✅ Starts with `https://` (not `http://`)
   - ✅ Exact domain: `your-backend.onrender.com` (use YOUR actual Render URL)
   - ✅ Path: `/api/auth/google/callback` (exactly this, no typos)
   - ✅ NO trailing slash at the end
   - ✅ NO extra spaces before or after

7. Click **"SAVE"** (bottom of page)

### Step 4: Wait and Test

- **Wait 2-5 minutes** for Google to update
- **Redeploy your Render service** (if you updated SERVER_URL)
- Try signing in again

---

## 🔍 How to Verify What's Being Sent

If you want to see what redirect URI your backend is using:

1. Check Render logs when you click "Continue with Google"
2. Look for the OAuth redirect URL in the logs
3. Compare it to what's in Google Cloud Console

The redirect URI your backend sends should be:
```
https://YOUR-EXACT-RENDER-URL.onrender.com/api/auth/google/callback
```

---

## ✅ Checklist

Before trying again, verify:

- [ ] `SERVER_URL` in Render = `https://your-backend.onrender.com` (no trailing slash)
- [ ] Google Cloud Console redirect URI = `https://your-backend.onrender.com/api/auth/google/callback` (exact match)
- [ ] Both use `https://` (not `http://`)
- [ ] Both have the same domain (your actual Render URL)
- [ ] Render service has been redeployed after updating SERVER_URL
- [ ] Waited 2-5 minutes after updating Google Cloud Console

---

## 🆘 Still Not Working?

**Double-check these common mistakes:**

1. **Wrong domain:**
   - ❌ Using `localhost`
   - ❌ Using Vercel URL
   - ✅ Must be your Render backend URL

2. **Wrong path:**
   - ❌ `/api/google/callback`
   - ❌ `/auth/google/callback`
   - ✅ `/api/auth/google/callback` (exactly this)

3. **HTTP vs HTTPS:**
   - ❌ `http://your-backend.onrender.com/...`
   - ✅ `https://your-backend.onrender.com/...`

4. **Extra characters:**
   - ❌ `https://your-backend.onrender.com/api/auth/google/callback/` (trailing slash)
   - ❌ ` https://your-backend.onrender.com/api/auth/google/callback` (leading space)
   - ✅ `https://your-backend.onrender.com/api/auth/google/callback` (exact)

---

## 📝 Example

If your Render backend URL is: `https://studybrain-backend.onrender.com`

Then:

**In Render Environment:**
```
SERVER_URL=https://studybrain-backend.onrender.com
```

**In Google Cloud Console Redirect URI:**
```
https://studybrain-backend.onrender.com/api/auth/google/callback
```

These must match **EXACTLY** (except SERVER_URL doesn't include the `/api/auth/google/callback` part).

