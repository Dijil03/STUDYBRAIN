import mongoose from 'mongoose';

const studyBlockSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        enum: ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art', 'Music', 'Physical Education', 'Foreign Language', 'Literature', 'Economics', 'Psychology', 'Philosophy', 'General', 'Other']
    },
    startTime: {
        type: String, // Format: "HH:MM"
        required: true
    },
    endTime: {
        type: String, // Format: "HH:MM"
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true,
        min: 15,
        max: 180
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    studyType: {
        type: String,
        enum: ['reading', 'practice', 'review', 'assessment', 'homework', 'project', 'group_study'],
        default: 'reading'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        maxlength: 500,
        default: ''
    },
    relatedAssessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        default: null
    },
    relatedHomeworkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homework',
        default: null
    },
    relatedStudyGroupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudyGroup',
        default: null
    }
});

const personalScheduleSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    userName: {
        type: String,
        required: true
    },

    // Schedule metadata
    scheduleType: {
        type: String,
        enum: ['daily', 'weekly', 'custom'],
        default: 'weekly'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    generatedBy: {
        type: String,
        enum: ['user', 'ai', 'template'],
        default: 'user'
    },

    // Date range for the schedule
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },

    // Weekly schedule structure
    weeklySchedule: {
        monday: [studyBlockSchema],
        tuesday: [studyBlockSchema],
        wednesday: [studyBlockSchema],
        thursday: [studyBlockSchema],
        friday: [studyBlockSchema],
        saturday: [studyBlockSchema],
        sunday: [studyBlockSchema]
    },

    // AI optimization data
    aiOptimization: {
        basedOnPerformance: {
            type: Boolean,
            default: false
        },
        basedOnLearningStyle: {
            type: Boolean,
            default: false
        },
        adaptiveDifficulty: {
            type: Boolean,
            default: false
        },
        optimizationScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        lastOptimizedAt: {
            type: Date,
            default: null
        }
    },

    // Statistics and tracking
    statistics: {
        totalPlannedHours: {
            type: Number,
            default: 0
        },
        completedHours: {
            type: Number,
            default: 0
        },
        completionRate: {
            type: Number, // percentage
            min: 0,
            max: 100,
            default: 0
        },
        averageSessionDuration: {
            type: Number, // in minutes
            default: 0
        },
        mostProductiveTimeSlot: {
            type: String,
            enum: ['early_morning', 'morning', 'afternoon', 'evening', 'night'],
            default: null
        },
        subjectPerformance: [{
            subject: String,
            completionRate: Number,
            averageScore: Number,
            timeSpent: Number // in minutes
        }]
    },

    // Reminder settings specific to this schedule
    reminderSettings: {
        enabled: {
            type: Boolean,
            default: true
        },
        minutesBefore: {
            type: Number,
            default: 15
        },
        customMessage: {
            type: String,
            maxlength: 200,
            default: ''
        }
    },

    // Template information (if created from a template)
    templateInfo: {
        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ScheduleTemplate',
            default: null
        },
        templateName: {
            type: String,
            default: null
        }
    }
}, {
    timestamps: true
});

// Indexes for better performance
personalScheduleSchema.index({ userId: 1, isActive: 1 });
personalScheduleSchema.index({ startDate: 1, endDate: 1 });
personalScheduleSchema.index({ userId: 1, createdAt: -1 });

// Virtual to get total study blocks
personalScheduleSchema.virtual('totalStudyBlocks').get(function () {
    let total = 0;
    Object.values(this.weeklySchedule).forEach(daySchedule => {
        total += daySchedule.length;
    });
    return total;
});

// Virtual to get current week completion rate
personalScheduleSchema.virtual('currentWeekCompletion').get(function () {
    let completed = 0;
    let total = 0;

    Object.values(this.weeklySchedule).forEach(daySchedule => {
        daySchedule.forEach(block => {
            total++;
            if (block.isCompleted) completed++;
        });
    });

    return total > 0 ? Math.round((completed / total) * 100) : 0;
});

// Method to calculate and update statistics
personalScheduleSchema.methods.updateStatistics = function () {
    console.log('📊 Updating statistics for schedule');

    try {
        let totalPlanned = 0;
        let completed = 0;
        let completedBlocks = 0;
        let totalBlocks = 0;

        const subjectStats = {};

        if (!this.weeklySchedule) {
            console.log('⚠️ No weeklySchedule found for statistics update');
            return; // Don't save here - let the caller handle saving
        }

        Object.values(this.weeklySchedule).forEach(daySchedule => {
            if (Array.isArray(daySchedule)) {
                daySchedule.forEach(block => {
                    if (block && typeof block.duration === 'number') {
                        totalPlanned += block.duration;
                        totalBlocks++;

                        if (block.isCompleted) {
                            completed += block.duration;
                            completedBlocks++;
                        }

                        // Track subject performance
                        if (block.subject) {
                            if (!subjectStats[block.subject]) {
                                subjectStats[block.subject] = {
                                    total: 0,
                                    completed: 0,
                                    timeSpent: 0
                                };
                            }

                            subjectStats[block.subject].total++;
                            subjectStats[block.subject].timeSpent += block.duration;

                            if (block.isCompleted) {
                                subjectStats[block.subject].completed++;
                            }
                        }
                    }
                });
            }
        });

        // Ensure statistics object exists
        if (!this.statistics) {
            this.statistics = {};
        }

        // Update statistics
        this.statistics.totalPlannedHours = Math.round(totalPlanned / 60 * 100) / 100;
        this.statistics.completedHours = Math.round(completed / 60 * 100) / 100;
        this.statistics.completionRate = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;
        this.statistics.averageSessionDuration = totalBlocks > 0 ? Math.round(totalPlanned / totalBlocks) : 0;

        // Update subject performance
        this.statistics.subjectPerformance = Object.entries(subjectStats).map(([subject, stats]) => ({
            subject,
            completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
            timeSpent: stats.timeSpent
        }));

        console.log('✅ Statistics updated:', {
            totalPlannedHours: this.statistics.totalPlannedHours,
            completedHours: this.statistics.completedHours,
            completionRate: this.statistics.completionRate,
            totalBlocks,
            completedBlocks
        });

        // Don't save here - let the caller handle saving
        console.log('✅ Statistics updated in memory (not saved yet)');

    } catch (error) {
        console.log('❌ Error in updateStatistics:', error.message);
        throw error;
    }
};

