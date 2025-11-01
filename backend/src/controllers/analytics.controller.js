import {
    LearningSession,
    PerformanceMetrics,
    LearningAnalyticsPattern,
    LearningGoal,
    RealTimeAnalytics,
    AnalyticsReport
} from '../models/learningAnalytics.model.js';
import StudySession from '../models/studysession.model.js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Track Learning Session
export const trackLearningSession = async (req, res) => {
    try {
        const {
            userId,
            sessionId,
            subject,
            topic,
            activities,
            performance,
            metadata
        } = req.body;

        const startTime = new Date();
        const endTime = new Date();
        const duration = Math.round((endTime - startTime) / (1000 * 60)); // in minutes

        // Generate AI insights for the session
        const aiInsights = await generateSessionInsights(activities, performance, subject, topic);

        const session = new LearningSession({
            userId,
            sessionId,
            subject,
            topic,
            startTime,
            endTime,
            duration,
            activities,
            performance,
            aiInsights,
            metadata
        });

        await session.save();

        // Update real-time analytics
        await updateRealTimeAnalytics(userId, {
            currentActivity: 'studying',
            currentSubject: subject,
            currentTopic: topic,
            sessionDuration: duration,
            focusLevel: performance.engagement,
            productivity: performance.comprehension,
            mood: metadata.mood || 'focused',
            energyLevel: metadata.energyLevel || 7
        });

        res.status(200).json({
            success: true,
            data: {
                session,
                insights: aiInsights
            }
        });
    } catch (error) {
        console.error('Error tracking learning session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track learning session',
            error: error.message
        });
    }
};

// Generate Performance Metrics
export const generatePerformanceMetrics = async (req, res) => {
    try {
        const { userId, timeRange } = req.body;

        // Get learning sessions for the time range
        const sessions = await LearningSession.find({
            userId,
            startTime: { $gte: timeRange.start, $lte: timeRange.end }
        });

        if (sessions.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    message: 'No learning data available for the specified time range',
                    metrics: null
                }
            });
        }

        // Calculate comprehensive metrics
        const metrics = await calculatePerformanceMetrics(sessions, userId);

        // Generate AI insights
        const aiInsights = await generatePerformanceInsights(metrics, sessions);

        // Generate predictions
        const predictions = await generatePerformancePredictions(metrics, sessions);

        // Save or update performance metrics
        const existingMetrics = await PerformanceMetrics.findOne({
            userId,
            'timeRange.start': timeRange.start,
            'timeRange.end': timeRange.end
        });

        if (existingMetrics) {
            existingMetrics.metrics = metrics;
            existingMetrics.predictions = predictions;
            await existingMetrics.save();
        } else {
            const performanceMetrics = new PerformanceMetrics({
                userId,
                timeRange,
                metrics,
                predictions
            });
            await performanceMetrics.save();
        }

        res.status(200).json({
            success: true,
            data: {
                metrics,
                insights: aiInsights,
                predictions
            }
        });
    } catch (error) {
        console.error('Error generating performance metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate performance metrics',
            error: error.message
        });
    }
};

// Get Learning Analytics Dashboard
export const getAnalyticsDashboard = async (req, res) => {
    try {
        const { userId } = req.params;
        const { timeRange = 'week' } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Calculate time range
        const now = new Date();
        let startDate, endDate;

        switch (timeRange) {
            case 'day':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                endDate = now;
        }

        // Get comprehensive analytics data with error handling
        let sessions = [];
        let performanceMetrics = null;
        let learningPattern = null;
        let goals = [];
        let realTimeData = null;

        try {
            // Fetch from actual StudySession model and convert to LearningSession format
            const userIdString = String(userId); // Ensure userId is a string
            console.log('📊 Fetching study sessions for userId:', userIdString, 'date range:', { startDate, endDate });
            
            const studySessions = await StudySession.find({ userId: userIdString, date: { $gte: startDate, $lte: endDate } }).catch(() => []);
            console.log('📊 Found study sessions:', studySessions.length);
            
            // Convert StudySession to LearningSession format for analytics
            sessions = studySessions.map(session => ({
                userId: session.userId,
                sessionId: session._id.toString(),
                subject: session.subject,
                topic: session.subject, // Use subject as topic if not available
                startTime: session.date || session.createdAt,
                endTime: new Date(session.date || session.createdAt).getTime() + (session.duration * 60 * 1000),
                duration: session.duration,
                activities: [{
                    type: 'practicing',
                    duration: session.duration,
                    effectiveness: session.productivity || 5,
                    difficulty: 'medium'
                }],
                performance: {
                    accuracy: session.productivity ? (session.productivity * 10) : 70, // Map productivity 1-10 to accuracy 10-100
                    speed: 5, // Default value
                    comprehension: session.productivity || 5,
                    engagement: session.productivity || 5
                },
                aiInsights: {},
                metadata: {
                    notes: session.notes || ''
                }
            }));

            [performanceMetrics, learningPattern, goals, realTimeData] = await Promise.all([
                PerformanceMetrics.findOne({ userId }).sort({ createdAt: -1 }).catch(() => null),
                LearningAnalyticsPattern.findOne({ userId }).catch(() => null),
                LearningGoal.find({ userId }).catch(() => []),
                RealTimeAnalytics.findOne({ userId }).sort({ timestamp: -1 }).catch(() => null)
            ]);
        } catch (queryError) {
            console.error('Error fetching analytics data:', queryError);
            // Continue with empty data
        }

        // Ensure sessions is an array
        if (!Array.isArray(sessions)) {
            sessions = [];
        }
        if (!Array.isArray(goals)) {
            goals = [];
        }

        // Generate dashboard data
        const dashboardData = await generateDashboardData({
            sessions: sessions || [],
            performanceMetrics: performanceMetrics || null,
            learningPattern: learningPattern || null,
            goals: goals || [],
            realTimeData: realTimeData || null,
            timeRange: { start: startDate, end: endDate }
        });

        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Error getting analytics dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get analytics dashboard',
            error: error.message
        });
    }
};

