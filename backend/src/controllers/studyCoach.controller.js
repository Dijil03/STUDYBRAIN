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
      
      // Check if it's a credit/quota error
      const isQuotaError = lastError?.message?.includes('402') || 
                          lastError?.message?.includes('credits') || 
                          lastError?.message?.includes('quota') ||
                          lastError?.message?.includes('exceeded');
      
      // Generate intelligent fallback based on user data
      const generateFallbackCoaching = () => {
        const { metrics, recentActivity } = coachingData;
        
        // Analyze performance
        let greeting = `Hey ${coachingData.user.name}! 👋`;
        let message = "";
        let insight = "";
        let tip = "";
        let motivation = "";
        let focusAreas = [];
        let encouragement = "";
        
        // Performance-based messages
        if (metrics.avgProductivity >= 7) {
          message = "You're doing great! Your productivity is high - keep up this momentum!";
          insight = "High productivity scores indicate effective study habits.";
          tip = "Maintain your current study routine - it's working well!";
          motivation = "Excellence is not a skill, it's an attitude!";
          focusAreas = ["Maintain Consistency", "Build on Strengths", "Help Others"];
          encouragement = "Your dedication is paying off - you're on the right track!";
        } else if (metrics.avgProductivity >= 5) {
          message = "You're making steady progress! There's room to optimize your study sessions.";
          insight = "Moderate productivity suggests you could benefit from better time management.";
          tip = "Try the Pomodoro technique: 25 minutes focused study, 5 minutes break.";
          motivation = "Progress, not perfection!";
          focusAreas = ["Time Management", "Focus Techniques", "Active Recall"];
          encouragement = "Every session counts - keep building your study habits!";
        } else {
          message = "Let's boost your study effectiveness! Small changes can make a big difference.";
          insight = "Lower productivity might indicate distractions or unclear goals.";
          tip = "Start with shorter, focused sessions and gradually increase duration.";
          motivation = "The journey of a thousand miles begins with a single step!";
          focusAreas = ["Build Focus", "Set Clear Goals", "Eliminate Distractions"];
          encouragement = "You've got this! Start small and build momentum!";
        }
        
        // Study time analysis
        if (metrics.totalStudyTime < 60) {
          tip = "Aim for at least 60 minutes of study time this week to see better results.";
        } else if (metrics.totalStudyTime > 300) {
          tip = "Great study time! Remember to take breaks to avoid burnout.";
        }
        
        // Session count analysis
        if (metrics.sessionsCount < 3) {
          insight = "More frequent study sessions can improve retention.";
          tip = "Try to study a little bit every day, even if it's just 15 minutes.";
        }
        
        // Homework completion
        if (recentActivity.upcomingDeadlines > 0) {
          focusAreas.push("Complete Assignments");
          tip = `You have ${recentActivity.upcomingDeadlines} upcoming deadline(s) - plan your time wisely!`;
        }
        
        // Streak encouragement
        if (metrics.currentStreak > 0) {
          encouragement = `Amazing ${metrics.currentStreak}-day streak! Keep it going!`;
        }
        
        return {
          greeting,
          message,
          insight,
          tip,
          motivation,
          focusAreas: focusAreas.length > 0 ? focusAreas : ["Consistency", "Time Management", "Active Recall"],
          encouragement: encouragement || "You're making progress - keep going!"
        };
      };
      
      return res.status(200).json({
        success: true,
        data: {
          coaching: generateFallbackCoaching(),
          metrics: coachingData.metrics,
          metadata: {
            model: 'fallback',
            timestamp: new Date().toISOString(),
            apiLimitReached: isQuotaError,
            message: isQuotaError ? 'Using intelligent fallback due to API limits' : 'Using fallback due to API error'
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
      // Generate intelligent fallback based on subject and duration
      const generateFallbackGuidance = () => {
        const techniques = [];
        const reminders = [];
        
        // Subject-specific techniques
        if (subject.toLowerCase().includes('math') || subject.toLowerCase().includes('mathematics')) {
          techniques.push("Practice Problems", "Work Through Examples", "Review Formulas");
          reminders.push("Show your work step-by-step", "Check your answers");
        } else if (subject.toLowerCase().includes('science') || subject.toLowerCase().includes('biology') || subject.toLowerCase().includes('chemistry')) {
          techniques.push("Concept Mapping", "Visual Learning", "Experiment Review");
          reminders.push("Draw diagrams to visualize concepts", "Connect theory to real-world examples");
        } else if (subject.toLowerCase().includes('history') || subject.toLowerCase().includes('social')) {
          techniques.push("Timeline Creation", "Storytelling Method", "Cause and Effect Analysis");
          reminders.push("Create mental stories for events", "Connect events chronologically");
        } else if (subject.toLowerCase().includes('language') || subject.toLowerCase().includes('english')) {
          techniques.push("Reading Aloud", "Note-taking", "Vocabulary Building");
          reminders.push("Practice writing", "Review grammar rules");
        } else {
          techniques.push("Active Recall", "Spaced Repetition", "Pomodoro Technique");
          reminders.push("Take breaks every 25 minutes", "Review key concepts");
        }
        
        // Duration-based recommendations
        if (duration >= 60) {
          reminders.push("Take a 10-minute break after 50 minutes");
          techniques.push("Break into 25-minute chunks");
        } else if (duration <= 30) {
          reminders.push("Stay focused - short sessions need maximum concentration");
        }
        
        return {
          sessionPlan: `Focus on ${subject || 'your studies'} for the next ${duration || 30} minutes. ${goal ? `Your goal: ${goal}` : 'Stay focused and make the most of this session!'}`,
          techniques: techniques.length > 0 ? techniques : ["Active Recall", "Spaced Repetition", "Pomodoro Technique"],
          reminders: reminders.length > 0 ? reminders : ["Take breaks every 25 minutes", "Stay hydrated", "Stay focused"],
          encouragement: "You've got this! Stay focused and make progress!"
        };
      };
      
      return res.status(200).json({
        success: true,
        data: {
          guidance: generateFallbackGuidance(),
          metadata: {
            model: 'fallback',
            timestamp: new Date().toISOString()
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
      // Generate intelligent fallback based on weekly data
      const generateFallbackReport = () => {
        const highlights = [];
        const improvements = [];
        const nextWeekGoals = [];
        const recommendations = [];
        
        // Analyze and generate insights
        if (weeklyData.sessionsCount >= 5) {
          highlights.push("Consistent study sessions throughout the week");
        } else {
          improvements.push("Increase number of study sessions");
          nextWeekGoals.push("Aim for at least 5 study sessions");
        }
        
        if (weeklyData.totalStudyTime >= 300) {
          highlights.push("Excellent total study time");
        } else if (weeklyData.totalStudyTime >= 150) {
          highlights.push("Good study time - room for growth");
          improvements.push("Gradually increase daily study time");
        } else {
          improvements.push("Increase weekly study time");
          nextWeekGoals.push("Target 300+ minutes of study time");
        }
        
        if (weeklyData.avgProductivity >= 7) {
          highlights.push("High productivity scores");
        } else {
          improvements.push("Improve study session productivity");
          recommendations.push("Use Pomodoro technique for better focus");
        }
        
        if (weeklyData.homeworkCompleted === weeklyData.homeworkTotal && weeklyData.homeworkTotal > 0) {
          highlights.push("Completed all homework assignments");
        } else if (weeklyData.homeworkTotal > 0) {
          improvements.push("Complete remaining homework");
          nextWeekGoals.push("Finish all assignments on time");
        }
        
        if (weeklyData.assessmentScores.length > 0) {
          const avgScore = weeklyData.assessmentScores.reduce((sum, s) => sum + s, 0) / weeklyData.assessmentScores.length;
          if (avgScore >= 80) {
            highlights.push(`Strong assessment performance (${Math.round(avgScore)}% average)`);
          } else {
            improvements.push("Review assessment mistakes and learn from them");
            recommendations.push("Focus on weak areas identified in assessments");
          }
        }
        
        // Default values if lists are empty
        if (highlights.length === 0) highlights.push("Started your learning journey");
        if (improvements.length === 0) improvements.push("Build consistent study habits");
        if (nextWeekGoals.length === 0) nextWeekGoals.push("Maintain consistency");
        if (recommendations.length === 0) recommendations.push("Review notes daily", "Use active recall");
        
        const summary = weeklyData.totalStudyTime >= 300 
          ? "You've had a productive week! Your dedication to learning is showing great results."
          : weeklyData.sessionsCount >= 5
          ? "You've maintained good consistency this week. Keep building on this foundation!"
          : "You've made a start this week. Next week, focus on building more consistent study habits.";
        
        return {
          summary,
          highlights,
          improvements,
          nextWeekGoals,
          recommendations
        };
      };
      
      return res.status(200).json({
        success: true,
        data: {
          report: generateFallbackReport(),
          metrics: weeklyData,
          metadata: {
            model: 'fallback',
            timestamp: new Date().toISOString()
          }
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

