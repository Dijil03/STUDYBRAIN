# 🎓 Google Classroom API Setup Guide

## Prerequisites
- Google Cloud Console access
- Existing Google OAuth project (same as Google Docs)

## Step 1: Enable Google Classroom API

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your existing project** (the same one used for Google Docs)
3. **Navigate to**: APIs & Services → Library
4. **Search for**: "Google Classroom API"
5. **Click "Enable"**

## Step 2: Add Classroom Scopes to OAuth Consent Screen

1. **Go to**: APIs & Services → OAuth consent screen
2. **Click "Edit App"**
3. **Scroll to "Scopes" section**
4. **Click "Add or Remove Scopes"**
5. **Add these scopes**:
   ```
   https://www.googleapis.com/auth/classroom.courses.readonly
   https://www.googleapis.com/auth/classroom.coursework.me.readonly
   https://www.googleapis.com/auth/classroom.rosters.readonly
   ```
6. **Click "Update"**

## Step 3: Add Test Users (if in testing mode)

1. **In OAuth consent screen**
2. **Scroll to "Test users"**
3. **Add your email address**
4. **Click "Save"**

## Step 4: Test the Integration

1. **Go to your StudyBrain app**
2. **Navigate to Folder Manager** (`/folder-manager`)
3. **Look for "Google Classroom Integration" section**
4. **Click "Connect Google Classroom"**
5. **Authorize the permissions**
6. **You should see your courses and assignments!**

## Features You'll Get:

### 📚 Course Management
- View all your Google Classroom courses
- Track course progress and statistics

### 📝 Assignment Sync
- See all assignments across all courses
- Sync assignments to your homework tasks
- Track due dates and deadlines

### 📊 Study Analytics
- Monitor assignment completion
- Track academic progress
- Set study goals

### ⏰ Due Date Tracking
- Upcoming assignment alerts
- Never miss a deadline
- Smart assignment sorting

## Troubleshooting

### If you get "Access Denied" error:
1. Make sure you added the scopes correctly
2. Check that your email is in test users (if in testing mode)
3. Try refreshing the OAuth consent screen

### If you get "API not enabled" error:
1. Make sure Google Classroom API is enabled
2. Wait a few minutes for changes to propagate

### If you get "Scope not authorized" error:
1. Double-check the scopes are added correctly
2. Make sure you're using the correct OAuth flow

## Next Steps

Once set up, you can:
- **Sync assignments** to your homework
- **Track grades** and progress
- **Organize study materials** by course
- **Set up study groups** with classmates
- **Monitor deadlines** and due dates

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all scopes are added correctly
3. Make sure you're logged in with the correct Google account
4. Try clearing browser cache and cookies

Happy studying! 🎓✨
