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

// Get dashboard data
export const getDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeRange = 'week' } = req.query;
    
    const { startDate, endDate } = getDateRange(timeRange);
    
    // Fetch user data
    const [studySessions, homeworks, assessments, progress, user] = await Promise.all([
      StudySession.find({ userId, date: { $gte: startDate, $lte: endDate } }),
      Homework.find({ userId, createdAt: { $gte: startDate, $lte: endDate } }),
      Assessment.find({ userId, createdAt: { $gte: startDate, $lte: endDate } }),
      Progress.findOne({ userId }),
      User.findById(userId)
    ]);
    
    // Calculate overview stats
    const totalStudyTime = studySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const sessionsCompleted = studySessions.length;
    const averageProductivity = studySessions.length > 0
      ? studySessions.reduce((sum, s) => sum + (s.productivity || 5), 0) / studySessions.length
      : 0;
    
    // Calculate performance from assessments
    const assessmentScores = assessments.flatMap(a => 
      a.submissions.map(s => s.score)
    );
    const averageAccuracy = assessmentScores.length > 0
      ? assessmentScores.reduce((sum, score) => sum + score, 0) / assessmentScores.length
      : 0;
    
    // Calculate streak (simplified - you might want to use a streak model)
    const currentStreak = progress?.weeklyStats?.length || 0;
    
    // Real-time status
    const recentSession = studySessions
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const realTime = {
      currentActivity: recentSession ? 'studying' : 'not_active',
      currentSubject: recentSession?.subject || null,
      focusLevel: Math.round(averageProductivity) || 5
    };

        res.status(200).json({
            success: true,
      data: {
        overview: {
          totalStudyTime,
          sessionsCompleted,
          currentStreak,
          averageProductivity: Math.round(averageProductivity * 10) / 10
        },
        performance: {
          averageAccuracy: Math.round(averageAccuracy),
          totalAssessments: assessments.length,
          totalSubmissions: assessmentScores.length
        },
        realTime
      }
        });
    } catch (error) {
    console.error('Error fetching dashboard:', error);
        res.status(500).json({
            success: false,
      message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
};

// Get AI-powered insights
export const getInsights = async (req, res) => {
    try {
        const { userId } = req.params;
    const { subject = 'all', timeRange = 'week' } = req.query;
    
    const { startDate, endDate } = getDateRange(timeRange);
    
    // Fetch comprehensive user data
    const [studySessions, homeworks, assessments, progress] = await Promise.all([
      StudySession.find({ userId, date: { $gte: startDate, $lte: endDate } })
        .sort({ date: -1 }),
      Homework.find({ userId, createdAt: { $gte: startDate, $lte: endDate } }),
      Assessment.find({ userId, createdAt: { $gte: startDate, $lte: endDate } }),
      Progress.findOne({ userId })
    ]);
    
    // Filter by subject if specified
    const filteredSessions = subject === 'all' 
      ? studySessions 
      : studySessions.filter(s => s.subject?.toLowerCase() === subject.toLowerCase());
    
    // Prepare data summary for AI
    const dataSummary = {
      studySessions: {
        total: filteredSessions.length,
        totalMinutes: filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0),
        averageDuration: filteredSessions.length > 0
          ? filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / filteredSessions.length
          : 0,
        averageProductivity: filteredSessions.length > 0
          ? filteredSessions.reduce((sum, s) => sum + (s.productivity || 5), 0) / filteredSessions.length
          : 0,
        subjects: [...new Set(filteredSessions.map(s => s.subject))],
        timeDistribution: filteredSessions.reduce((acc, s) => {
          const hour = new Date(s.date).getHours();
          const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
          acc[period] = (acc[period] || 0) + (s.duration || 0);
          return acc;
        }, {})
      },
      homeworks: {
        total: homeworks.length,
        completed: homeworks.filter(h => h.completed).length,
        completionRate: homeworks.length > 0
          ? (homeworks.filter(h => h.completed).length / homeworks.length) * 100
          : 0,
        subjects: [...new Set(homeworks.map(h => h.subject))]
      },
      assessments: {
        total: assessments.length,
        averageScore: assessments.flatMap(a => a.submissions.map(s => s.score)).length > 0
          ? assessments.flatMap(a => a.submissions.map(s => s.score))
              .reduce((sum, score) => sum + score, 0) / assessments.flatMap(a => a.submissions).length
          : 0,
        totalSubmissions: assessments.reduce((sum, a) => sum + a.submissions.length, 0)
      },
      progress: {
        level: progress?.level || 1,
        xp: progress?.xp || 0,
        totalStudyTime: progress?.totalStudyTime || 0,
        tasksCompleted: progress?.tasksCompleted || 0
      }
    };
    
    // Use AI to generate insights
    const aiClient = getClient();
    const prompt = `You are an AI learning analytics expert. Analyze the following student study data and provide 3-5 actionable insights in JSON format.

Student Data Summary:
${JSON.stringify(dataSummary, null, 2)}

Time Range: ${timeRange}
Subject Focus: ${subject}

Please provide insights in this exact JSON format:
{
  "insights": [
    {
      "title": "Short insight title",
      "description": "Detailed explanation of the insight",
      "type": "positive|negative|warning|default",
      "recommendation": "Actionable recommendation for the student"
    }
  ]
}

Focus on:
- Study patterns and habits
- Performance trends
- Areas for improvement
- Strengths to maintain
- Time management
- Subject-specific observations

Be specific, encouraging, and actionable.`;

    const modelsToTry = getAIModels();
    let completion;
    let lastError = null;
    let usedModel = null;
    
    for (const model of modelsToTry) {
      try {
        console.log(`🤖 Analytics: Trying model: ${model}`);
        completion = await aiClient.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are an expert learning analytics AI that provides actionable insights to help students improve their study habits and performance.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        });
        usedModel = model;
        console.log(`✅ Analytics: Successfully using model: ${model}`);
        break;
      } catch (modelError) {
        lastError = modelError;
        console.warn(`⚠️ Analytics: Model ${model} failed:`, modelError.message);
      }
    }
    
    if (!completion) {
      console.error(`❌ Analytics: All models failed. Last error:`, lastError?.message);
      // Return default insights if AI fails
            return res.status(200).json({
                success: true,
                data: {
          insights: [
            {
              title: "Keep Up the Good Work!",
              description: "You've been consistent with your study sessions.",
              type: "positive",
              recommendation: "Continue maintaining your current study schedule."
            }
          ]
                }
            });
        }

    const aiResponse = completion.choices?.[0]?.message?.content?.trim() || '{}';
    
    // Parse AI response
    let insights;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      const parsed = JSON.parse(jsonString);
      insights = parsed.insights || [];
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback: try to extract insights from text
      insights = [
        {
          title: "AI Analysis Available",
          description: aiResponse.substring(0, 200),
          type: "default",
          recommendation: "Review your study patterns regularly."
        }
      ];
        }

        res.status(200).json({
            success: true,
            data: {
        insights,
                metadata: {
          model: usedModel,
          timeRange,
          subject,
          dataPoints: {
            sessions: filteredSessions.length,
            homeworks: homeworks.length,
            assessments: assessments.length
          }
        }
      }
            });
        } catch (error) {
    console.error('Error generating insights:', error);
        res.status(500).json({
            success: false,
      message: 'Failed to generate insights',
            error: error.message
        });
    }
};

