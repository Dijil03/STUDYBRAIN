# 🧠 StudyBrain - AI-Powered Study Companion

A comprehensive study management and productivity application with real-time collaboration, AI-powered features, and subscription management.

## 🌟 Features

- 📚 **Study Management**: Track homework, exams, and study sessions
- 💳 **Subscription Plans**: Study Pro and Study Master tiers with Stripe integration
- 🤝 **Real-time Collaboration**: Work together on documents in real-time
- 📝 **Document Editor**: Rich text editor with version control
- 📊 **Analytics & Reports**: Track your study progress and performance
- 🎯 **AI-Powered Features**: Smart study recommendations
- 📧 **Email Notifications**: Welcome emails, subscriptions, and more
- 🔐 **Secure Authentication**: Google OAuth and JWT-based sessions
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode

## 🚀 Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Stripe for payments
- Passport.js for authentication
- Socket.io for real-time features
- Nodemailer for email services

### Frontend
- React 19
- Vite
- Framer Motion for animations
- Tailwind CSS
- TipTap for rich text editing
- Chart.js for analytics

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB Atlas account or local MongoDB
- Stripe account (for payment features)
- Google OAuth credentials (for Google login)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Brain
```

### 2. Install dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3. Environment Variables

Create a `.env` file in the `backend` folder:

```env
# Server Configuration
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5001

# Database
MONGODB_URI=mongodb://localhost:27017/brain
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/brain

# Security
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
SESSION_SECRET=your_session_secret_min_32_characters

# Stripe (Get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (Create products in Stripe dashboard)
STUDY_PRO_MONTHLY_PRICE_ID=price_xxx
STUDY_PRO_YEARLY_PRICE_ID=price_xxx
STUDY_MASTER_MONTHLY_PRICE_ID=price_xxx
STUDY_MASTER_YEARLY_PRICE_ID=price_xxx

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Service (Choose one)
# Option 1: Production Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Option 2: Mailtrap (for development)
MAILTRAP_TOKEN=your_mailtrap_token
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

### Production Build

**Build frontend:**
```bash
cd frontend
npm run build
```

**Start backend:**
```bash
cd backend
npm start
```

## 📖 Setup Guide

### 1. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 mongo
```

**Option B: MongoDB Atlas (Recommended)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 2. Stripe Setup

1. Create account at https://stripe.com
2. Go to Dashboard → Developers → API Keys
3. Copy **Test** keys for development
4. Create products and prices:
   - Study Pro: Monthly £7.99, Yearly £79.99
   - Study Master: Monthly £17.99, Yearly £199.99
5. Copy Price IDs to `.env`
6. Set up webhook endpoint: `http://your-domain/api/stripe/webhook`

### 3. Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create a new project (or select existing)
3. **Enable Required APIs:**
   - Navigate to "APIs & Services" → "Library"
   - Enable **Google Docs API**
   - Enable **Google Drive API**
   - Enable **Google+ API** (for basic OAuth)
4. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose User Type (External for testing, Internal for workspace)
   - Fill in required fields:
     - App name: Your app name
     - User support email: Your email
     - Developer contact: Your email
   - Click "Add or Remove Scopes"
   - Add these scopes manually:
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/documents` (Google Docs API)
     - `https://www.googleapis.com/auth/drive.file` (Google Drive API)
   - Save and Continue
   - Add test users (if in Testing mode) - add your own email
   - Save and Continue
5. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose Application type: "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5001/api/auth/google/callback` (development)
     - `https://your-domain/api/auth/google/callback` (production)
   - Click "Create"
   - Copy Client ID and Client Secret
6. **Add to `.env` file:**
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

**Important Notes:**
- If your app is in "Testing" mode, only test users can authenticate
- To make it public, submit for verification (required for sensitive scopes)
- After adding new scopes, users need to re-authenticate to grant permissions

### 4. Email Service Setup

**Option A: Gmail (Production)**
1. Enable 2-factor authentication on your Gmail account
2. Generate App Password
3. Use your email and app password in `.env`

**Option B: Mailtrap (Development)**
1. Create account at https://mailtrap.io
2. Get API token
3. Add to `.env`

## 🚢 Deployment

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed deployment instructions.

### Quick Deploy to Render

1. Push code to GitHub
2. Connect to Render
3. Select "Web Service"
4. Set environment variables
5. Deploy!

## 🧪 Testing

### Test Stripe Integration

Use these test cards in Stripe's test mode:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

## 📁 Project Structure

```
Brain/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── db/             # Database connection
│   │   ├── middlewares/    # Custom middlewares
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── socket/         # Socket.io handlers
│   │   └── utils/          # Utility functions
│   └── server.js           # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS files
│   └── index.html
└── render.yaml             # Render deployment config
```

## 🔐 Security

- All sensitive data in environment variables
- JWT-based authentication
- HTTP-only cookies
- Secure session management
- CORS protection
- Rate limiting (recommended)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review the deployment checklist

## 🎯 Roadmap

- [ ] Add more AI features
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Team collaboration features
- [ ] Integration with more services

---

Made with ❤️ by the StudyBrain Team

