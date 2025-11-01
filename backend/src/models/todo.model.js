import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
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
    description: {
        type: String,
        default: ''
    },
    subject: {
        type: String,
        trim: true
    },
    dueDate: {
        type: Date
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    category: {
        type: String,
        enum: ['Study', 'Personal', 'Other'],
        default: 'Study'
    }
}, {
    timestamps: true
});

export default mongoose.model('Todo', todoSchema);

