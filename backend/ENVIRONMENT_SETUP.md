# Environment Variables Setup

Add these environment variables to your backend `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Client URL (for redirects)
CLIENT_URL=http://localhost:5173

# Session Secret (for express-session)
SESSION_SECRET=your_random_session_secret_here

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string_here

# Server Port
PORT=5001

# Mailtrap Configuration (for email testing)
MAILTRAP_TOKEN=your_mailtrap_api_token_here

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

## How to get Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5001/api/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env` file

## How to get Mailtrap API credentials:

1. Go to [mailtrap.io](https://mailtrap.io)
2. Sign up for a free account
3. In your dashboard, click **"Email Testing"** → **"Inboxes"**
4. Click on your default inbox
5. Go to **"API"** tab (not SMTP)
6. Copy the **API Token** from the API settings
7. Add it to your `.env` file as `MAILTRAP_TOKEN`

## Example .env file:

```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your_super_secret_session_key_here
MONGODB_URI=mongodb://localhost:27017/brain
PORT=5001

# Mailtrap Configuration
MAILTRAP_TOKEN=your_mailtrap_api_token_here
FRONTEND_URL=http://localhost:5173
```

## Important Notes:

- Replace all placeholder values with your actual credentials
- Keep your `.env` file secure and never commit it to version control
- The `CLIENT_URL` should match your frontend URL
- The `SESSION_SECRET` should be a long, random string for security