// Method to mark a study block as completed
personalScheduleSchema.methods.completeStudyBlock = function (day, blockIndex, notes = '') {
    console.log('🔄 PersonalSchedule.completeStudyBlock called with:', { day, blockIndex, notes });
    console.log('📅 Available weeklySchedule:', Object.keys(this.weeklySchedule || {}));
    console.log('📊 Blocks in requested day:', this.weeklySchedule?.[day]?.length || 0);

    if (!this.weeklySchedule) {
        console.log('❌ No weeklySchedule found');
        throw new Error('No weekly schedule found');
    }

    if (!this.weeklySchedule[day]) {
        console.log('❌ Day not found in schedule:', day);
        throw new Error(`Day '${day}' not found in schedule`);
    }

    if (!this.weeklySchedule[day][blockIndex]) {
        console.log('❌ Block index not found:', blockIndex, 'in day:', day);
        throw new Error(`Study block at index ${blockIndex} not found for day '${day}'`);
    }

    console.log('✅ Study block found, marking as completed');
    this.weeklySchedule[day][blockIndex].isCompleted = true;
    this.weeklySchedule[day][blockIndex].completedAt = new Date();
    this.weeklySchedule[day][blockIndex].notes = notes;

    console.log('📊 Updating statistics');
    try {
        // Update statistics - make this safer
        if (typeof this.updateStatistics === 'function') {
            this.updateStatistics(); // This now only updates in memory, doesn't save
        } else {
            console.log('⚠️ updateStatistics method not found, skipping statistics update');
        }
    } catch (statsError) {
        console.log('⚠️ Error updating statistics, continuing anyway:', statsError.message);
    }

    console.log('💾 Saving schedule after completing study block (single save operation)');
    return this.save();
};

// Static method to get user's active schedule
personalScheduleSchema.statics.getUserActiveSchedule = async function (userId) {
    // Ensure userId is a string for consistent comparison
    const scheduleUserId = String(userId);
    console.log('🔍 getUserActiveSchedule called with userId:', scheduleUserId, 'type:', typeof scheduleUserId);
    
    // First try: exact string match
    let schedule = await this.findOne({
        userId: scheduleUserId,
        isActive: true
    }).sort({ createdAt: -1 });
    
    if (schedule) {
        console.log('✅ Found schedule with string userId');
        return schedule;
    }
    
    // Second try: if userId looks like ObjectId, try both formats
    if (mongoose.Types.ObjectId.isValid(scheduleUserId)) {
        // Try with ObjectId format
        schedule = await this.findOne({
            userId: new mongoose.Types.ObjectId(scheduleUserId),
            isActive: true
        }).sort({ createdAt: -1 });
        
        if (schedule) {
            console.log('✅ Found schedule with ObjectId userId');
            return schedule;
        }
        
        // Try with string comparison one more time
        schedule = await this.findOne({
            userId: scheduleUserId,
            isActive: true
        }).sort({ createdAt: -1 });
    }
    
    // Get the most recent active schedule, regardless of date range
    // This allows schedules that haven't started yet to be retrieved
    return schedule;
};

// Static method to create AI-optimized schedule
personalScheduleSchema.statics.createAIOptimizedSchedule = async function (userId, userPreferences, performanceData) {
    // This method would integrate with the AI system to create optimized schedules
    // For now, it's a placeholder that would be implemented with the AI integration
    const schedule = new this({
        userId,
        userName: userPreferences.userName,
        startDate: userPreferences.startDate,
        endDate: userPreferences.endDate,
        generatedBy: 'ai',
        aiOptimization: {
            basedOnPerformance: true,
            basedOnLearningStyle: true,
            adaptiveDifficulty: true,
            optimizationScore: 85, // This would be calculated by AI
            lastOptimizedAt: new Date()
        }
    });

    // AI would populate the weeklySchedule based on user data
    // This is a simplified implementation
    return schedule.save();
};

const PersonalSchedule = mongoose.model('PersonalSchedule', personalScheduleSchema);

export { PersonalSchedule };

