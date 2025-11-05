# Google OAuth Setup Guide

## Fixing "redirect_uri_mismatch" Error

If you're getting the error `Error 400: redirect_uri_mismatch`, you need to add the correct redirect URIs to your Google Cloud Console.

### Step 1: Go to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if you don't have one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID (or create one if you don't have it)

### Step 2: Add Authorized Redirect URIs

You need to add **ALL** the redirect URIs that your application uses. Add these URIs:

#### For Development (Local):
```
http://localhost:5000/api/auth/google/callback
```

#### For Production (if deployed):
```
https://your-backend-domain.com/api/auth/google/callback
```

**Important Notes:**
- Replace `your-backend-domain.com` with your actual backend domain
- The port `5000` is the default backend port - change if yours is different
- Make sure there are **no trailing slashes** at the end
- The URI must match **exactly** (including `http://` vs `https://`)

### Step 3: Add OAuth Scopes (if using Calendar)

If you're using Google Calendar integration, you also need to:

1. Go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click **Enable**
4. The scopes are already configured in the code, but make sure your OAuth consent screen includes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`

### Step 4: Environment Variables

Make sure your `.env` file (or production environment) has:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
CLIENT_URL=http://localhost:5173  # For development
# OR for production:
# CLIENT_URL=https://your-frontend-domain.com
SERVER_URL=http://localhost:5000  # For production, use your backend URL
```

### Step 5: Common Redirect URIs to Add

Based on your application setup, you might need:

**Development:**
- `http://localhost:5000/api/auth/google/callback`
- `http://127.0.0.1:5000/api/auth/google/callback` (if using 127.0.0.1)

**Production:**
- `https://your-backend-domain.com/api/auth/google/callback`
- `https://your-backend-domain.com/api/auth/google/callback` (without trailing slash)

### Step 6: Fix "Google hasn't verified this app" Warning

If you see the warning "Google hasn't verified this app", this is because your OAuth app is in **Testing** mode. To fix this:

#### Option 1: Add Test Users (Recommended for Development)

1. Go to **APIs & Services** → **OAuth consent screen**
2. Scroll down to **Test users** section
3. Click **+ ADD USERS**
4. Add your email address (and any other users who need access)
5. Click **ADD**
6. Save the changes

**Note:** Only users in the test users list can sign in while the app is in Testing mode.

#### Option 2: Publish Your App (For Production)

If you want to allow all users to sign in:

1. Go to **APIs & Services** → **OAuth consent screen**
2. Click **PUBLISH APP**
3. You'll see a warning about verification
4. For Calendar API, you may need to:
   - Submit your app for verification (if using sensitive scopes)
   - Or use less sensitive scopes

**Important:** For Calendar API (`calendar` and `calendar.events` scopes), Google requires app verification if you want to allow all users. For personal use or testing, use **Option 1** (Test Users).

### Step 7: Verify

1. Save the changes in Google Cloud Console
2. Wait a few minutes for changes to propagate
3. Try signing in again

### Troubleshooting

**"Google hasn't verified this app" warning?**
- This is normal for apps in Testing mode
- Add your email to **Test users** in OAuth consent screen
- Or publish your app (requires verification for sensitive scopes)

**Still getting redirect_uri_mismatch error?**
1. Check the exact redirect URI in the error message
2. Make sure it matches **exactly** what's in Google Cloud Console
3. Check for:
   - Trailing slashes
   - `http://` vs `https://`
   - Port numbers
   - Domain names

**Need to check what redirect URI is being sent?**
Check your backend logs when you click "Sign in with Google" - it will show the callback URL being used.

**Calendar API not working?**
- Make sure Google Calendar API is enabled in **APIs & Services** → **Library**
- Check that you've added the Calendar scopes to your OAuth consent screen
- Verify test users have access if app is in Testing mode

### Quick Fix Checklist

- [ ] Added redirect URI to Google Cloud Console
- [ ] No trailing slash in redirect URI
- [ ] Correct protocol (http:// for local, https:// for production)
- [ ] Correct port number (usually 5000 for backend)
- [ ] Correct path (`/api/auth/google/callback`)
- [ ] Saved changes in Google Cloud Console
- [ ] Waited a few minutes for changes to propagate
- [ ] Environment variables are set correctly

