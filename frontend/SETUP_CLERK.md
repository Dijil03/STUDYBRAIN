# 🚀 Clerk Setup Instructions

## **Step 1: Create Clerk Account**
1. Go to [https://clerk.com](https://clerk.com)
2. Click "Get Started" and sign up for a free account
3. Create a new application

## **Step 2: Get Your Publishable Key**
1. In your Clerk dashboard, go to "API Keys"
2. Copy your "Publishable key" (starts with `pk_test_`)

## **Step 3: Add Environment Variable**
Create a `.env` file in the `frontend` directory with:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
VITE_API_URL=http://localhost:5001
```

## **Step 4: Configure Google OAuth in Clerk**
1. In Clerk dashboard, go to "User & Authentication" > "Social Connections"
2. Enable Google OAuth
3. Add your Google OAuth credentials:
   - **Client ID**: From your Google Cloud Console
   - **Client Secret**: From your Google Cloud Console
4. Set redirect URLs:
   - **Development**: `http://localhost:3000`
   - **Production**: `https://yourdomain.com`

## **Step 5: Test the Application**
1. Start your development server:
   ```bash
   npm run dev
   ```
2. Navigate to `/login` or `/signup`
3. Test the Google OAuth flow

## **Benefits of Clerk over Direct Google OAuth:**
- ✅ **No Backend Setup**: Clerk handles all authentication
- ✅ **Better Security**: Built-in fraud detection and rate limiting
- ✅ **User Management**: Built-in user profiles and avatars
- ✅ **Multiple Providers**: Easy to add GitHub, Discord, etc.
- ✅ **Session Management**: Automatic session handling
- ✅ **Webhooks**: User event notifications
- ✅ **Analytics**: Authentication analytics

## **Environment Variables for Vite:**
Since this is a Vite project, use `VITE_` prefix for environment variables:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here

# Backend API
VITE_API_URL=http://localhost:5001
```

## **Current Status:**
- ✅ Clerk SDK installed
- ✅ Clerk components created
- ✅ Route protection implemented
- ✅ Old Google OAuth removed
- ✅ Environment variables fixed for Vite
- ⏳ **Need**: Clerk publishable key in `.env` file
