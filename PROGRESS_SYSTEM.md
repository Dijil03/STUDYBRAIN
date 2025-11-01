# 📊 Progress System Documentation

## How Progress Increases

The progress system tracks your study activity and rewards you with XP, streaks, and achievements. Here's how it works:

### 1. **Completing Tasks** ✅ (Auto-tracked)

When you complete a task in the Tasks page:
- **XP**: +10 XP per task
- **Streak**: Updates your daily activity
- **Stats**: Increments tasks completed

**Location**: `frontend/src/pages/Todos.jsx` → `handleToggleComplete()`

```javascript
// When you check off a task, it automatically:
// 1. Records your streak activity
await api.post(`/progress/activity/${userId}`, {
  tasksCompleted: 1,
  studyTime: 0
});

// 2. Gives you XP
await api.put(`/progress/${userId}`, {
  tasksCompleted: 1,
  xp: 10
});
```

---

### 2. **Study Timer Sessions** ⏱️ (Manual recording)

When you complete a study session using the Pomodoro timer:
- Navigate to the Progress page after your session
- Manually record your session using the API

**To implement auto-tracking** (for future enhancement):

```javascript
// After timer completes, call:
await api.post(`/progress/activity/${userId}`, {
  studyTime: 25, // minutes
  tasksCompleted: 0
});

await api.put(`/progress/${userId}`, {
  totalStudyTime: 25,
  xp: 15 // 15 XP per 25min session
});
```

---

### 3. **Manual Activity Recording** 📝

You can manually record activity using the API endpoint:

**POST** `/api/progress/activity/:userId`

```javascript
{
  "studyTime": 30,        // minutes studied
  "tasksCompleted": 2     // number of tasks completed
}
```

This will:
- Update your current streak
- Increment your total days studied
- Calculate your longest streak

---

## XP System

### How XP is Earned:
- **Complete a task**: +10 XP
- **Study session (25 min)**: +15 XP
- **Study session (50 min)**: +30 XP
- **Study session (1 hour)**: +40 XP

### Level System:
- **Level 1**: 0-99 XP
- **Level 2**: 100-199 XP
- **Level 3**: 200-299 XP
- And so on...

Each level requires **100 XP**.

---

## Streak System

### How Streaks Work:
1. **Current Streak**: Consecutive days you've studied
2. **Longest Streak**: Your personal best
3. **Total Days**: All days you've ever studied

### Streak Rules:
- You get credit if you complete ANY activity on a day
- If you miss a day, your streak resets
- Your longest streak is tracked separately

---

## Progress Endpoints

### Get Streak Data
**GET** `/api/progress/streak/:userId`

Returns:
```json
{
  "currentStreak": 5,
  "longestStreak": 10,
  "totalDaysStudied": 15,
  "lastActivityDate": "2024-01-15T10:30:00Z",
  "activityByDate": [...]
}
```

### Record Activity
**POST** `/api/progress/activity/:userId`

Body:
```json
{
  "studyTime": 30,
  "tasksCompleted": 2
}
```

### Get Progress Stats
**GET** `/api/progress/:userId`

Returns:
```json
{
  "level": 3,
  "xp": 250,
  "totalStudyTime": 180,
  "tasksCompleted": 15,
  "goalsCompleted": 8,
  "subjects": [...],
  "weeklyStats": [...]
}
```

### Update Progress
**PUT** `/api/progress/:userId`

Body:
```json
{
  "studyTime": 25,
  "tasksCompleted": 1,
  "goalsCompleted": 1,
  "xp": 10
}
```

---

## Current Implementation Status

### ✅ Fully Working:
- Task completion tracking (auto-updates XP and streaks)
- Progress dashboard display
- Streak calculations
- Level system
- XP tracking

### 🔄 Needs Manual Recording:
- Study timer sessions (no auto-tracking yet)
- Goal completions

### 💡 Future Enhancements:
- Auto-track study timer sessions
- Auto-track goal completions
- Milestone achievements
- Weekly/monthly summaries
- Leaderboards

---

## Testing the Progress System

1. **Start the app** and login
2. **Go to Tasks** (`/todos`)
3. **Create a new task** and complete it
4. **Check your progress** at `/progress`

You should see:
- +10 XP added
- Task count incremented
- Streak updated (if it's a new day)

---

## Troubleshooting

### Progress not updating?
- Check browser console for API errors
- Verify user ID is in localStorage
- Check backend is running

### Streak not increasing?
- Make sure you're recording activity daily
- The streak resets if you miss a day
- Check `lastActivityDate` in your data

### XP not showing?
- Reload the Progress page
- Check the backend logs for errors
- Verify the API calls are successful
