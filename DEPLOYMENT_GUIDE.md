# 🚀 StudyBrain Deployment Guide

## Quick Start Checklist

### ✅ Pre-Deployment Requirements

- [ ] MongoDB Atlas cluster set up and connection string ready
- [ ] Stripe account verified with live keys
- [ ] Google OAuth credentials configured
- [ ] Domain name ready (or free hosting URL)
- [ ] All environment variables prepared

---

## 📦 Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend) - Recommended

#### Frontend on Vercel:

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select `frontend` as root directory
   - Configure build settings:
     - **Build Command**: `npm install && npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Environment Variables** (in Vercel dashboard):
   ```
   VITE_API_URL=https://your-backend.onrender.com
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

#### Backend on Render:

1. **Create New Web Service**:
   - Go to [render.com](https://render.com)
   - Click "New Web Service"
   - Connect your GitHub repository

2. **Configure Service**:
   - **Name**: `studybrain-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Environment Variables** (in Render dashboard):
   ```bash
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://your-app.vercel.app
   CLIENT_URL=https://your-app.vercel.app
   SERVER_URL=https://your-backend.onrender.com
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_32_character_secret_key
   SESSION_SECRET=your_32_character_secret_key
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   STUDY_PRO_MONTHLY_PRICE_ID=price_live_xxx
   STUDY_PRO_YEARLY_PRICE_ID=price_live_xxx
   STUDY_MASTER_MONTHLY_PRICE_ID=price_live_xxx
   STUDY_MASTER_YEARLY_PRICE_ID=price_live_xxx
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   HF_TOKEN=your_huggingface_token
   ```

4. **Update Frontend URL in Vercel**:
   - After backend is deployed, update `FRONTEND_URL` in Render with your Vercel URL
   - Redeploy backend if needed

---

### Option 2: Netlify (Frontend) + Railway (Backend)

#### Frontend on Netlify:

1. **Deploy via Netlify Dashboard**:
   - Go to [netlify.com](https://netlify.com)
   - Import repository
   - Settings:
     - **Base directory**: `frontend`
     - **Build command**: `npm install && npm run build`
     - **Publish directory**: `frontend/dist`

2. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.railway.app
   VITE_SOCKET_URL=https://your-backend.railway.app
   ```

#### Backend on Railway:

1. **Create New Project**:
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Select repository

2. **Configure**:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
   - Add all environment variables (same as Render)

---

### Option 3: Full Stack on Render

1. **Frontend as Static Site**:
   - Build locally: `cd frontend && npm run build`
   - Upload `dist` folder to Render Static Site

2. **Backend as Web Service**:
   - Deploy backend as separate web service
   - Configure environment variables

---

## 🔧 Build Commands Reference

### Frontend Build:
```bash
cd frontend
npm install
npm run build
```
Output: `frontend/dist/`

### Backend:
```bash
cd backend
npm install
npm start
```

---

## 🔐 Environment Variables Checklist

### Backend (.env) - Required:
```bash
✅ NODE_ENV=production
✅ PORT=10000
✅ FRONTEND_URL=https://your-frontend-url.com
✅ CLIENT_URL=https://your-frontend-url.com
✅ SERVER_URL=https://your-backend-url.com
✅ MONGODB_URI=mongodb+srv://...
✅ JWT_SECRET=32+_characters_minimum
✅ SESSION_SECRET=32+_characters_minimum
✅ STRIPE_SECRET_KEY=sk_live_...
✅ STRIPE_PUBLISHABLE_KEY=pk_live_...
✅ STRIPE_WEBHOOK_SECRET=whsec_...
✅ STUDY_PRO_MONTHLY_PRICE_ID=price_live_...
✅ STUDY_PRO_YEARLY_PRICE_ID=price_live_...
✅ STUDY_MASTER_MONTHLY_PRICE_ID=price_live_...
✅ STUDY_MASTER_YEARLY_PRICE_ID=price_live_...
✅ GOOGLE_CLIENT_ID=...
✅ GOOGLE_CLIENT_SECRET=...
✅ GOOGLE_CALLBACK_URL=https://your-backend/api/auth/google/callback
✅ EMAIL_USER=...
✅ EMAIL_PASS=...
```

### Frontend (Vercel/Netlify) - Optional:
```bash
VITE_API_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

---

## 🧪 Post-Deployment Testing

### 1. Test Public Pages:
- [ ] Homepage loads: `https://your-app.vercel.app/`
- [ ] Pricing page accessible: `/pricing`
- [ ] Login/Signup pages work: `/login`, `/signup`

### 2. Test Authentication:
- [ ] User registration works
- [ ] User login works
- [ ] Google OAuth works
- [ ] Session persists across page reloads

### 3. Test Subscription Flow:
- [ ] Can view pricing plans
- [ ] Stripe checkout works (test with test mode first)
- [ ] Subscription webhook processes payments
- [ ] User subscription status updates

### 4. Test Features:
- [ ] Dashboard loads
- [ ] Documents feature works
- [ ] Study timer works
- [ ] AI tutor respects query limits
- [ ] Premium features show upgrade prompts for free users

### 5. Test Responsive Design:
- [ ] Mobile (320px-768px) ✓
- [ ] Tablet (768px-1024px) ✓
- [ ] Desktop (1024px+) ✓

---

## 🔔 Stripe Webhook Setup

### After Deployment:

1. **Get Your Webhook URL**:
   ```
   https://your-backend.onrender.com/api/stripe/webhook
   ```

2. **Add in Stripe Dashboard**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - Paste your webhook URL
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `checkout.session.completed`

3. **Copy Webhook Secret**:
   - After creating webhook, copy the signing secret
   - Add to backend environment: `STRIPE_WEBHOOK_SECRET`

---

## 📊 Monitoring & Logs

### Render:
- View logs in Render dashboard
- Set up alerts for downtime

### Vercel:
- Analytics available in dashboard
- Function logs for serverless functions

### Check Health:
```bash
curl https://your-backend.onrender.com/health
```

---

## 🐛 Troubleshooting

### Issue: Frontend can't connect to backend
- **Check**: `VITE_API_URL` is set correctly
- **Check**: Backend CORS allows frontend domain
- **Check**: Backend is running and accessible

### Issue: Stripe payments not working
- **Check**: Using LIVE keys (not test keys)
- **Check**: Webhook URL is correct in Stripe
- **Check**: Webhook secret matches in environment

### Issue: Database connection fails
- **Check**: MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- **Check**: Connection string is correct
- **Check**: Database user has correct permissions

### Issue: Google OAuth not working
- **Check**: Callback URL matches in Google Console
- **Check**: Authorized JavaScript origins include frontend URL
- **Check**: Authorized redirect URIs include backend callback URL

---

## 🔄 Updating After Deployment

### Frontend Updates:
```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel/Netlify auto-deploys
```

### Backend Updates:
```bash
# Make changes
git add .
git commit -m "Update API"
git push origin main

# Render/Railway auto-deploys
```

### Environment Variable Changes:
- Update in hosting dashboard
- Redeploy service to apply changes

---

## 📝 Important Notes

1. **First Deployment**: 
   - Use Stripe TEST mode initially
   - Test all flows before switching to LIVE

2. **Database**:
   - MongoDB Atlas free tier: 512MB storage
   - Upgrade if needed

3. **Free Tier Limits**:
   - Render: Free tier sleeps after 15min inactivity
   - Vercel: Generous free tier
   - Railway: $5/month credit

4. **Custom Domain**:
   - Add domain in hosting dashboard
   - Update DNS records
   - Update environment variables with new domain

---

## ✅ Deployment Success Criteria

- [ ] Frontend accessible at public URL
- [ ] Backend API responding at `/health`
- [ ] Users can register and login
- [ ] Stripe checkout working
- [ ] Webhooks receiving events
- [ ] Premium features properly gated
- [ ] Mobile responsive design works
- [ ] No console errors in browser

---

## 🎉 You're Live!

Once all checks pass, your StudyBrain app is deployed and ready for users!

**Next Steps**:
- Monitor error logs
- Set up analytics (Google Analytics, etc.)
- Set up error tracking (Sentry)
- Create user documentation
- Market your app!

Good luck! 🚀