// Generate Learning Insights
export const generateLearningInsights = async (req, res) => {
    try {
        const { userId } = req.params;
        const { subject, timeRange } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Calculate time range
        let startDate = null;
        if (timeRange) {
            const days = parseInt(timeRange) || 7;
            startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        }

        // Build query
        const userIdString = String(userId); // Ensure userId is a string
        const query = { userId: userIdString };
        if (subject && subject !== 'all') {
            query.subject = subject;
        }
        if (startDate) {
            query.date = { $gte: startDate, $lte: new Date() };
        }

        // Get learning data from StudySession model
        let studySessions = [];
        try {
            console.log('📊 Fetching insights for userId:', userIdString, 'subject:', subject, 'timeRange:', timeRange);
            
            studySessions = await StudySession.find(query);
            console.log('📊 Found study sessions for insights:', studySessions.length);
        } catch (queryError) {
            console.error('Error fetching sessions:', queryError);
            studySessions = [];
        }

        if (!Array.isArray(studySessions)) {
            studySessions = [];
        }

        // Convert StudySession to LearningSession format
        const sessions = studySessions.map(session => ({
            userId: session.userId,
            sessionId: session._id.toString(),
            subject: session.subject,
            topic: session.subject,
            startTime: session.date || session.createdAt,
            endTime: new Date(session.date || session.createdAt).getTime() + (session.duration * 60 * 1000),
            duration: session.duration,
            activities: [{
                type: 'practicing',
                duration: session.duration,
                effectiveness: session.productivity || 5,
                difficulty: 'medium'
            }],
            performance: {
                accuracy: session.productivity ? (session.productivity * 10) : 70,
                speed: 5,
                comprehension: session.productivity || 5,
                engagement: session.productivity || 5
            },
            aiInsights: {},
            metadata: {
                notes: session.notes || ''
            }
        }));

        if (sessions.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    insights: [],
                    recommendations: []
                }
            });
        }

        // Generate AI-powered insights
        let insights = [];
        let recommendations = [];
        
        try {
            insights = await generateAIInsights(sessions, userId, subject);
            recommendations = await generatePersonalizedRecommendations(sessions, userId, subject);
        } catch (aiError) {
            console.error('Error generating AI insights:', aiError);
            // Return empty arrays if AI fails
            insights = [];
            recommendations = [];
        }

        // Ensure arrays
        if (!Array.isArray(insights)) {
            insights = [];
        }
        if (!Array.isArray(recommendations)) {
            recommendations = [];
        }

        res.status(200).json({
            success: true,
            data: {
                insights,
                recommendations
            }
        });
    } catch (error) {
        console.error('Error generating learning insights:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate learning insights',
            error: error.message
        });
    }
};

