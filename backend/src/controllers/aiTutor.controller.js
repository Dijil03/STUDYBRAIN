import { Conversation, LearningPattern, StudyMaterial } from '../models/aiTutor.model.js';
import StudySession from "../models/studysession.model.js";
import { HfInference } from '@huggingface/inference';
import OpenAI from 'openai';
import crypto from 'crypto';

// Initialize AI models
const hf = new HfInference(process.env.HF_TOKEN);
const openai = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN,
});

// Create or get conversation session
const createSession = async (req, res) => {
    try {
        const { userId, userName, subject, topic, difficulty } = req.body;

        const sessionId = crypto.randomUUID();

        const conversation = new Conversation({
            userId,
            userName,
            sessionId,
            context: {
                currentSubject: subject || 'General',
                currentTopic: topic || 'General Help',
                difficultyLevel: difficulty || 'intermediate',
                learningStyle: 'visual',
                sessionGoals: [],
                previousTopics: []
            }
        });

        await conversation.save();

        res.status(200).json({
            success: true,
            data: {
                sessionId,
                conversation: conversation
            }
        });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create session',
            error: error.message
        });
    }
};

// Send message to AI tutor
const sendMessage = async (req, res) => {
    try {
        const { sessionId, message, messageType = 'text', subject, topic } = req.body;

        const conversation = await Conversation.findOne({ sessionId, isActive: true });
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Session not found or expired'
            });
        }

        // Add user message
        conversation.addMessage('user', message, messageType, {
            subject: subject || conversation.context.currentSubject,
            topic: topic || conversation.context.currentTopic
        });

        // Get AI response
        let aiResponse;
        try {
            aiResponse = await generateAIResponse(message, conversation.context, subject, topic);
        } catch (error) {
            console.error('Error generating AI response:', error);
            // Fallback response if AI generation fails
            aiResponse = {
                content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
                messageType: 'text',
                metadata: {
                    hasVisual: false,
                    hasCode: false,
                    hasExplanation: false
                }
            };
        }

        // Add AI response
        conversation.addMessage('assistant', aiResponse.content, aiResponse.messageType, aiResponse.metadata);

        await conversation.save();

        // Update learning pattern
        await updateLearningPattern(conversation.userId, message, aiResponse, subject, topic);

        res.status(200).json({
            success: true,
            data: {
                response: aiResponse.content,
                messageType: aiResponse.messageType,
                metadata: aiResponse.metadata,
                sessionStats: conversation.sessionStats
            }
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};

// Generate AI response using multiple models
const generateAIResponse = async (message, context, subject, topic) => {
    try {
        // Determine if this is a question, problem, or general query
        const isQuestion = message.includes('?') || message.toLowerCase().includes('how') ||
            message.toLowerCase().includes('what') || message.toLowerCase().includes('why');
        const isProblem = message.toLowerCase().includes('solve') || message.toLowerCase().includes('problem') ||
            message.toLowerCase().includes('calculate') || message.toLowerCase().includes('find');

        let response;
        let messageType = 'text';
        let metadata = {
            subject: subject || context.currentSubject,
            topic: topic || context.currentTopic,
            difficulty: context.difficultyLevel,
            hasVisual: false,
            hasCode: false,
            hasExplanation: false
        };

        // Always use OpenAI for consistent, high-quality responses
        response = await generateOpenAIResponse(message, context, subject, topic);

        if (isQuestion || isProblem) {
            messageType = 'explanation';
            metadata.hasExplanation = true;
        }

        // Check if response should include visuals or code
        if (response.includes('```') || response.includes('code') ||
            subject?.toLowerCase().includes('programming') || subject?.toLowerCase().includes('coding')) {
            metadata.hasCode = true;
        }

        if (response.includes('diagram') || response.includes('chart') ||
            response.includes('visual') || response.includes('graph')) {
            metadata.hasVisual = true;
        }

        return {
            content: response,
            messageType,
            metadata
        };
    } catch (error) {
        console.error('Error generating AI response:', error);
        return {
            content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
            messageType: 'text',
            metadata: {
                subject: subject || 'General',
                topic: topic || 'General Help',
                difficulty: 'intermediate',
                hasVisual: false,
                hasCode: false,
                hasExplanation: false
            }
        };
    }
};

// Generate response using OpenAI
const generateOpenAIResponse = async (message, context, subject, topic) => {
    try {
        const systemPrompt = `You are an AI tutor specializing in ${subject || 'general education'}. 
        You provide clear, step-by-step explanations and help students understand concepts thoroughly.
        Current topic: ${topic || 'general help'}
        Difficulty level: ${context.difficultyLevel}
        Learning style: ${context.learningStyle}
        
        Guidelines:
        - Provide detailed explanations with examples
        - Break down complex problems into steps
        - Use appropriate terminology for the difficulty level
        - Include visual descriptions when helpful
        - Encourage learning and understanding
        - Ask follow-up questions to check understanding`;

        const response = await openai.chat.completions.create({
            model: "deepseek-ai/DeepSeek-V3.2-Exp:novita",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            max_tokens: 1000,
            temperature: 0.7
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API error:', error);

        // Check if it's a quota error
        if (error.code === 'insufficient_quota' || error.status === 429) {
            console.log('OpenAI quota exceeded, using fallback response');
            return generateFallbackResponse(message, subject, topic);
        }

        throw error;
    }
};

// Generate response using Hugging Face (fallback)
const generateHFResponse = async (message, context) => {
    try {
        const response = await hf.textGeneration({
            model: "microsoft/DialoGPT-small", // Use smaller, more available model
            inputs: `Student: ${message}\nTutor:`,
            parameters: {
                max_new_tokens: 150,
                temperature: 0.7,
                return_full_text: false
            }
        });

        return response.generated_text;
    } catch (error) {
        console.error('Hugging Face API error:', error);
        // Fallback to a simple response if HF fails
        return "I'm here to help you learn! Could you please rephrase your question?";
    }
};

// Fallback response when OpenAI quota is exceeded
const generateFallbackResponse = (message, subject, topic) => {
    const responses = {
        mathematics: [
            "I'd love to help you with math! However, I'm currently experiencing technical difficulties. Please try asking a specific math question, and I'll do my best to provide guidance.",
            "Math is fascinating! Could you tell me what specific math concept you're working on? I can help explain it step by step.",
            "Let's work through this math problem together. What specific part are you finding challenging?"
        ],
        science: [
            "Science is amazing! I'm here to help explain scientific concepts. What specific topic in science would you like to explore?",
            "Let's dive into science! Could you tell me what you're studying? I can help break down complex concepts into simpler parts.",
            "Science questions are my favorite! What would you like to know about the natural world?"
        ],
        english: [
            "I'm excited to help you with English! Whether it's grammar, writing, or literature, I'm here to assist. What specific area would you like to work on?",
            "English language and literature are wonderful subjects! What specific topic or skill would you like to improve?",
            "Let's work on your English skills together! What would you like to focus on today?"
        ],
        general: [
            "I'm here to help you learn! What subject or topic would you like to explore today?",
            "Learning is a journey, and I'm excited to be your guide! What would you like to know more about?",
            "I'm ready to help you with your studies! What specific topic or question do you have?"
        ]
    };

    const subjectKey = subject?.toLowerCase() || 'general';
    const subjectResponses = responses[subjectKey] || responses.general;
    const randomResponse = subjectResponses[Math.floor(Math.random() * subjectResponses.length)];

    return randomResponse;
};

// Update learning pattern
const updateLearningPattern = async (userId, userMessage, aiResponse, subject, topic) => {
    try {
        let pattern = await LearningPattern.findOne({ userId });

        if (!pattern) {
            pattern = new LearningPattern({
                userId,
                userName: 'Student', // This should be passed from the request
                preferences: {
                    preferredSubjects: [subject || 'General'],
                    difficultyPreference: 'intermediate',
                    learningStyle: 'visual',
                    preferredExplanationStyle: 'step-by-step',
                    preferredTimeOfDay: 'afternoon'
                }
            });
        }

        // Update performance stats
        pattern.performance.totalSessions += 1;
        pattern.performance.totalQuestions += 1;

        // Update subject mastery
        if (subject) {
            pattern.updateSubjectMastery(subject, true, topic);
        }

        await pattern.save();
    } catch (error) {
        console.error('Error updating learning pattern:', error);
    }
};

// Get conversation history
const getConversationHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        const conversations = await Conversation.getUserConversations(userId, parseInt(limit));

        res.status(200).json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error('Error getting conversation history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get conversation history',
            error: error.message
        });
    }
};

