# ⚡ Quick Deployment Steps

## 🎯 Fastest Path to Deploy

### 1. Prepare Environment Variables

**You DON'T create a file!** Instead, you'll add these variables through the hosting platform's dashboard.

**Have these values ready** (write them down or keep them in a text file):

```bash
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-app.vercel.app (you'll get this after deploying frontend)
CLIENT_URL=https://your-app.vercel.app (same as above)
SERVER_URL=https://your-backend.onrender.com (you'll get this after deploying backend)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/brain
JWT_SECRET=your_32_char_secret_minimum (generate a random 32+ character string)
SESSION_SECRET=your_32_char_secret_minimum (generate another random 32+ character string)
STRIPE_SECRET_KEY=sk_live_... (from Stripe dashboard)
STRIPE_PUBLISHABLE_KEY=pk_live_... (from Stripe dashboard)
STRIPE_WEBHOOK_SECRET=whsec_... (you'll get this after setting up webhook)
STUDY_PRO_MONTHLY_PRICE_ID=price_live_... (create in Stripe dashboard)
STUDY_PRO_YEARLY_PRICE_ID=price_live_... (create in Stripe dashboard)
STUDY_MASTER_MONTHLY_PRICE_ID=price_live_... (create in Stripe dashboard)
STUDY_MASTER_YEARLY_PRICE_ID=price_live_... (create in Stripe dashboard)
GOOGLE_CLIENT_ID=... (from Google Cloud Console)
GOOGLE_CLIENT_SECRET=... (from Google Cloud Console)
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**Note:** You'll add these one by one in the Render/Vercel dashboard - NOT as a file!

---

### 2. Deploy Backend (Render) - 5 minutes

1. Go to [render.com](https://render.com) → Sign up/Login
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo
4. Settings:
   - **Name**: `studybrain-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **"Environment"** tab → Add each variable from step 1:
   
   **Required Google OAuth variables:**
   - `GOOGLE_CLIENT_ID` = Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET` = Your Google OAuth Client Secret
   
   (Get these from Google Cloud Console → APIs & Services → Credentials)
   - Click **"Add Environment Variable"**
   - Enter variable name (e.g., `NODE_ENV`)
   - Enter value (e.g., `production`)
   - Click **"Save"**
   - Repeat for all variables
   
   **Tip:** You can add them all now, or add `FRONTEND_URL` and `CLIENT_URL` later after deploying frontend.
6. Click **"Create Web Service"**
7. Wait for deployment (2-3 minutes)
8. **Copy the URL**: `https://your-app.onrender.com`

---

### 3. Deploy Frontend (Vercel) - 5 minutes

1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. Click **"Add New..."** → **"Project"**
3. Import GitHub repository
4. Configure:
   - **Framework Preset**: `Vite` (or "Other" if Vite not listed)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (Vite will auto-detect this)
   - **Output Directory**: `dist` (Vite outputs to `dist` folder)
   
   **Note:** Your app uses:
   - **Framework**: React 19
   - **Build Tool**: Vite
   - **Styling**: Tailwind CSS
5. Add Environment Variables (REQUIRED for production):
   - `VITE_API_URL` = Your Render backend URL (e.g., `https://your-backend.onrender.com`)
   - `VITE_SOCKET_URL` = Your Render backend URL (same as above, for Socket.io)
   
   **Important**: Make sure to use HTTPS URLs (https://) not HTTP!
6. Click **"Deploy"**
7. Wait for deployment (1-2 minutes)
8. **Copy the URL**: `https://your-app.vercel.app`

### How to Redeploy After Adding Environment Variables

If you added environment variables after the initial deployment:

1. Go to your project in Vercel Dashboard
2. Click **"Deployments"** tab
3. Click the **three dots (⋯)** on the latest deployment
4. Select **"Redeploy"**
5. Wait 1-2 minutes for redeploy to complete

**Alternative**: Push any commit to GitHub (even a small change) and Vercel will auto-redeploy.

---

### 4. Connect Frontend to Backend

1. In **Render dashboard** → Your backend service → Environment
2. Update:
   - `FRONTEND_URL` = Your Vercel URL
   - `CLIENT_URL` = Your Vercel URL
3. Click **"Save Changes"** → Service auto-redeploys

---

### 5. Set Up Stripe Webhook

1. Go to **Stripe Dashboard** → Developers → Webhooks
2. Click **"Add endpoint"**
3. URL: `https://your-backend.onrender.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Copy **Signing secret**
7. In **Render**, add/update:
   - `STRIPE_WEBHOOK_SECRET` = The signing secret

---

### 6. Configure Google OAuth for Production

#### Step A: Update OAuth Consent Screen (Allow All Users)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **OAuth consent screen**
3. If it says **"Testing"**, you need to publish it:
   - Click **"PUBLISH APP"** button
   - Click **"CONFIRM"** to make it public
   - **Note**: This allows ANY Google user to sign in (not just test users)

#### Step B: Update OAuth Credentials (Production URLs)

⚠️ **Important**: Redirect URI goes to BACKEND (Render), NOT Frontend (Vercel)!

1. Go to **APIs & Services** → **Credentials**
2. Click on your **OAuth 2.0 Client ID** to edit
3. Add **Authorized JavaScript origins**:
   - `https://your-app.vercel.app` (your Vercel frontend URL - where users click the button)
   - Keep `http://localhost:5173` if you want local development
4. Add **Authorized redirect URIs**:
   - ✅ `https://your-backend.onrender.com/api/auth/google/callback` (your Render backend - where Google sends the user back)
   - ❌ NOT `https://your-app.vercel.app/api/auth/google/callback` (Vercel doesn't handle OAuth)
   - Keep `http://localhost:5001/api/auth/google/callback` if you want local development
5. Click **"SAVE"**

#### Step C: Ensure Required APIs Are Enabled

1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - ✅ **Google+ API** (or Google Identity)
   - ✅ **Google Drive API** (for Google Docs integration)
   - ✅ **Google Classroom API** (for Classroom integration)

**Important**: After publishing your OAuth consent screen, it may take a few minutes for changes to propagate.

---

### 7. Test Deployment ✅

Visit your Vercel URL and test:
- [ ] Homepage loads
- [ ] Can sign up/login
- [ ] Can access dashboard
- [ ] Stripe checkout works (test mode first!)

---

## 🎉 Done!

Your app is now live!

**Frontend**: `https://your-app.vercel.app`  
**Backend**: `https://your-backend.onrender.com`

---

## 📝 Next Steps

1. **Switch to Stripe LIVE mode** when ready
2. **Add custom domain** (optional)
3. **Set up monitoring** (error tracking)
4. **Configure backups** (MongoDB Atlas)

See `DEPLOYMENT_GUIDE.md` for detailed info!

