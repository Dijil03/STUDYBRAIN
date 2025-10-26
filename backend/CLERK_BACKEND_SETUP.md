# Backend Clerk Authentication Setup

## Environment Variables Required

Create a `.env` file in the `backend` directory with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/braincharge

# JWT Secret (for fallback auth)
JWT_SECRET=your_jwt_secret_here

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

# Server
PORT=5001
NODE_ENV=development
```

## How to Get Clerk Secret Key

1. Go to your Clerk dashboard
2. Navigate to "API Keys"
3. Copy your "Secret key" (starts with `sk_test_`)

## What's Been Updated

- ✅ **Clerk Backend SDK** installed
- ✅ **Clerk authentication middleware** created
- ✅ **Homework routes** updated to use Clerk auth
- ✅ **Frontend API hook** created for Clerk tokens
- ✅ **Dashboard and MyWorld** updated to use new API

## Testing the Fix

1. Add your Clerk secret key to `.env`
2. Restart the backend server
3. The 404 error should be resolved
4. API calls will now include Clerk authentication tokens

## Benefits

- ✅ **Secure authentication** with Clerk
- ✅ **Automatic token management** 
- ✅ **No more 404 errors** on protected routes
- ✅ **Consistent authentication** across frontend and backend

