import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    subject: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    color: {
        type: String,
        default: '#3B82F6'
    },
    isStarred: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Note', noteSchema);
