# Clerk Authentication Setup

## 1. Create Clerk Account
1. Go to [clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

## 2. Get Your Keys
1. In your Clerk dashboard, go to "API Keys"
2. Copy your "Publishable key"

## 3. Environment Variables
Create a `.env` file in the frontend directory with:

```env
# Clerk Authentication
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Backend API
REACT_APP_API_URL=http://localhost:5001
```

## 4. Configure Google OAuth in Clerk
1. In Clerk dashboard, go to "User & Authentication" > "Social Connections"
2. Enable Google OAuth
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Set redirect URLs:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

## 5. Benefits of Clerk over Direct Google OAuth
- ✅ **No backend setup required** for authentication
- ✅ **Built-in user management**
- ✅ **Multiple OAuth providers** (Google, GitHub, Discord, etc.)
- ✅ **Session management**
- ✅ **User profiles and avatars**
- ✅ **Security features** (rate limiting, fraud detection)
- ✅ **Easy customization**
- ✅ **Webhooks for user events**

## 6. Migration Benefits
- Remove complex Passport.js setup
- Remove JWT token management
- Remove session handling
- Remove Google OAuth configuration
- Simplified user authentication flow
- Better security and user experience