// Get learning pattern
const getLearningPattern = async (req, res) => {
    try {
        const { userId } = req.params;

        const pattern = await LearningPattern.getUserPattern(userId);

        if (!pattern) {
            return res.status(404).json({
                success: false,
                message: 'Learning pattern not found'
            });
        }

        res.status(200).json({
            success: true,
            data: pattern
        });
    } catch (error) {
        console.error('Error getting learning pattern:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get learning pattern',
            error: error.message
        });
    }
};

// Generate study materials
const generateStudyMaterial = async (req, res) => {
    try {
        const { userId, subject, topic, difficulty, materialType } = req.body;

        const prompt = `Create a comprehensive ${materialType} about ${topic} in ${subject} for ${difficulty} level students. 
        Include key concepts, examples, and explanations.`;

        const response = await openai.chat.completions.create({
            model: "deepseek-ai/DeepSeek-V3.2-Exp:novita",
            messages: [
                { role: "system", content: "You are an expert educational content creator. Create detailed, accurate, and engaging study materials." },
                { role: "user", content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7
        });

        const studyMaterial = new StudyMaterial({
            userId,
            title: `${topic} - ${materialType}`,
            content: response.choices[0].message.content,
            subject,
            topic,
            difficulty,
            materialType,
            generatedBy: 'ai',
            metadata: {
                hasVisuals: response.choices[0].message.content.includes('diagram') ||
                    response.choices[0].message.content.includes('chart'),
                hasCode: response.choices[0].message.content.includes('```'),
                hasExamples: response.choices[0].message.content.includes('example'),
                estimatedReadTime: Math.ceil(response.choices[0].message.content.length / 200),
                keyConcepts: [],
                prerequisites: []
            }
        });

        await studyMaterial.save();

        res.status(200).json({
            success: true,
            data: studyMaterial
        });
    } catch (error) {
        console.error('Error generating study material:', error);

        // Check if it's a quota error
        if (error.code === 'insufficient_quota' || error.status === 429) {
            res.status(503).json({
                success: false,
                message: 'AI service temporarily unavailable due to quota limits. Please try again later or contact support.',
                error: 'quota_exceeded'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to generate study material',
                error: error.message
            });
        }
    }
};

// Get study materials
const getStudyMaterials = async (req, res) => {
    try {
        const { userId, subject, materialType } = req.query;

        const materials = await StudyMaterial.getUserMaterials(userId, subject, materialType);

        res.status(200).json({
            success: true,
            data: materials
        });
    } catch (error) {
        console.error('Error getting study materials:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get study materials',
            error: error.message
        });
    }
};

// Get AI recommendations
const getRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;

        const pattern = await LearningPattern.getUserPattern(userId);

        if (!pattern) {
            return res.status(404).json({
                success: false,
                message: 'Learning pattern not found'
            });
        }

        // Generate new recommendations based on learning pattern
        const recommendations = await generateRecommendations(pattern);

        res.status(200).json({
            success: true,
            data: {
                recommendations: pattern.recommendations,
                newRecommendations: recommendations
            }
        });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recommendations',
            error: error.message
        });
    }
};

