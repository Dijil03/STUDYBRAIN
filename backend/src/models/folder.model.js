import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        default: '#3B82F6', // Blue color
        validate: {
            validator: function (v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Color must be a valid hex color'
        }
    },
    icon: {
        type: String,
        default: 'folder',
        enum: ['folder', 'book', 'file-text', 'image', 'video', 'music', 'archive', 'star']
    },
    parentFolderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    isStarred: {
        type: Boolean,
        default: false
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
folderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for efficient queries
folderSchema.index({ userId: 1, parentFolderId: 1 });
folderSchema.index({ userId: 1, isStarred: 1 });

const Folder = mongoose.model('Folder', folderSchema);

export default Folder;
