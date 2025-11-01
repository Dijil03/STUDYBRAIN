import mongoose from 'mongoose';

// Learning Session Analytics
const LearningSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    activities: [{
        type: {
            type: String,
            enum: ['reading', 'watching', 'practicing', 'testing', 'discussing', 'researching'],
            required: true
        },
        duration: Number,
        effectiveness: {
            type: Number,
            min: 1,
            max: 10
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        }
    }],
    performance: {
        accuracy: {
            type: Number,
            min: 0,
            max: 100
        },
        speed: {
            type: Number, // questions per minute
            default: 0
        },
        comprehension: {
            type: Number,
            min: 1,
            max: 10
        },
        engagement: {
            type: Number,
            min: 1,
            max: 10
        }
    },
    aiInsights: {
        learningStyle: {
            type: String,
            enum: ['visual', 'auditory', 'kinesthetic', 'reading', 'mixed'],
            default: 'mixed'
        },
        attentionSpan: Number, // in minutes
        optimalStudyTime: String, // time of day
        difficultyPreference: String,
        recommendedBreakFrequency: Number
    },
    metadata: {
        device: String,
        location: String,
        mood: String,
        energyLevel: Number
    }
}, {
    timestamps: true
});

// Performance Metrics
const PerformanceMetricsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    timeRange: {
        start: Date,
        end: Date
    },
    metrics: {
        // Learning Progress
        totalStudyTime: Number, // in minutes
        averageSessionDuration: Number,
        sessionsCompleted: Number,
        topicsCovered: Number,
        
        // Performance Scores
        averageAccuracy: Number,
        averageSpeed: Number,
        improvementRate: Number, // percentage improvement over time
        
        // Engagement Metrics
        averageEngagement: Number,
        consistencyScore: Number, // how consistent their study habits are
        motivationLevel: Number,
        
        // Learning Efficiency
        retentionRate: Number, // how well they retain information
        applicationRate: Number, // how well they apply knowledge
        problemSolvingScore: Number,
        
        // AI-Generated Insights
        learningVelocity: Number, // how fast they learn new concepts
        knowledgeGaps: [String],
        strengths: [String],
        areasForImprovement: [String],
        recommendedFocus: [String]
    },
    trends: {
        weeklyProgress: [{
            week: String,
            score: Number,
            studyTime: Number
        }],
        monthlyProgress: [{
            month: String,
            score: Number,
            studyTime: Number
        }],
        subjectComparison: [{
            subject: String,
            performance: Number,
            timeSpent: Number
        }]
    },
    predictions: {
        nextWeekPerformance: Number,
        examSuccessProbability: Number,
        recommendedStudyTime: Number,
        riskFactors: [String],
        opportunities: [String]
    }
}, {
    timestamps: true
});

// Learning Analytics Patterns
const LearningAnalyticsPatternSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patterns: {
        // Study Habits
        preferredStudyTimes: [String], // times of day
        optimalSessionLength: Number,
        breakFrequency: Number,
        studyDays: [String], // days of week
        
        // Learning Preferences
        preferredContentTypes: [String],
        preferredDifficulty: String,
        learningPace: String, // slow, medium, fast
        revisionFrequency: String,
        
        // Performance Patterns
        peakPerformanceTimes: [String],
        lowPerformanceTimes: [String],
        motivationCycles: [{
            period: String,
            level: Number
        }],
        
        // Subject-Specific Patterns
        subjectPreferences: [{
            subject: String,
            performance: Number,
            timeSpent: Number,
            difficulty: String
        }]
    },
    aiAnalysis: {
        learningStyle: String,
        cognitiveLoad: Number,
        attentionPatterns: [String],
        memoryRetention: Number,
        problemSolvingApproach: String,
        collaborationPreference: String
    },
    recommendations: {
        studySchedule: [{
            day: String,
            time: String,
            subject: String,
            duration: Number
        }],
        contentRecommendations: [{
            type: String,
            subject: String,
            difficulty: String,
            reason: String
        }],
        improvementSuggestions: [String],
        goalRecommendations: [String]
    }
}, {
    timestamps: true
});

// Learning Goals and Achievements
const LearningGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    goal: {
        title: String,
        description: String,
        subject: String,
        targetDate: Date,
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
        },
        type: {
            type: String,
            enum: ['performance', 'knowledge', 'skill', 'habit', 'exam'],
            required: true
        }
    },
    progress: {
        currentValue: Number,
        targetValue: Number,
        percentage: Number,
        status: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed', 'paused', 'cancelled'],
            default: 'not_started'
        },
        milestones: [{
            title: String,
            targetDate: Date,
            completed: Boolean,
            completedDate: Date
        }]
    },
    aiInsights: {
        difficulty: String,
        estimatedTimeToComplete: Number, // in days
        successProbability: Number,
        recommendedActions: [String],
        riskFactors: [String],
        dependencies: [String]
    }
}, {
    timestamps: true
});

// Real-time Analytics
const RealTimeAnalyticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    currentActivity: {
        type: String,
        enum: ['studying', 'testing', 'reviewing', 'planning', 'idle'],
        default: 'idle'
    },
    currentSubject: String,
    currentTopic: String,
    sessionDuration: Number,
    focusLevel: {
        type: Number,
        min: 1,
        max: 10
    },
    productivity: {
        type: Number,
        min: 1,
        max: 10
    },
    mood: {
        type: String,
        enum: ['excited', 'focused', 'neutral', 'tired', 'frustrated', 'confident']
    },
    energyLevel: {
        type: Number,
        min: 1,
        max: 10
    },
    aiRecommendations: [{
        type: String,
        message: String,
        priority: String,
        action: String
    }]
}, {
    timestamps: true
});

// Analytics Reports
const AnalyticsReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportType: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'custom'],
        required: true
    },
    period: {
        start: Date,
        end: Date
    },
    data: {
        summary: {
            totalStudyTime: Number,
            sessionsCompleted: Number,
            averagePerformance: Number,
            goalsAchieved: Number,
            improvementRate: Number
        },
        insights: [{
            type: String,
            title: String,
            description: String,
            impact: String,
            recommendation: String
        }],
        trends: [{
            metric: String,
            trend: String, // increasing, decreasing, stable
            value: Number,
            change: Number
        }],
        predictions: [{
            metric: String,
            predictedValue: Number,
            confidence: Number,
            timeframe: String
        }]
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    aiGenerated: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export const LearningSession = mongoose.model('LearningSession', LearningSessionSchema);
export const PerformanceMetrics = mongoose.model('PerformanceMetrics', PerformanceMetricsSchema);
export const LearningAnalyticsPattern = mongoose.model('LearningAnalyticsPattern', LearningAnalyticsPatternSchema);
export const LearningGoal = mongoose.model('LearningGoal', LearningGoalSchema);
export const RealTimeAnalytics = mongoose.model('RealTimeAnalytics', RealTimeAnalyticsSchema);
export const AnalyticsReport = mongoose.model('AnalyticsReport', AnalyticsReportSchema);
