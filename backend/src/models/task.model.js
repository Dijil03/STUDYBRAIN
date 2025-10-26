import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    subject: {
        type: String,
        trim: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    priority: {
        type: String, // e.g., 'High', 'Medium', 'Low'
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium',
    },
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;
