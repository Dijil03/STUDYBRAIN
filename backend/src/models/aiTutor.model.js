import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant', 'system'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        messageType: {
            type: String,
            enum: ['text', 'voice', 'image', 'code', 'explanation', 'question'],
            default: 'text'
        },
        metadata: {
            subject: String,
            difficulty: {
                type: String,
                enum: ['beginner', 'intermediate', 'advanced'],
                default: 'intermediate'
            },
            topic: String,
            hasVisual: Boolean,
            hasCode: Boolean,
            hasExplanation: Boolean
        }
    }],
    context: {
        currentSubject: String,
        currentTopic: String,
        difficultyLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'intermediate'
        },
        learningStyle: {
            type: String,
            enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
            default: 'visual'
        },
        sessionGoals: [String],
        previousTopics: [String]
    },
    sessionStats: {
        totalMessages: { type: Number, default: 0 },
        questionsAsked: { type: Number, default: 0 },
        explanationsGiven: { type: Number, default: 0 },
        problemsSolved: { type: Number, default: 0 },
        sessionDuration: { type: Number, default: 0 }, // in minutes
        satisfactionRating: { type: Number, min: 1, max: 5 }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const learningPatternSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    userName: {
        type: String,
        required: true
    },
    // Learning preferences and patterns
    preferences: {
        preferredSubjects: [String],
        difficultyPreference: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'intermediate'
        },
        learningStyle: {
            type: String,
            enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
            default: 'visual'
        },
        preferredExplanationStyle: {
            type: String,
            enum: ['detailed', 'concise', 'step-by-step', 'conceptual'],
            default: 'step-by-step'
        },
        preferredTimeOfDay: {
            type: String,
            enum: ['morning', 'afternoon', 'evening', 'night'],
            default: 'afternoon'
        }
    },
    // Performance tracking
    performance: {
        totalSessions: { type: Number, default: 0 },
        totalQuestions: { type: Number, default: 0 },
        averageSessionDuration: { type: Number, default: 0 },
        averageSatisfactionRating: { type: Number, default: 0 },
        strongestSubjects: [String],
        weakestSubjects: [String],
        improvementAreas: [String]
    },
    // Subject-specific data
    subjectMastery: [{
        subject: String,
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            default: 'beginner'
        },
        topicsCovered: [String],
        lastStudied: Date,
        totalQuestions: { type: Number, default: 0 },
        correctAnswers: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 }
    }],
    // Learning goals and progress
    goals: [{
        goal: String,
        subject: String,
        targetDate: Date,
        progress: { type: Number, min: 0, max: 100, default: 0 },
        isCompleted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    // AI recommendations
    recommendations: [{
        type: {
            type: String,
            enum: ['study_topic', 'practice_problem', 'review_concept', 'advanced_topic', 'weakness_focus'],
            required: true
        },
        subject: String,
        topic: String,
        reason: String,
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
        isCompleted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    // Voice interaction preferences
    voiceSettings: {
        enabled: { type: Boolean, default: false },
        preferredVoice: String,
        speechRate: { type: Number, min: 0.5, max: 2.0, default: 1.0 },
        language: { type: String, default: 'en-US' }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const studyMaterialSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
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
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    materialType: {
        type: String,
        enum: ['summary', 'explanation', 'practice_questions', 'concept_map', 'flashcards', 'diagram'],
        required: true
    },
    generatedBy: {
        type: String,
        enum: ['ai', 'user', 'system'],
        default: 'ai'
    },
    metadata: {
        hasVisuals: Boolean,
        hasCode: Boolean,
        hasExamples: Boolean,
        estimatedReadTime: Number, // in minutes
        keyConcepts: [String],
        prerequisites: [String]
    },
    usage: {
        timesAccessed: { type: Number, default: 0 },
        lastAccessed: Date,
        rating: { type: Number, min: 1, max: 5 },
        feedback: String
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamps
conversationSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

learningPatternSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

studyMaterialSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Methods for conversation management
conversationSchema.methods.addMessage = function(role, content, messageType = 'text', metadata = {}) {
    this.messages.push({
        role,
        content,
        messageType,
        metadata,
        timestamp: new Date()
    });
    this.sessionStats.totalMessages += 1;
    
    if (role === 'user' && messageType === 'question') {
        this.sessionStats.questionsAsked += 1;
    }
    
    if (role === 'assistant' && messageType === 'explanation') {
        this.sessionStats.explanationsGiven += 1;
    }
};

conversationSchema.methods.endSession = function(rating = null) {
    this.isActive = false;
    if (rating) {
        this.sessionStats.satisfactionRating = rating;
    }
    this.sessionStats.sessionDuration = Math.floor((new Date() - this.createdAt) / 60000); // in minutes
};

// Methods for learning pattern management
learningPatternSchema.methods.updateSubjectMastery = function(subject, isCorrect, topic) {
    let subjectData = this.subjectMastery.find(s => s.subject === subject);
    
    if (!subjectData) {
        subjectData = {
            subject,
            level: 'beginner',
            topicsCovered: [],
            lastStudied: new Date(),
            totalQuestions: 0,
            correctAnswers: 0,
            accuracy: 0
        };
        this.subjectMastery.push(subjectData);
    }
    
    subjectData.totalQuestions += 1;
    if (isCorrect) {
        subjectData.correctAnswers += 1;
    }
    subjectData.accuracy = (subjectData.correctAnswers / subjectData.totalQuestions) * 100;
    subjectData.lastStudied = new Date();
    
    if (topic && !subjectData.topicsCovered.includes(topic)) {
        subjectData.topicsCovered.push(topic);
    }
    
    // Update level based on accuracy
    if (subjectData.accuracy >= 90) {
        subjectData.level = 'expert';
    } else if (subjectData.accuracy >= 75) {
        subjectData.level = 'advanced';
    } else if (subjectData.accuracy >= 50) {
        subjectData.level = 'intermediate';
    } else {
        subjectData.level = 'beginner';
    }
};

learningPatternSchema.methods.addRecommendation = function(type, subject, topic, reason, priority = 'medium') {
    this.recommendations.push({
        type,
        subject,
        topic,
        reason,
        priority,
        createdAt: new Date()
    });
};

// Static methods
conversationSchema.statics.getUserConversations = function(userId, limit = 10) {
    return this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('sessionId createdAt sessionStats context');
};

learningPatternSchema.statics.getUserPattern = function(userId) {
    return this.findOne({ userId });
};

studyMaterialSchema.statics.getUserMaterials = function(userId, subject = null, materialType = null) {
    const query = { userId };
    if (subject) query.subject = subject;
    if (materialType) query.materialType = materialType;
    
    return this.find(query)
        .sort({ createdAt: -1 });
};

studyMaterialSchema.statics.getPublicMaterials = function(subject = null, materialType = null) {
    const query = { isPublic: true };
    if (subject) query.subject = subject;
    if (materialType) query.materialType = materialType;
    
    return this.find(query)
        .sort({ createdAt: -1 });
};

export const Conversation = mongoose.model('Conversation', conversationSchema);
export const LearningPattern = mongoose.model('LearningPattern', learningPatternSchema);
export const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);