// Generate recommendations based on learning pattern
const generateRecommendations = async (pattern) => {
    const recommendations = [];

    // Analyze weak subjects
    const weakSubjects = pattern.subjectMastery.filter(s => s.accuracy < 50);
    weakSubjects.forEach(subject => {
        recommendations.push({
            type: 'weakness_focus',
            subject: subject.subject,
            topic: 'Review basic concepts',
            reason: `Your accuracy in ${subject.subject} is ${subject.accuracy.toFixed(1)}%. Focus on strengthening fundamentals.`,
            priority: 'high'
        });
    });

    // Suggest advanced topics for strong subjects
    const strongSubjects = pattern.subjectMastery.filter(s => s.accuracy >= 80);
    strongSubjects.forEach(subject => {
        recommendations.push({
            type: 'advanced_topic',
            subject: subject.subject,
            topic: 'Explore advanced concepts',
            reason: `You're excelling in ${subject.subject}! Ready for more challenging topics.`,
            priority: 'medium'
        });
    });

    return recommendations;
};

// Personal Study Twin: build/sync from recent activity
const syncPersonalStudyTwin = async (req, res) => {
    try {
        const { userId } = req.params;

        let pattern = await LearningPattern.findOne({ userId });
        if (!pattern) {
            pattern = new LearningPattern({
                userId,
                userName: 'Student',
                preferences: {
                    preferredSubjects: [],
                    difficultyPreference: 'intermediate',
                    learningStyle: 'visual',
                    preferredExplanationStyle: 'step-by-step',
                    preferredTimeOfDay: 'afternoon'
                },
                subjectMastery: []
            });
        }

        // Look back 30 days
        const since = new Date();
        since.setDate(since.getDate() - 30);

        // Aggregate recent study sessions by subject
        const sessions = await StudySession.aggregate([
            { $match: { userId, date: { $gte: since } } },
            {
                $group: {
                    _id: '$subject',
                    totalDuration: { $sum: '$duration' },
                    avgProductivity: { $avg: '$productivity' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Update subject mastery heuristically from sessions
        sessions.forEach(s => {
            const subject = s._id;
            const productivityScore = Math.min(10, Math.max(1, s.avgProductivity || 6));
            const inferredAccuracy = Math.min(100, Math.max(0, productivityScore * 10));
            const topic = undefined;
            pattern.updateSubjectMastery(subject, inferredAccuracy >= 60, topic);
        });

        // Update strongest/weakest subjects
        const sorted = [...pattern.subjectMastery].sort((a, b) => b.accuracy - a.accuracy);
        pattern.performance.strongestSubjects = sorted.slice(0, 3).map(s => s.subject);
        pattern.performance.weakestSubjects = sorted.slice(-3).map(s => s.subject);

        await pattern.save();

        res.status(200).json({
            success: true,
            data: pattern
        });
    } catch (error) {
        console.error('Error syncing Personal Study Twin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync Personal Study Twin',
            error: error.message
        });
    }
};

// Personal Study Twin: get current twin (optionally auto-sync)
const getPersonalStudyTwin = async (req, res) => {
    try {
        const { userId } = req.params;
        let pattern = await LearningPattern.findOne({ userId });
        if (!pattern) {
            return res.status(404).json({ success: false, message: 'No Study Twin found. Run sync first.' });
        }
        res.status(200).json({ success: true, data: pattern });
    } catch (error) {
        console.error('Error getting Personal Study Twin:', error);
        res.status(500).json({ success: false, message: 'Failed to get Study Twin', error: error.message });
    }
};

// Personal Study Twin: generate next adaptive session plan
const getNextAdaptivePlan = async (req, res) => {
    try {
        const { userId } = req.params;
        const { subject, durationMinutes = 45 } = req.query;

        const pattern = await LearningPattern.findOne({ userId });
        if (!pattern) {
            return res.status(404).json({ success: false, message: 'No Study Twin found. Run sync first.' });
        }

        const targetSubject = subject || pattern.performance.weakestSubjects?.[0] || pattern.preferences.preferredSubjects?.[0] || 'General';

        const prompt = `You are a personal AI tutor that adapts to the student profile.
Student Profile (summary):
- Weakest subjects: ${pattern.performance.weakestSubjects?.join(', ') || 'N/A'}
- Strongest subjects: ${pattern.performance.strongestSubjects?.join(', ') || 'N/A'}
- Learning style: ${pattern.preferences.learningStyle}
- Difficulty preference: ${pattern.preferences.difficultyPreference}

Plan a ${durationMinutes}-minute study session for ${targetSubject} with:
1) 5-minute warmup recall (2-3 quick checks)
2) 20-minute teaching segment (step-by-step, visual-friendly)
3) 15-minute practice (increasing difficulty, with hints)
4) 5-minute reflection and 3 spaced-repetition cards

Return a clear, numbered outline with bullets under each step.`;

        const content = await generateOpenAIResponse(prompt, { difficultyLevel: pattern.preferences.difficultyPreference, learningStyle: pattern.preferences.learningStyle }, targetSubject, 'Adaptive Session');

        res.status(200).json({
            success: true,
            data: {
                subject: targetSubject,
                durationMinutes: Number(durationMinutes),
                plan: content
            }
        });
    } catch (error) {
        console.error('Error generating adaptive plan:', error);
        res.status(500).json({ success: false, message: 'Failed to generate adaptive plan', error: error.message });
    }
};

// End session
const endSession = async (req, res) => {
    try {
        const { sessionId, rating } = req.body;

        const conversation = await Conversation.findOne({ sessionId, isActive: true });
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        conversation.endSession(rating);
        await conversation.save();

        res.status(200).json({
            success: true,
            message: 'Session ended successfully',
            data: {
                sessionStats: conversation.sessionStats
            }
        });
    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to end session',
            error: error.message
        });
    }
};

// Voice interaction (placeholder for future implementation)
const processVoiceMessage = async (req, res) => {
    try {
        // This would integrate with speech-to-text and text-to-speech services
        // For now, return a placeholder response
        res.status(200).json({
            success: true,
            message: 'Voice interaction feature coming soon',
            data: {
                transcribedText: 'Voice message transcribed',
                response: 'AI response for voice message'
            }
        });
    } catch (error) {
        console.error('Error processing voice message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process voice message',
            error: error.message
        });
    }
};

export {
    createSession,
    sendMessage,
    getConversationHistory,
    getLearningPattern,
    generateStudyMaterial,
    getStudyMaterials,
    getRecommendations,
    // Study Twin
    getPersonalStudyTwin,
    syncPersonalStudyTwin,
    getNextAdaptivePlan,
    endSession,
    processVoiceMessage
};
