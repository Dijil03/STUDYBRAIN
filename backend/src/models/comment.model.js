import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: {
            start: {
                type: Number,
                required: true
            },
            end: {
                type: Number,
                required: true
            }
        },
        required: true
    },
    selectedText: {
        type: String,
        default: ''
    },
    resolved: {
        type: Boolean,
        default: false
    },
    resolvedBy: {
        type: String,
        default: null
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    replies: [{
        userId: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    mentions: [{
        type: String // User IDs mentioned in the comment
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
commentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for efficient queries
commentSchema.index({ documentId: 1, createdAt: -1 });
commentSchema.index({ documentId: 1, resolved: 1 });
commentSchema.index({ userId: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;

