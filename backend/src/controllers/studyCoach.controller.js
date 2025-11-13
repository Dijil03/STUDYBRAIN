import { OpenAI } from "openai";
import StudySession from '../models/studysession.model.js';
import Homework from '../models/homework.model.js';
import Assessment from '../models/assessment.model.js';
import Progress from '../models/progress.model.js';
import User from '../models/auth.model.js';

// Get list of models to try (in order of preference) - same as ai.controller.js
const getAIModels = () => {
  if (process.env.AI_MODEL) {
    return [process.env.AI_MODEL, 'deepseek-ai/DeepSeek-V3.2-Exp:novita'];
  }
  
  return [
    'openai/gpt-oss-120b',
    'meta-llama/Llama-3.1-70B-Instruct',
    'mistralai/Mixtral-8x7B-Instruct-v0.1',
    'Qwen/Qwen2.5-72B-Instruct',
    'deepseek-ai/DeepSeek-V3.2-Exp:novita',
  ];
};

// Lazy initialization of OpenAI client with Hugging Face
let client = null;

const getClient = () => {
  if (!client) {
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      throw new Error('HF_TOKEN environment variable is not set.');
    }
    const originalKey = process.env.OPENAI_API_KEY;
    try {
      process.env.OPENAI_API_KEY = hfToken;
      client = new OpenAI({
        baseURL: "https://router.huggingface.co/v1",
        apiKey: hfToken,
      });
    } finally {
      if (originalKey) {
        process.env.OPENAI_API_KEY = originalKey;
      } else {
        delete process.env.OPENAI_API_KEY;
      }
    }
  }
  return client;
};

// Helper function to calculate date range
const getDateRange = (timeRange) => {
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case 'day':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 7));
  }
  
  return { startDate, endDate: new Date() };
};

