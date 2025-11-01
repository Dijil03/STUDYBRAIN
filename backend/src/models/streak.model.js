import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastActivityDate: {
        type: Date
    },
    totalDaysStudied: {
        type: Number,
        default: 0
    },
    activityByDate: [{
        date: {
            type: String, // Format: YYYY-MM-DD
            required: true
        },
        studyTime: {
            type: Number, // Minutes
            default: 0
        },
        tasksCompleted: {
            type: Number,
            default: 0
        }
    }],
    achievements: [{
        name: String,
        description: String,
        earnedAt: Date
    }]
}, {
    timestamps: true
});

export default mongoose.model('Streak', streakSchema);