// Get AI-powered predictions
export const getPredictions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { predictionType = 'exam_success' } = req.query;
    
    // Fetch historical data
    const [studySessions, assessments, progress] = await Promise.all([
      StudySession.find({ userId }).sort({ date: -1 }).limit(50),
      Assessment.find({ userId }).sort({ createdAt: -1 }).limit(20),
      Progress.findOne({ userId })
    ]);
    
    // Calculate trends
    const recentSessions = studySessions.slice(0, 10);
    const olderSessions = studySessions.slice(10, 20);
    
    const recentAvgProductivity = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + (s.productivity || 5), 0) / recentSessions.length
      : 5;
    const olderAvgProductivity = olderSessions.length > 0
      ? olderSessions.reduce((sum, s) => sum + (s.productivity || 5), 0) / olderSessions.length
      : 5;
    
    const recentAvgScore = assessments.slice(0, 5).flatMap(a => a.submissions.map(s => s.score)).length > 0
      ? assessments.slice(0, 5).flatMap(a => a.submissions.map(s => s.score))
          .reduce((sum, score) => sum + score, 0) / assessments.slice(0, 5).flatMap(a => a.submissions).length
      : 70;
    
    const trendData = {
      productivityTrend: recentAvgProductivity - olderAvgProductivity,
      studyConsistency: studySessions.length,
      averageScore: recentAvgScore,
      totalStudyTime: progress?.totalStudyTime || 0
    };
    
    // Use AI to generate predictions
    const aiClient = getClient();
    const prompt = `You are an AI learning analytics expert. Based on the following student performance data, predict their ${predictionType} probability.

Student Performance Data:
${JSON.stringify(trendData, null, 2)}

Recent Study Sessions: ${recentSessions.length}
Recent Assessments: ${assessments.slice(0, 5).length}

Please provide a prediction in this exact JSON format:
{
  "successProbability": 75,
  "confidence": 0.85,
  "keyFactors": ["factor1", "factor2", "factor3"],
  "explanation": "Brief explanation of the prediction"
}

Be realistic and data-driven.`;

    const modelsToTry = getAIModels();
    let completion;
    let lastError = null;
    let usedModel = null;
    
    for (const model of modelsToTry) {
      try {
        console.log(`🤖 Analytics Predictions: Trying model: ${model}`);
        completion = await aiClient.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are an expert learning analytics AI that provides realistic predictions based on student performance data.' },
            { role: 'user', content: prompt }
          ],
            max_tokens: 800,
          temperature: 0.6,
        });
        usedModel = model;
        console.log(`✅ Analytics Predictions: Successfully using model: ${model}`);
        break;
      } catch (modelError) {
        lastError = modelError;
        console.warn(`⚠️ Analytics Predictions: Model ${model} failed:`, modelError.message);
      }
    }
    
    if (!completion) {
      console.error(`❌ Analytics Predictions: All models failed. Last error:`, lastError?.message);
      // Return default prediction
      return res.status(200).json({
        success: true,
        data: {
          predictions: {
            successProbability: Math.min(95, Math.max(50, Math.round(recentAvgScore))),
            confidence: 0.7,
            keyFactors: ['Study consistency', 'Performance trends'],
            explanation: 'Based on your recent performance data.'
          }
        }
      });
    }
    
    const aiResponse = completion.choices?.[0]?.message?.content?.trim() || '{}';
    
    // Parse AI response
    let prediction;
    try {
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      prediction = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing AI prediction:', parseError);
      prediction = {
        successProbability: Math.min(95, Math.max(50, Math.round(recentAvgScore))),
        confidence: 0.7,
        keyFactors: ['Study consistency', 'Performance trends'],
        explanation: aiResponse.substring(0, 200) || 'Based on your recent performance data.'
      };
    }
    
    res.status(200).json({
      success: true,
      data: {
        predictions: prediction,
        metadata: {
          model: usedModel,
          predictionType,
          dataPoints: {
            sessions: studySessions.length,
            assessments: assessments.length
          }
        }
      }
    });
    } catch (error) {
        console.error('Error generating predictions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate predictions',
      error: error.message
    });
  }
};

