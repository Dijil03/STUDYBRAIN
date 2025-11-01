import mongoose from 'mongoose';

const aiChatSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        index: true
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
        }
    }],
    model: {
        type: String,
        default: 'deepseek-ai/DeepSeek-V3.2-Exp:novita'
    },
    totalTokens: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
aiChatSchema.index({ userId: 1, sessionId: 1 });
aiChatSchema.index({ createdAt: -1 });

const AIChat = mongoose.model('AIChat', aiChatSchema);

export default AIChat;