// Get Predictive Analytics
export const getPredictiveAnalytics = async (req, res) => {
    try {
        const { userId } = req.params;
        const { predictionType = 'exam_success' } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Get historical data with error handling
        let sessions = [];
        let performanceMetrics = null;

        try {
            // Fetch from StudySession model
            const userIdString = String(userId); // Ensure userId is a string
            console.log('📊 Fetching predictions for userId:', userIdString);
            
            const studySessions = await StudySession.find({ userId: userIdString }).sort({ date: -1 }).limit(100);
            console.log('📊 Found study sessions for predictions:', studySessions.length);
            
            // Convert StudySession to LearningSession format
            sessions = studySessions.map(session => ({
                userId: session.userId,
                sessionId: session._id.toString(),
                subject: session.subject,
                topic: session.subject,
                startTime: session.date || session.createdAt,
                endTime: new Date(session.date || session.createdAt).getTime() + (session.duration * 60 * 1000),
                duration: session.duration,
                activities: [{
                    type: 'practicing',
                    duration: session.duration,
                    effectiveness: session.productivity || 5,
                    difficulty: 'medium'
                }],
                performance: {
                    accuracy: session.productivity ? (session.productivity * 10) : 70,
                    speed: 5,
                    comprehension: session.productivity || 5,
                    engagement: session.productivity || 5
                },
                aiInsights: {},
                metadata: {
                    notes: session.notes || ''
                }
            }));

            performanceMetrics = await PerformanceMetrics.findOne({ userId }).sort({ createdAt: -1 });
        } catch (queryError) {
            console.error('Error fetching predictive data:', queryError);
            sessions = [];
            performanceMetrics = null;
        }

        if (!Array.isArray(sessions)) {
            sessions = [];
        }

        if (!sessions.length) {
            return res.status(200).json({
                success: true,
                data: {
                    message: 'Insufficient data for predictions',
                    predictions: {
                        successProbability: 0,
                        confidence: 0,
                        keyFactors: [],
                        riskFactors: ['No study data available'],
                        recommendedActions: ['Start logging study sessions to generate predictions']
                    }
                }
            });
        }

        // Generate predictions based on type
        let predictions;
        try {
            switch (predictionType) {
                case 'exam_success':
                    predictions = await predictExamSuccess(sessions, performanceMetrics);
                    break;
                case 'learning_outcome':
                    predictions = await predictLearningOutcome(sessions, performanceMetrics);
                    break;
                case 'study_optimization':
                    predictions = await predictStudyOptimization(sessions, performanceMetrics);
                    break;
                default:
                    predictions = await predictExamSuccess(sessions, performanceMetrics);
            }
        } catch (predictionError) {
            console.error('Error generating predictions:', predictionError);
            // Calculate basic predictions from actual data if available
            if (sessions.length > 0) {
                const avgAccuracy = sessions.reduce((sum, s) => sum + (s.performance?.accuracy || 0), 0) / sessions.length;
                const recentSessions = sessions.slice(0, Math.min(10, sessions.length));
                const recentAccuracy = recentSessions.reduce((sum, s) => sum + (s.performance?.accuracy || 0), 0) / recentSessions.length;
                const consistencyScore = calculateConsistencyScore(sessions);
                
                // Calculate success probability based on actual metrics
                const baseProbability = Math.min(95, Math.max(30, avgAccuracy));
                const consistencyBonus = consistencyScore > 70 ? 10 : 0;
                const improvementBonus = recentAccuracy > avgAccuracy ? 5 : 0;
                const successProbability = Math.min(95, baseProbability + consistencyBonus + improvementBonus);
                
                predictions = {
                    successProbability: Math.round(successProbability),
                    confidence: Math.min(0.9, 0.5 + (sessions.length / 50) * 0.4), // Increases with more data
                    keyFactors: [
                        `Average accuracy: ${Math.round(avgAccuracy)}%`,
                        sessions.length >= 10 ? 'Sufficient study data' : 'Building study habits',
                        consistencyScore > 70 ? 'Consistent study schedule' : 'Developing consistency'
                    ],
                    riskFactors: [
                        avgAccuracy < 70 ? 'Below average performance' : null,
                        consistencyScore < 50 ? 'Inconsistent study schedule' : null,
                        sessions.length < 10 ? 'Limited study history' : null
                    ].filter(Boolean),
                    recommendedActions: [
                        avgAccuracy < 70 ? 'Focus on improving accuracy through practice' : 'Maintain current performance level',
                        consistencyScore < 50 ? 'Establish a regular study schedule' : 'Continue maintaining consistency',
                        sessions.length < 10 ? 'Continue logging study sessions to improve predictions' : 'Review weak areas identified in sessions'
                    ].filter(Boolean)
                };
            } else {
                // Return default predictions only if no data
                predictions = {
                    successProbability: 0,
                    confidence: 0,
                    keyFactors: [],
                    riskFactors: ['No study data available'],
                    recommendedActions: ['Start logging study sessions to generate predictions']
                };
            }
        }

        res.status(200).json({
            success: true,
            data: {
                predictionType,
                predictions
            }
        });
    } catch (error) {
        console.error('Error getting predictive analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get predictive analytics',
            error: error.message
        });
    }
};

// Generate Analytics Report
export const generateAnalyticsReport = async (req, res) => {
    try {
        const { userId } = req.body;
        const { reportType = 'weekly', startDate, endDate } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'UserId is required'
            });
        }

        // Calculate time range
        const now = new Date();
        let start, end;

        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            switch (reportType) {
                case 'daily':
                    start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    end = now;
                    break;
                case 'weekly':
                    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    end = now;
                    break;
                case 'monthly':
                    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    end = now;
                    break;
                default:
                    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    end = now;
            }
        }

        // Get data for the report
        let sessions = [];
        try {
            const studySessions = await StudySession.find({
                userId,
                date: { $gte: start, $lte: end }
            });
            
            // Convert StudySession to LearningSession format
            sessions = studySessions.map(session => ({
                userId: session.userId,
                sessionId: session._id.toString(),
                subject: session.subject,
                topic: session.subject,
                startTime: session.date || session.createdAt,
                endTime: new Date(session.date || session.createdAt).getTime() + (session.duration * 60 * 1000),
                duration: session.duration,
                activities: [{
                    type: 'practicing',
                    duration: session.duration,
                    effectiveness: session.productivity || 5,
                    difficulty: 'medium'
                }],
                performance: {
                    accuracy: session.productivity ? (session.productivity * 10) : 70,
                    speed: 5,
                    comprehension: session.productivity || 5,
                    engagement: session.productivity || 5
                },
                aiInsights: {},
                metadata: {
                    notes: session.notes || ''
                }
            }));
        } catch (error) {
            console.error('Error fetching sessions for report:', error);
            sessions = [];
        }

        let goals = [];
        let performanceMetrics = null;
        
        try {
            goals = await LearningGoal.find({ userId }) || [];
        } catch (error) {
            console.error('Error fetching goals:', error);
            goals = [];
        }

        try {
            performanceMetrics = await PerformanceMetrics.findOne({ userId }).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error fetching performance metrics:', error);
            performanceMetrics = null;
        }

        // Generate comprehensive report with error handling
        let report;
        try {
            report = await generateComprehensiveReport({
                userId,
                reportType,
                period: { start, end },
                sessions,
                goals,
                performanceMetrics
            });
        } catch (error) {
            console.error('Error in generateComprehensiveReport:', error);
            // Return a basic report structure even if generation fails
            report = {
                summary: {
                    totalStudyTime: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
                    sessionsCompleted: sessions.length,
                    averagePerformance: sessions.length > 0 ? sessions.reduce((sum, s) => sum + (s.performance?.accuracy || 70), 0) / sessions.length : 0,
                    goalsAchieved: goals.filter(g => g.progress?.status === 'completed').length,
                    improvementRate: 0
                },
                insights: [],
                trends: [],
                predictions: []
            };
        }

        // Save the report
        let analyticsReport;
        try {
            analyticsReport = new AnalyticsReport({
                userId,
                reportType,
                period: { start, end },
                data: report
            });
            await analyticsReport.save();
        } catch (error) {
            console.error('Error saving report:', error);
            // Still return the report even if saving fails
        }

        res.status(200).json({
            success: true,
            data: {
                report,
                reportId: analyticsReport?._id || null
            }
        });
    } catch (error) {
        console.error('Error generating analytics report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate analytics report',
            error: error.message
        });
    }
};