// Get trend data for charts
export const getTrends = async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeRange = 'week' } = req.query;
    
    const { startDate, endDate } = getDateRange(timeRange);
    
    // Fetch study sessions and assessments
    const [studySessions, assessments] = await Promise.all([
      StudySession.find({ userId, date: { $gte: startDate, $lte: endDate } })
        .sort({ date: 1 }),
      Assessment.find({ userId, createdAt: { $gte: startDate, $lte: endDate } })
        .sort({ createdAt: 1 })
    ]);
    
    // Group data by day
    const days = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
    const dataByDay = {};
    
    // Initialize all days
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString().split('T')[0];
      dataByDay[dateKey] = {
        date,
        studyTime: 0,
        performance: [],
        productivity: []
      };
    }
    
    // Aggregate study sessions
    studySessions.forEach(session => {
      const dateKey = new Date(session.date).toISOString().split('T')[0];
      if (dataByDay[dateKey]) {
        dataByDay[dateKey].studyTime += session.duration || 0;
        if (session.productivity) {
          dataByDay[dateKey].productivity.push(session.productivity);
        }
      }
    });
    
    // Aggregate assessment scores
    assessments.forEach(assessment => {
      assessment.submissions.forEach(submission => {
        const dateKey = new Date(submission.submittedAt || assessment.createdAt).toISOString().split('T')[0];
        if (dataByDay[dateKey]) {
          dataByDay[dateKey].performance.push(submission.score);
        }
      });
    });
    
    // Build chart data
    const labels = [];
    const performanceData = [];
    const studyTimeData = [];
    const productivityData = [];
    
    Object.keys(dataByDay).sort().forEach(dateKey => {
      const dayData = dataByDay[dateKey];
      const date = new Date(dayData.date);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Calculate average performance for the day
      const avgPerformance = dayData.performance.length > 0
        ? dayData.performance.reduce((sum, score) => sum + score, 0) / dayData.performance.length
        : null;
      performanceData.push(avgPerformance !== null ? Math.round(avgPerformance) : null);
      
      // Study time in minutes
      studyTimeData.push(dayData.studyTime);
      
      // Calculate average productivity for the day
      const avgProductivity = dayData.productivity.length > 0
        ? dayData.productivity.reduce((sum, prod) => sum + prod, 0) / dayData.productivity.length
        : null;
      productivityData.push(avgProductivity !== null ? Math.round(avgProductivity * 10) / 10 : null);
    });
    
    res.status(200).json({
      success: true,
      data: {
        performance: {
          labels,
          data: performanceData
        },
        studyTime: {
          labels,
          data: studyTimeData
        },
        productivity: {
          labels,
          data: productivityData
        }
      }
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trend data',
      error: error.message
    });
  }
};

// Generate analytics report
export const generateReport = async (req, res) => {
  try {
    const { userId, reportType, startDate, endDate } = req.body;
    
    // This is a placeholder - you can implement PDF generation here
    res.status(200).json({
      success: true,
      message: 'Report generation initiated',
      data: {
        reportId: `report_${Date.now()}`,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
};
