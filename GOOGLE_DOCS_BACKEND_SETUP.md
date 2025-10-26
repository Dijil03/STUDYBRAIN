# Google Docs Backend Setup Guide

## 🎯 **Backend Solution (Recommended)**

Instead of complex frontend Google API integration, we now use a **backend controller** that handles all Google Docs operations securely.

## 🔧 **Backend Setup**

### **1. Add to Backend `.env` File:**

```env
# Google OAuth Configuration (for Google Docs)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Google Docs API Scopes
GOOGLE_DOCS_SCOPES=https://www.googleapis.com/auth/documents,https://www.googleapis.com/auth/drive.file
```

### **2. Get Your Google Credentials:**

#### **Client ID & Client Secret:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your existing project (same one you use for authentication)
3. Go to "APIs & Services" → "Credentials"
4. Find your existing OAuth 2.0 Client ID
5. Copy the **Client ID** and **Client Secret**

#### **Enable Required APIs:**
1. Go to "APIs & Services" → "Library"
2. Search for and enable:
   - **Google Docs API**
   - **Google Drive API**

### **3. Update OAuth Scopes:**

In your Google Cloud Console OAuth consent screen:
1. Go to "APIs & Services" → "OAuth consent screen"
2. Click "Edit App"
3. Add these scopes:
   - `https://www.googleapis.com/auth/documents`
   - `https://www.googleapis.com/auth/drive.file`

### **4. Update Redirect URIs:**

Add this redirect URI to your OAuth client:
```
http://localhost:5001/api/auth/google/callback
```

## 🚀 **How It Works:**

### **Frontend → Backend → Google API**

1. **User connects Google account** via existing OAuth flow
2. **Backend stores Google tokens** in user database
3. **Frontend calls backend API** for Google Docs operations
4. **Backend uses stored tokens** to call Google APIs
5. **Backend returns results** to frontend

### **API Endpoints:**

- `GET /api/google-docs/:userId/token` - Get user's Google access token
- `POST /api/google-docs/:userId/documents` - Create new document
- `GET /api/google-docs/:userId/documents` - List user's documents
- `GET /api/google-docs/:userId/documents/:documentId` - Get document content
- `POST /api/google-docs/:userId/documents/:documentId/share` - Share document

## ✅ **Benefits:**

1. **Secure** - Google tokens stored on backend only
2. **Simple** - No complex frontend Google API setup
3. **Reliable** - Backend handles token refresh and errors
4. **Scalable** - Easy to add more Google services

## 🔄 **Next Steps:**

1. **Add environment variables** to your backend `.env`
2. **Enable Google APIs** in Google Cloud Console
3. **Update OAuth scopes** for document access
4. **Restart your backend server**
5. **Test the integration** in Folder Manager

**The Google Docs integration will now work through your backend!** 🚀