// Helper Functions

const generateSessionInsights = async (activities, performance, subject, topic) => {
    try {
        const prompt = `Analyze this learning session and provide insights:
        
        Subject: ${subject}
        Topic: ${topic}
        Activities: ${JSON.stringify(activities)}
        Performance: ${JSON.stringify(performance)}
        
        Provide insights about:
        1. Learning style detected
        2. Attention span analysis
        3. Optimal study time
        4. Difficulty preference
        5. Recommended break frequency
        
        Return as JSON with these fields: learningStyle, attentionSpan, optimalStudyTime, difficultyPreference, recommendedBreakFrequency`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
            temperature: 0.7
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error generating session insights:', error);
        return {
            learningStyle: 'mixed',
            attentionSpan: 25,
            optimalStudyTime: 'morning',
            difficultyPreference: 'medium',
            recommendedBreakFrequency: 25
        };
    }
};

const calculatePerformanceMetrics = async (sessions, userId) => {
    const totalStudyTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageSessionDuration = totalStudyTime / sessions.length;
    const sessionsCompleted = sessions.length;

    const subjects = [...new Set(sessions.map(s => s.subject))];
    const topicsCovered = [...new Set(sessions.map(s => s.topic))].length;

    const averageAccuracy = sessions.reduce((sum, session) =>
        sum + (session.performance?.accuracy || 0), 0) / sessions.length;

    const averageSpeed = sessions.reduce((sum, session) =>
        sum + (session.performance?.speed || 0), 0) / sessions.length;

    const averageEngagement = sessions.reduce((sum, session) =>
        sum + (session.performance?.engagement || 0), 0) / sessions.length;

    const averageComprehension = sessions.reduce((sum, session) =>
        sum + (session.performance?.comprehension || 0), 0) / sessions.length;

    // Calculate improvement rate (simplified)
    const recentSessions = sessions.slice(0, Math.floor(sessions.length / 2));
    const olderSessions = sessions.slice(Math.floor(sessions.length / 2));

    const recentAvgAccuracy = recentSessions.reduce((sum, session) =>
        sum + (session.performance?.accuracy || 0), 0) / recentSessions.length;
    const olderAvgAccuracy = olderSessions.reduce((sum, session) =>
        sum + (session.performance?.accuracy || 0), 0) / olderSessions.length;

    const improvementRate = olderSessions.length > 0 ?
        ((recentAvgAccuracy - olderAvgAccuracy) / olderAvgAccuracy) * 100 : 0;

    return {
        totalStudyTime,
        averageSessionDuration,
        sessionsCompleted,
        topicsCovered,
        averageAccuracy,
        averageSpeed,
        improvementRate,
        averageEngagement,
        consistencyScore: calculateConsistencyScore(sessions),
        motivationLevel: averageEngagement,
        retentionRate: averageComprehension,
        applicationRate: averageAccuracy,
        problemSolvingScore: averageSpeed,
        learningVelocity: improvementRate,
        knowledgeGaps: await identifyKnowledgeGaps(sessions),
        strengths: await identifyStrengths(sessions),
        areasForImprovement: await identifyAreasForImprovement(sessions),
        recommendedFocus: await generateRecommendedFocus(sessions)
    };
};

const calculateConsistencyScore = (sessions) => {
    if (sessions.length < 2) return 0;

    const dailySessions = {};
    sessions.forEach(session => {
        const date = session.startTime.toDateString();
        dailySessions[date] = (dailySessions[date] || 0) + 1;
    });

    const sessionCounts = Object.values(dailySessions);
    const mean = sessionCounts.reduce((sum, count) => sum + count, 0) / sessionCounts.length;
    const variance = sessionCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / sessionCounts.length;
    const standardDeviation = Math.sqrt(variance);

    return Math.max(0, 100 - (standardDeviation / mean) * 100);
};

