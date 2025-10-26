import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
  content: {
    type: String,
    default: ''
  },
    collaborators: [{
        userId: {
            type: String,
            required: true
        },
        permission: {
            type: String,
            enum: ['viewer', 'commenter', 'editor', 'owner'],
            default: 'viewer'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        isPublic: {
            type: Boolean,
            default: false
        },
        allowComments: {
            type: Boolean,
            default: true
        },
        allowSuggestions: {
            type: Boolean,
            default: true
        },
        allowDownload: {
            type: Boolean,
            default: true
        }
    },
    isStarred: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    lastEditedBy: {
        type: String,
        default: null
    },
    lastEditedAt: {
        type: Date,
        default: Date.now
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

// Update the updatedAt field before saving
documentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    this.lastEditedAt = Date.now();
    next();
});

// Indexes for efficient queries
documentSchema.index({ userId: 1, folderId: 1 });
documentSchema.index({ userId: 1, isStarred: 1 });
documentSchema.index({ userId: 1, isArchived: 1 });
documentSchema.index({ 'collaborators.userId': 1 });
documentSchema.index({ title: 'text', tags: 'text' }); // Text search

const Document = mongoose.model('Document', documentSchema);

export default Document;
