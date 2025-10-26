import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema({
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
    type: String, // Full document snapshot as HTML string
    required: true
  },
    title: {
        type: String,
        required: true
    },
    changeDescription: {
        type: String,
        default: 'Auto-saved version'
    },
    versionNumber: {
        type: Number,
        required: true
    },
    isManualSave: {
        type: Boolean,
        default: false
    },
    changes: {
        additions: {
            type: Number,
            default: 0
        },
        deletions: {
            type: Number,
            default: 0
        },
        modifications: {
            type: Number,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for efficient queries
versionSchema.index({ documentId: 1, createdAt: -1 });
versionSchema.index({ documentId: 1, versionNumber: -1 });
versionSchema.index({ userId: 1 });

const Version = mongoose.model('Version', versionSchema);

export default Version;