const identifyKnowledgeGaps = async (sessions) => {
    // Simple implementation - in a real system, this would use more sophisticated analysis
    const lowPerformanceSessions = sessions.filter(s =>
        s.performance?.accuracy < 70 || s.performance?.comprehension < 5
    );

    const topics = [...new Set(lowPerformanceSessions.map(s => s.topic))];
    return topics.slice(0, 5); // Return top 5 knowledge gaps
};

const identifyStrengths = async (sessions) => {
    const highPerformanceSessions = sessions.filter(s =>
        s.performance?.accuracy >= 85 && s.performance?.comprehension >= 7
    );

    const subjects = [...new Set(highPerformanceSessions.map(s => s.subject))];
    return subjects.slice(0, 3); // Return top 3 strengths
};

const identifyAreasForImprovement = async (sessions) => {
    const mediumPerformanceSessions = sessions.filter(s =>
        s.performance?.accuracy >= 50 && s.performance?.accuracy < 85
    );

    const topics = [...new Set(mediumPerformanceSessions.map(s => s.topic))];
    return topics.slice(0, 5); // Return top 5 areas for improvement
};

const generateRecommendedFocus = async (sessions) => {
    // Simple implementation - prioritize topics with low performance
    const lowPerformanceSessions = sessions.filter(s =>
        s.performance?.accuracy < 70
    );

    const topicFrequency = {};
    lowPerformanceSessions.forEach(session => {
        topicFrequency[session.topic] = (topicFrequency[session.topic] || 0) + 1;
    });

    return Object.entries(topicFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([topic]) => topic);
};

const generatePerformanceInsights = async (metrics, sessions) => {
    try {
        const prompt = `Analyze these learning performance metrics and provide insights:
        
        Metrics: ${JSON.stringify(metrics)}
        Total Sessions: ${sessions.length}
        
        Provide insights about:
        1. Overall performance trends
        2. Learning efficiency
        3. Areas of strength and weakness
        4. Recommendations for improvement
        5. Study habit analysis
        
        Return as JSON with these fields: overallTrend, efficiency, strengths, weaknesses, recommendations, studyHabits`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 800,
            temperature: 0.7
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error generating performance insights:', error);
        return {
            overallTrend: 'stable',
            efficiency: 'moderate',
            strengths: ['consistent study habits'],
            weaknesses: ['needs improvement in accuracy'],
            recommendations: ['focus on practice problems'],
            studyHabits: ['regular but could be more efficient']
        };
    }
};

const generatePerformancePredictions = async (metrics, sessions) => {
    try {
        const prompt = `Based on these learning metrics, predict future performance:
        
        Current Metrics: ${JSON.stringify(metrics)}
        Historical Sessions: ${sessions.length}
        
        Predict:
        1. Next week's performance score
        2. Exam success probability (0-100%)
        3. Recommended study time for next week
        4. Risk factors to watch
        5. Opportunities for improvement
        
        Return as JSON with these fields: nextWeekPerformance, examSuccessProbability, recommendedStudyTime, riskFactors, opportunities`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
            temperature: 0.7
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error generating performance predictions:', error);
        return {
            nextWeekPerformance: 75,
            examSuccessProbability: 70,
            recommendedStudyTime: 120,
            riskFactors: ['inconsistent study schedule'],
            opportunities: ['focus on weak subjects']
        };
    }
};

const updateRealTimeAnalytics = async (userId, data) => {
    try {
        const realTimeData = new RealTimeAnalytics({
            userId,
            ...data
        });
        await realTimeData.save();
    } catch (error) {
        console.error('Error updating real-time analytics:', error);
    }
};

const generateDashboardData = async (data) => {
    const { sessions = [], performanceMetrics = null, learningPattern = null, goals = [], realTimeData = null, timeRange } = data;

    // Ensure sessions is an array
    const safeSessions = Array.isArray(sessions) ? sessions : [];

    // Calculate basic stats
    const totalStudyTime = safeSessions.reduce((sum, session) => {
        return sum + (session?.duration || 0);
    }, 0);
    const averageSessionDuration = safeSessions.length > 0 ? totalStudyTime / safeSessions.length : 0;
    const sessionsCompleted = safeSessions.length;

    // Calculate performance trends
    const weeklyProgress = calculateWeeklyProgress(safeSessions, timeRange);
    const subjectPerformance = calculateSubjectPerformance(safeSessions);

    // Generate AI insights (with error handling)
    let aiInsights = [];
    let recommendations = [];
    
    try {
        aiInsights = await generateDashboardInsights(safeSessions, performanceMetrics, learningPattern);
        recommendations = await generateDashboardRecommendations(safeSessions, performanceMetrics, learningPattern);
    } catch (error) {
        console.error('Error generating dashboard insights:', error);
        aiInsights = [];
        recommendations = [];
    }

    // Ensure arrays
    if (!Array.isArray(aiInsights)) {
        aiInsights = [];
    }
    if (!Array.isArray(recommendations)) {
        recommendations = [];
    }

    // Safely calculate goals achieved
    const safeGoals = Array.isArray(goals) ? goals : [];
    const goalsAchieved = safeGoals.filter(g => g?.progress?.status === 'completed').length;

    return {
        overview: {
            totalStudyTime,
            averageSessionDuration,
            sessionsCompleted,
            currentStreak: calculateCurrentStreak(safeSessions),
            goalsAchieved,
            totalGoals: safeGoals.length
        },
        performance: {
            averageAccuracy: performanceMetrics?.metrics?.averageAccuracy || 0,
            averageEngagement: performanceMetrics?.metrics?.averageEngagement || 0,
            improvementRate: performanceMetrics?.metrics?.improvementRate || 0,
            consistencyScore: performanceMetrics?.metrics?.consistencyScore || 0
        },
        trends: {
            weeklyProgress,
            subjectPerformance
        },
        realTime: realTimeData || null,
        insights: aiInsights,
        recommendations
    };
};

