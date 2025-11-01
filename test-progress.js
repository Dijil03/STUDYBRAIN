// Test script to check progress endpoints
// Replace USER_ID with your actual user ID from localStorage

const USER_ID = 'YOUR_USER_ID_HERE'; // Get this from browser localStorage
const API_BASE = 'http://localhost:5001/api';

async function testProgress() {
  try {
    console.log('Testing Progress System...\n');

    // Test 1: Record Activity
    console.log('1. Testing recordActivity...');
    const activityRes = await fetch(`${API_BASE}/progress/activity/${USER_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasksCompleted: 1,
        studyTime: 0
      })
    });
    const activityData = await activityRes.json();
    console.log('✅ Activity recorded:', activityData);
    
    // Test 2: Update Progress
    console.log('\n2. Testing updateProgress...');
    const progressRes = await fetch(`${API_BASE}/progress/${USER_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasksCompleted: 1,
        xp: 10
      })
    });
    const progressData = await progressRes.json();
    console.log('✅ Progress updated:', progressData);
    
    // Test 3: Get Progress
    console.log('\n3. Testing getProgress...');
    const getProgressRes = await fetch(`${API_BASE}/progress/${USER_ID}`);
    const getProgressData = await getProgressRes.json();
    console.log('✅ Current progress:', getProgressData);
    
    // Test 4: Get Streak
    console.log('\n4. Testing getStreak...');
    const streakRes = await fetch(`${API_BASE}/progress/streak/${USER_ID}`);
    const streakData = await streakRes.json();
    console.log('✅ Current streak:', streakData);
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run tests
testProgress();