// Get daily coaching message
export const getDailyCoaching = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Fetch comprehensive user data
    const { startDate, endDate } = getDateRange('week');
    
    const [studySessions, homeworks, assessments, progress, user] = await Promise.all([
      StudySession.find({ userId, date: { $gte: startDate, $lte: endDate } })
        .sort({ date: -1 }),
      Homework.find({ userId, createdAt: { $gte: startDate, $lte: endDate } }),
      Assessment.find({ userId, createdAt: { $gte: startDate, $lte: endDate } }),
      Progress.findOne({ userId }),
      User.findById(userId)
    ]);
    
    // Calculate key metrics
    const totalStudyTime = studySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgProductivity = studySessions.length > 0
      ? studySessions.reduce((sum, s) => sum + (s.productivity || 5), 0) / studySessions.length
      : 5;
    
    const assessmentScores = assessments.flatMap(a => a.submissions.map(s => s.score));
    const avgScore = assessmentScores.length > 0
      ? assessmentScores.reduce((sum, score) => sum + score, 0) / assessmentScores.length
      : null;
    
    const homeworkCompletionRate = homeworks.length > 0
      ? (homeworks.filter(h => h.completed).length / homeworks.length) * 100
      : 0;
    
    // Prepare coaching data
    const coachingData = {
      user: {
        name: user?.firstName || user?.username || 'Student',
        level: progress?.level || 1,
        xp: progress?.xp || 0
      },
      metrics: {
        totalStudyTime,
        sessionsCount: studySessions.length,
        avgProductivity: Math.round(avgProductivity * 10) / 10,
        avgScore: avgScore ? Math.round(avgScore) : null,
        homeworkCompletionRate: Math.round(homeworkCompletionRate),
        currentStreak: progress?.weeklyStats?.length || 0
      },
      recentActivity: {
        lastSession: studySessions[0] ? {
          subject: studySessions[0].subject,
          duration: studySessions[0].duration,
          productivity: studySessions[0].productivity
        } : null,
        upcomingDeadlines: homeworks.filter(h => !h.completed && new Date(h.dueDate) > new Date()).length,
        recentAssessments: assessments.slice(0, 3).map(a => ({
          title: a.title,
          score: a.submissions.length > 0 ? a.submissions[a.submissions.length - 1].score : null
        }))
      }
    };
    
    // Use AI to generate personalized coaching message
    const aiClient = getClient();
    const prompt = `You are an AI Study Coach named "Coach Brain" - a friendly, encouraging, and insightful mentor for students.

Student Profile:
- Name: ${coachingData.user.name}
- Level: ${coachingData.user.level}
- XP: ${coachingData.user.xp}

Recent Performance (Last 7 Days):
- Total Study Time: ${coachingData.metrics.totalStudyTime} minutes
- Study Sessions: ${coachingData.metrics.sessionsCount}
- Average Productivity: ${coachingData.metrics.avgProductivity}/10
- Average Score: ${coachingData.metrics.avgScore || 'No assessments yet'}%
- Homework Completion: ${coachingData.metrics.homeworkCompletionRate}%
- Current Streak: ${coachingData.metrics.currentStreak} days

Recent Activity:
${coachingData.recentActivity.lastSession 
  ? `- Last Session: ${coachingData.recentActivity.lastSession.subject} (${coachingData.recentActivity.lastSession.duration} min, productivity: ${coachingData.recentActivity.lastSession.productivity}/10)`
  : '- No recent study sessions'}
- Upcoming Deadlines: ${coachingData.recentActivity.upcomingDeadlines}
${coachingData.recentActivity.recentAssessments.length > 0 
  ? `- Recent Assessments: ${coachingData.recentActivity.recentAssessments.map(a => `${a.title} (${a.score || 'N/A'}%)`).join(', ')}`
  : ''}

Generate a personalized daily coaching message in this exact JSON format:
{
  "greeting": "Personalized greeting with student's name",
  "message": "Main coaching message (2-3 sentences) - be encouraging and specific",
  "insight": "One key insight about their study patterns (1-2 sentences)",
  "tip": "One actionable tip for today (1 sentence)",
  "motivation": "Motivational quote or encouragement (1 sentence)",
  "focusAreas": ["area1", "area2", "area3"],
  "encouragement": "Specific encouragement based on their progress (1 sentence)"
}

Be:
- Warm and friendly (like a caring teacher)
- Specific to their actual data
- Encouraging but honest
- Actionable with concrete tips
- Motivational without being generic`;

    const modelsToTry = getAIModels();
    let completion;
    let lastError = null;
    let usedModel = null;
    
    for (const model of modelsToTry) {
      try {
        console.log(`🤖 Study Coach: Trying model: ${model}`);
        completion = await aiClient.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are Coach Brain, an AI Study Coach that provides personalized, encouraging, and actionable guidance to help students achieve their learning goals.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 800,
          temperature: 0.8,
        });
        usedModel = model;
        console.log(`✅ Study Coach: Successfully using model: ${model}`);
        break;
      } catch (modelError) {
        lastError = modelError;
        console.warn(`⚠️ Study Coach: Model ${model} failed:`, modelError.message);
      }
    }
    
    if (!completion) {
      console.error(`❌ Study Coach: All models failed. Last error:`, lastError?.message);
      // Return default coaching message
      return res.status(200).json({
        success: true,
        data: {
          coaching: {
            greeting: `Hey ${coachingData.user.name}! 👋`,
            message: "Keep up the great work! Your dedication to learning is showing.",
            insight: "Consistency is key to success.",
            tip: "Try to study at the same time each day to build a habit.",
            motivation: "Every expert was once a beginner!",
            focusAreas: ["Consistency", "Time Management", "Active Recall"],
            encouragement: "You're making progress - keep going!"
          },
          metrics: coachingData.metrics,
          metadata: {
            model: 'fallback',
            timestamp: new Date().toISOString()
          }
        }
      });
    }
    
    const aiResponse = completion.choices?.[0]?.message?.content?.trim() || '{}';
    
    // Parse AI response
    let coaching;
    try {
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      coaching = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing AI coaching response:', parseError);
      // Fallback coaching
      coaching = {
        greeting: `Hey ${coachingData.user.name}! 👋`,
        message: aiResponse.substring(0, 200) || "Keep up the great work!",
        insight: "Your study patterns show potential for improvement.",
        tip: "Try breaking your study sessions into focused 25-minute blocks.",
        motivation: "Progress, not perfection!",
        focusAreas: ["Consistency", "Time Management", "Active Recall"],
        encouragement: "You're on the right track!"
      };
    }
    
    res.status(200).json({
      success: true,
      data: {
        coaching,
        metrics: coachingData.metrics,
        metadata: {
          model: usedModel,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error generating daily coaching:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate coaching message',
      error: error.message
    });
  }
};