const calculateWeeklyProgress = (sessions, timeRange) => {
    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
        return [];
    }

    if (!timeRange || !timeRange.start || !timeRange.end) {
        return [];
    }

    const weeklyData = [];
    const startDate = new Date(timeRange.start);
    const endDate = new Date(timeRange.end);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const daySessions = sessions.filter(session => {
            if (!session || !session.startTime) return false;
            return new Date(session.startTime).toDateString() === d.toDateString();
        });

        const dayStudyTime = daySessions.reduce((sum, session) => sum + (session?.duration || 0), 0);
        const dayAccuracy = daySessions.length > 0 ?
            daySessions.reduce((sum, session) => sum + (session?.performance?.accuracy || 0), 0) / daySessions.length : 0;

        weeklyData.push({
            date: d.toISOString().split('T')[0],
            studyTime: dayStudyTime,
            accuracy: dayAccuracy,
            sessions: daySessions.length
        });
    }

    return weeklyData;
};

const calculateSubjectPerformance = (sessions) => {
    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
        return [];
    }

    const subjectData = {};

    sessions.forEach(session => {
        if (!session || !session.subject) return;
        
        if (!subjectData[session.subject]) {
            subjectData[session.subject] = {
                studyTime: 0,
                accuracy: 0,
                sessions: 0
            };
        }

        subjectData[session.subject].studyTime += session.duration || 0;
        subjectData[session.subject].accuracy += session.performance?.accuracy || 0;
        subjectData[session.subject].sessions += 1;
    });

    return Object.entries(subjectData).map(([subject, data]) => ({
        subject,
        studyTime: data.studyTime,
        averageAccuracy: data.sessions > 0 ? data.accuracy / data.sessions : 0,
        sessions: data.sessions
    }));
};

const calculateCurrentStreak = (sessions) => {
    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) return 0;

    const sortedSessions = sessions
        .filter(s => s && s.startTime)
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    
    if (sortedSessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sortedSessions) {
        const sessionDate = new Date(session.startTime);
        sessionDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === streak) {
            streak++;
            currentDate = sessionDate;
        } else {
            break;
        }
    }

    return streak;
};

const generateDashboardInsights = async (sessions, performanceMetrics, learningPattern) => {
    try {
        const prompt = `Analyze this learning dashboard data and provide key insights:
        
        Sessions: ${sessions.length}
        Performance: ${JSON.stringify(performanceMetrics?.metrics || {})}
        Learning Pattern: ${JSON.stringify(learningPattern || {})}
        
        Provide 3-5 key insights about:
        1. Learning progress and trends
        2. Performance patterns
        3. Study habits effectiveness
        4. Areas needing attention
        5. Opportunities for improvement
        
        Return as JSON array with objects containing: title, description, type, priority`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 600,
            temperature: 0.7
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error generating dashboard insights:', error);

        // Check if it's a quota error
        if (error.code === 'insufficient_quota' || error.status === 429) {
            console.log('OpenAI quota exceeded, using fallback insights');
            return [
                {
                    title: "Learning Progress",
                    description: "Your study habits are showing positive trends based on available data",
                    type: "positive",
                    priority: "medium"
                },
                {
                    title: "Study Consistency",
                    description: "Maintain regular study sessions for better learning outcomes",
                    type: "recommendation",
                    priority: "high"
                },
                {
                    title: "Performance Analysis",
                    description: "Track your progress regularly to identify areas for improvement",
                    type: "info",
                    priority: "medium"
                }
            ];
        }

        return [
            {
                title: "Learning Progress",
                description: "Your study habits are showing positive trends",
                type: "positive",
                priority: "medium"
            }
        ];
    }
};

const generateDashboardRecommendations = async (sessions, performanceMetrics, learningPattern) => {
    try {
        const prompt = `Based on this learning data, provide personalized recommendations:
        
        Sessions: ${sessions.length}
        Performance: ${JSON.stringify(performanceMetrics?.metrics || {})}
        Learning Pattern: ${JSON.stringify(learningPattern || {})}
        
        Provide 3-5 actionable recommendations for:
        1. Study schedule optimization
        2. Learning method improvements
        3. Focus areas
        4. Goal setting
        5. Performance enhancement
        
        Return as JSON array with objects containing: title, description, action, priority`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 600,
            temperature: 0.7
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error generating dashboard recommendations:', error);

        // Check if it's a quota error
        if (error.code === 'insufficient_quota' || error.status === 429) {
            console.log('OpenAI quota exceeded, using fallback recommendations');
            return [
                {
                    title: "Study Schedule",
                    description: "Try studying at consistent times each day for better retention",
                    action: "Set daily study reminders",
                    priority: "high"
                },
                {
                    title: "Focus Areas",
                    description: "Identify your weakest subjects and allocate more study time to them",
                    action: "Review past performance and create a study plan",
                    priority: "high"
                },
                {
                    title: "Learning Methods",
                    description: "Experiment with different study techniques to find what works best",
                    action: "Try active recall, spaced repetition, and visual learning",
                    priority: "medium"
                }
            ];
        }

        return [
            {
                title: "Study Schedule",
                description: "Try studying at consistent times each day",
                action: "Set daily study reminders",
                priority: "high"
            }
        ];
    }
};

