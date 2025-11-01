# 🔧 Troubleshooting Progress System

## Problem: Progress doesn't increase when completing tasks

### Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Complete a task
4. Look for these messages:
   - ✅ "Recording progress for task completion..."
   - ✅ "Activity recorded:" (should show data)
   - ✅ "Progress updated:" (should show updated XP)

If you see error messages, note them.

---

### Step 2: Check Network Tab

1. Open Developer Tools (F12)
2. Go to the Network tab
3. Complete a task
4. Look for these API calls:
   - `POST /api/progress/activity/:userId` - Should return 200
   - `PUT /api/progress/:userId` - Should return 200

If they return errors (400, 500, etc.), check the response.

---

### Step 3: Verify User ID

1. Open browser console (F12 → Console)
2. Type: `localStorage.getItem('userId')`
3. Press Enter
4. **If it returns `null`**: You're not logged in properly
5. **If it returns an ID**: Copy it and test manually

---

### Step 4: Manual API Test

Open your browser console and paste this (replace YOUR_USER_ID):

```javascript
// Get your user ID
const userId = localStorage.getItem('userId');
console.log('User ID:', userId);

// Test recording activity
fetch(`http://localhost:5001/api/progress/activity/${userId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    tasksCompleted: 1,
    studyTime: 0
  })
})
.then(res => res.json())
.then(data => console.log('✅ Activity:', data))
.catch(err => console.error('❌ Error:', err));

// Test updating progress
fetch(`http://localhost:5001/api/progress/${userId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    tasksCompleted: 1,
    xp: 10
  })
})
.then(res => res.json())
.then(data => console.log('✅ Progress:', data))
.catch(err => console.error('❌ Error:', err));
```

---

### Step 5: Check Backend Logs

1. Open your backend terminal
2. Complete a task
3. Look for these messages in the console:
   - Any error messages?
   - Requests coming in?

---

## Common Issues & Solutions

### Issue 1: "userId is null"
**Solution**: You're not logged in. Log out and log back in.

### Issue 2: "404 Not Found"
**Solution**: Backend server isn't running or routes aren't registered.

### Issue 3: "Network Error"
**Solution**: Check your backend URL in `frontend/src/utils/axios.js`

### Issue 4: API returns 200 but data doesn't update
**Solution**: Refresh the Progress page. The data might have updated but UI didn't refresh.

---

## Quick Fix Checklist

- [ ] Backend server is running on port 5001
- [ ] User is logged in (check localStorage)
- [ ] No errors in browser console
- [ ] API calls return 200 status
- [ ] Progress page is refreshed after completing task

---

## Still Not Working?

Check these files:
1. `frontend/src/pages/Todos.jsx` - Line 108-126 (progress tracking code)
2. `backend/src/controllers/streak.controller.js` - Progress update logic
3. `backend/src/routes/progress.routes.js` - Route definitions
4. `backend/src/server.js` - Make sure routes are registered

