import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    level: {
        type: Number,
        default: 1
    },
    xp: {
        type: Number,
        default: 0
    },
    totalStudyTime: {
        type: Number, // Minutes
        default: 0
    },
    tasksCompleted: {
        type: Number,
        default: 0
    },
    goalsCompleted: {
        type: Number,
        default: 0
    },
    subjects: [{
        name: String,
        studyTime: Number,
        tasksCompleted: Number,
        lastStudied: Date
    }],
    weeklyStats: [{
        weekStart: Date,
        studyTime: Number,
        tasksCompleted: Number,
        goalsCompleted: Number
    }]
}, {
    timestamps: true
});

export default mongoose.model('Progress', progressSchema);