const generateAIInsights = async (sessions, userId, subject) => {
    try {
        const prompt = `Analyze these learning sessions and provide AI-powered insights:
        
        Sessions: ${JSON.stringify(sessions.slice(0, 10))} // Limit to recent sessions
        Subject Filter: ${subject || 'all'}
        
        Provide insights about:
        1. Learning patterns and trends
        2. Performance analysis
        3. Study effectiveness
        4. Knowledge gaps
        5. Learning style identification
        
        Return as JSON array with objects containing: type, title, description, impact, confidence`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 800,
            temperature: 0.7
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error generating AI insights:', error);

        // Check if it's a quota error
        if (error.code === 'insufficient_quota' || error.status === 429) {
            console.log('OpenAI quota exceeded, using fallback AI insights');
            return [
                {
                    type: "pattern",
                    title: "Learning Pattern Detected",
                    description: "You show consistent study habits with room for optimization based on available data",
                    impact: "medium",
                    confidence: 0.7
                },
                {
                    type: "performance",
                    title: "Performance Analysis",
                    description: "Regular study sessions are key to improving your learning outcomes",
                    impact: "high",
                    confidence: 0.8
                }
            ];
        }

        return [
            {
                type: "pattern",
                title: "Learning Pattern Detected",
                description: "You show consistent study habits with room for optimization",
                impact: "medium",
                confidence: 0.7
            }
        ];
    }
};

const generatePersonalizedRecommendations = async (sessions, userId, subject) => {
    try {
        const prompt = `Based on these learning sessions, provide personalized recommendations:
        
        Sessions: ${JSON.stringify(sessions.slice(0, 10))}
        Subject Filter: ${subject || 'all'}
        
        Provide recommendations for:
        1. Study schedule optimization
        2. Learning method improvements
        3. Focus areas and priorities
        4. Goal setting and tracking
        5. Performance enhancement strategies
        
        Return as JSON array with objects containing: category, title, description, action, priority, expectedImpact`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 800,
            temperature: 0.7
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error generating personalized recommendations:', error);
        return [
            {
                category: "schedule",
                title: "Optimize Study Schedule",
                description: "Study at your peak performance times",
                action: "Track your energy levels and adjust study times",
                priority: "high",
                expectedImpact: "medium"
            }
        ];
    }
};

const predictExamSuccess = async (sessions, performanceMetrics) => {
    try {
        const prompt = `Predict exam success probability based on learning data:
        
        Recent Sessions: ${JSON.stringify(sessions.slice(0, 20))}
        Performance Metrics: ${JSON.stringify(performanceMetrics?.metrics || {})}
        
        Predict:
        1. Exam success probability (0-100%)
        2. Confidence level in prediction
        3. Key factors influencing success
        4. Risk factors to address
        5. Recommended actions to improve success probability
        
        Return as JSON with these fields: successProbability, confidence, keyFactors, riskFactors, recommendedActions`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 600,
            temperature: 0.7
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error predicting exam success:', error);
        return {
            successProbability: 70,
            confidence: 0.6,
            keyFactors: ['consistent study habits', 'good comprehension'],
            riskFactors: ['inconsistent performance'],
            recommendedActions: ['increase study time', 'focus on weak areas']
        };
    }
};

const predictLearningOutcome = async (sessions, performanceMetrics) => {
    try {
        const prompt = `Predict learning outcomes based on current progress:
        
        Sessions: ${JSON.stringify(sessions.slice(0, 20))}
        Performance: ${JSON.stringify(performanceMetrics?.metrics || {})}
        
        Predict:
        1. Learning velocity (rate of improvement)
        2. Knowledge retention rate
        3. Skill development trajectory
        4. Time to mastery for current topics
        5. Recommended learning path adjustments
        
        Return as JSON with these fields: learningVelocity, retentionRate, skillTrajectory, timeToMastery, pathAdjustments`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 600,
            temperature: 0.7
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error predicting learning outcome:', error);
        return {
            learningVelocity: 'moderate',
            retentionRate: 75,
            skillTrajectory: 'positive',
            timeToMastery: '4-6 weeks',
            pathAdjustments: ['focus on practice', 'increase review frequency']
        };
    }
};

const predictStudyOptimization = async (sessions, performanceMetrics) => {
    try {
        const prompt = `Recommend study optimization strategies:
        
        Sessions: ${JSON.stringify(sessions.slice(0, 20))}
        Performance: ${JSON.stringify(performanceMetrics?.metrics || {})}
        
        Recommend:
        1. Optimal study schedule
        2. Best learning methods for this student
        3. Ideal session duration and frequency
        4. Break patterns and timing
        5. Environmental factors to optimize
        
        Return as JSON with these fields: optimalSchedule, learningMethods, sessionDuration, breakPatterns, environmentalFactors`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 600,
            temperature: 0.7
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error predicting study optimization:', error);
        return {
            optimalSchedule: 'morning sessions, 2-3 hours daily',
            learningMethods: ['active recall', 'spaced repetition'],
            sessionDuration: '45-60 minutes',
            breakPatterns: '5-10 minute breaks every 25 minutes',
            environmentalFactors: ['quiet environment', 'good lighting']
        };
    }
};