// Get study session guidance
export const getSessionGuidance = async (req, res) => {
  try {
    const { userId } = req.body;
    const { subject, duration, goal } = req.body;
    
    // Fetch user's study history for this subject
    const recentSessions = await StudySession.find({ userId, subject })
      .sort({ date: -1 })
      .limit(5);
    
    const avgProductivity = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + (s.productivity || 5), 0) / recentSessions.length
      : 5;
    
    // Use AI to generate session guidance
    const aiClient = getClient();
    const prompt = `You are Coach Brain providing real-time study session guidance.

Student is about to study:
- Subject: ${subject || 'General'}
- Duration: ${duration || 30} minutes
- Goal: ${goal || 'General study'}

Their recent performance in this subject:
- Average Productivity: ${avgProductivity.toFixed(1)}/10
- Recent Sessions: ${recentSessions.length}

Provide session guidance in this exact JSON format:
{
  "sessionPlan": "Brief 2-3 sentence plan for this study session",
  "techniques": ["technique1", "technique2", "technique3"],
  "reminders": ["reminder1", "reminder2"],
  "encouragement": "Motivational message for the session"
}

Be specific, actionable, and encouraging.`;

    const modelsToTry = getAIModels();
    let completion;
    let lastError = null;
    let usedModel = null;
    
    for (const model of modelsToTry) {
      try {
        console.log(`🤖 Study Coach (Session): Trying model: ${model}`);
        completion = await aiClient.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are Coach Brain providing real-time study session guidance.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.7,
        });
        usedModel = model;
        console.log(`✅ Study Coach (Session): Successfully using model: ${model}`);
        break;
      } catch (modelError) {
        lastError = modelError;
        console.warn(`⚠️ Study Coach (Session): Model ${model} failed:`, modelError.message);
      }
    }
    
    if (!completion) {
      return res.status(200).json({
        success: true,
        data: {
          guidance: {
            sessionPlan: `Focus on ${subject || 'your studies'} for the next ${duration || 30} minutes.`,
            techniques: ["Active Recall", "Spaced Repetition", "Pomodoro Technique"],
            reminders: ["Take breaks every 25 minutes", "Stay hydrated"],
            encouragement: "You've got this! Stay focused!"
          }
        }
      });
    }
    
    const aiResponse = completion.choices?.[0]?.message?.content?.trim() || '{}';
    
    let guidance;
    try {
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      guidance = JSON.parse(jsonString);
    } catch (parseError) {
      guidance = {
        sessionPlan: `Focus on ${subject || 'your studies'} for the next ${duration || 30} minutes.`,
        techniques: ["Active Recall", "Spaced Repetition", "Pomodoro Technique"],
        reminders: ["Take breaks every 25 minutes", "Stay hydrated"],
        encouragement: "You've got this! Stay focused!"
      };
    }
    
    res.status(200).json({
      success: true,
      data: {
        guidance,
        metadata: {
          model: usedModel,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error generating session guidance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate session guidance',
      error: error.message
    });
  }
};

// Get weekly coaching report
export const getWeeklyReport = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { startDate, endDate } = getDateRange('week');
    
    const [studySessions, homeworks, assessments, progress] = await Promise.all([
      StudySession.find({ userId, date: { $gte: startDate, $lte: endDate } }),
      Homework.find({ userId, createdAt: { $gte: startDate, $lte: endDate } }),
      Assessment.find({ userId, createdAt: { $gte: startDate, $lte: endDate } }),
      Progress.findOne({ userId })
    ]);
    
    // Calculate comprehensive metrics
    const weeklyData = {
      totalStudyTime: studySessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      sessionsCount: studySessions.length,
      avgProductivity: studySessions.length > 0
        ? studySessions.reduce((sum, s) => sum + (s.productivity || 5), 0) / studySessions.length
        : 0,
      homeworkCompleted: homeworks.filter(h => h.completed).length,
      homeworkTotal: homeworks.length,
      assessmentScores: assessments.flatMap(a => a.submissions.map(s => s.score)),
      levelProgress: progress?.level || 1,
      xpGained: progress?.xp || 0
    };
    
    // Use AI to generate weekly report
    const aiClient = getClient();
    const prompt = `Generate a comprehensive weekly study report in JSON format:

Weekly Performance:
- Study Time: ${weeklyData.totalStudyTime} minutes
- Sessions: ${weeklyData.sessionsCount}
- Avg Productivity: ${weeklyData.avgProductivity.toFixed(1)}/10
- Homework: ${weeklyData.homeworkCompleted}/${weeklyData.homeworkTotal} completed
- Assessment Scores: ${weeklyData.assessmentScores.length > 0 ? weeklyData.assessmentScores.join(', ') : 'None'}
- Level: ${weeklyData.levelProgress}
- XP: ${weeklyData.xpGained}

Provide in this JSON format:
{
  "summary": "Overall week summary (2-3 sentences)",
  "highlights": ["highlight1", "highlight2", "highlight3"],
  "improvements": ["improvement1", "improvement2"],
  "nextWeekGoals": ["goal1", "goal2", "goal3"],
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

    const modelsToTry = getAIModels();
    let completion;
    let lastError = null;
    let usedModel = null;
    
    for (const model of modelsToTry) {
      try {
        completion = await aiClient.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are Coach Brain generating weekly study reports.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });
        usedModel = model;
        break;
      } catch (modelError) {
        lastError = modelError;
      }
    }
    
    if (!completion) {
      return res.status(200).json({
        success: true,
        data: {
          report: {
            summary: "You've made progress this week!",
            highlights: ["Consistent study sessions", "Completed homework"],
            improvements: ["Increase study time", "Improve productivity"],
            nextWeekGoals: ["Maintain consistency", "Complete all homework"],
            recommendations: ["Use Pomodoro technique", "Review notes daily"]
          },
          metrics: weeklyData
        }
      });
    }
    
    const aiResponse = completion.choices?.[0]?.message?.content?.trim() || '{}';
    
    let report;
    try {
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      report = JSON.parse(jsonString);
    } catch (parseError) {
      report = {
        summary: "You've made progress this week!",
        highlights: ["Consistent study sessions"],
        improvements: ["Increase study time"],
        nextWeekGoals: ["Maintain consistency"],
        recommendations: ["Use Pomodoro technique"]
      };
    }
    
    res.status(200).json({
      success: true,
      data: {
        report,
        metrics: weeklyData,
        metadata: {
          model: usedModel,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate weekly report',
      error: error.message
    });
  }
};