const generateComprehensiveReport = async (data) => {
    const { userId, reportType, period, sessions, goals, performanceMetrics } = data;

    // Ensure arrays
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    const safeGoals = Array.isArray(goals) ? goals : [];

    // Calculate summary statistics
    const totalStudyTime = safeSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const sessionsCompleted = safeSessions.length;
    const averagePerformance = performanceMetrics?.metrics?.averageAccuracy || 0;
    const goalsAchieved = safeGoals.filter(g => g?.progress?.status === 'completed').length;
    const improvementRate = performanceMetrics?.metrics?.improvementRate || 0;

    // Generate AI insights with error handling
    let insights = [];
    try {
        insights = await generateReportInsights(safeSessions, performanceMetrics, safeGoals);
    } catch (error) {
        console.error('Error generating insights:', error);
        insights = [];
    }

    // Calculate trends with error handling
    let trends = [];
    try {
        trends = calculateReportTrends(safeSessions, period);
    } catch (error) {
        console.error('Error calculating trends:', error);
        trends = [];
    }

    // Generate predictions with error handling
    let predictions = [];
    try {
        predictions = await generateReportPredictions(safeSessions, performanceMetrics);
    } catch (error) {
        console.error('Error generating predictions:', error);
        predictions = [];
    }

    return {
        summary: {
            totalStudyTime,
            sessionsCompleted,
            averagePerformance,
            goalsAchieved,
            improvementRate
        },
        insights,
        trends,
        predictions
    };
};

const generateReportInsights = async (sessions, performanceMetrics, goals) => {
    try {
        const prompt = `Generate comprehensive learning report insights:
        
        Sessions: ${sessions.length}
        Performance: ${JSON.stringify(performanceMetrics?.metrics || {})}
        Goals: ${goals.length}
        
        Provide insights about:
        1. Overall learning progress
        2. Performance trends and patterns
        3. Goal achievement analysis
        4. Study habit effectiveness
        5. Areas of strength and improvement
        6. Recommendations for future learning
        
        Return as JSON array with objects containing: type, title, description, impact, recommendation`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000,
            temperature: 0.7
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error generating report insights:', error);
        return [
            {
                type: "progress",
                title: "Learning Progress",
                description: "Steady improvement in study habits and performance",
                impact: "positive",
                recommendation: "Continue current study approach"
            }
        ];
    }
};

const calculateReportTrends = (sessions, period) => {
    try {
        const safeSessions = Array.isArray(sessions) ? sessions : [];
        const dailyData = {};
        const startDate = new Date(period.start);
        const endDate = new Date(period.end);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const daySessions = safeSessions.filter(session => {
                if (!session.startTime) return false;
                const sessionDate = session.startTime instanceof Date ? session.startTime : new Date(session.startTime);
                return sessionDate.toDateString() === d.toDateString();
            });

            const dayStudyTime = daySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
            const dayAccuracy = daySessions.length > 0 ?
                daySessions.reduce((sum, session) => sum + (session.performance?.accuracy || 0), 0) / daySessions.length : 0;

            dailyData[d.toISOString().split('T')[0]] = {
                studyTime: dayStudyTime,
                accuracy: dayAccuracy,
                sessions: daySessions.length
            };
        }

        // Calculate trends
        const dataPoints = Object.values(dailyData);
        if (dataPoints.length === 0) {
            return [];
        }

        const studyTimeTrend = calculateTrend(dataPoints.map(d => d.studyTime));
        const accuracyTrend = calculateTrend(dataPoints.map(d => d.accuracy));

        return [
            {
                metric: 'study_time',
                trend: studyTimeTrend,
                value: dataPoints.reduce((sum, d) => sum + d.studyTime, 0),
                change: studyTimeTrend === 'increasing' ? 15 : studyTimeTrend === 'decreasing' ? -10 : 0
            },
            {
                metric: 'accuracy',
                trend: accuracyTrend,
                value: dataPoints.length > 0 ? dataPoints.reduce((sum, d) => sum + d.accuracy, 0) / dataPoints.length : 0,
                change: accuracyTrend === 'increasing' ? 5 : accuracyTrend === 'decreasing' ? -3 : 0
            }
        ];
    } catch (error) {
        console.error('Error in calculateReportTrends:', error);
        return [];
    }
};

const calculateTrend = (values) => {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
};

const generateReportPredictions = async (sessions, performanceMetrics) => {
    try {
        const prompt = `Generate learning predictions for the next period:
        
        Recent Sessions: ${JSON.stringify(sessions.slice(0, 20))}
        Performance: ${JSON.stringify(performanceMetrics?.metrics || {})}
        
        Predict:
        1. Next week's performance score
        2. Study time recommendations
        3. Goal achievement probability
        4. Risk factors to monitor
        5. Opportunities for improvement
        
        Return as JSON array with objects containing: metric, predictedValue, confidence, timeframe`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 600,
            temperature: 0.7
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error generating report predictions:', error);
        return [
            {
                metric: 'performance_score',
                predictedValue: 75,
                confidence: 0.7,
                timeframe: 'next_week'
            }
        ];
    }
};
