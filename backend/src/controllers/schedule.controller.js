import { PersonalSchedule } from '../models/personalSchedule.model.js';
import User from '../models/auth.model.js';
import Progress from '../models/progress.model.js';
import mongoose from 'mongoose';

// Debug: Check if PersonalSchedule model is imported correctly
console.log('🔍 PersonalSchedule model imported:', !!PersonalSchedule);
console.log('🔍 PersonalSchedule static methods:', PersonalSchedule.getUserActiveSchedule ? 'Available' : 'Missing');

// Get user's personalized schedule
const getPersonalizedSchedule = async (req, res) => {
    try {
        const userId = req.params.userId || req.body.userId || req.query.userId;
        const { startDate, endDate, includeCompleted = false } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        let query = { userId, isActive: true };

        // Add date range filter if provided
        if (startDate && endDate) {
            query.startDate = { $lte: new Date(endDate) };
            query.endDate = { $gte: new Date(startDate) };
        }

        const schedules = await PersonalSchedule.find(query)
            .sort({ createdAt: -1 })
            .populate('templateInfo.templateId');

        // Filter out completed blocks if requested
        if (!includeCompleted) {
            schedules.forEach(schedule => {
                Object.keys(schedule.weeklySchedule).forEach(day => {
                    schedule.weeklySchedule[day] = schedule.weeklySchedule[day].filter(block => !block.isCompleted);
                });
            });
        }

        res.json({
            success: true,
            data: {
                schedules,
                total: schedules.length
            }
        });

    } catch (error) {
        console.error('Error fetching personalized schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch schedule',
            error: error.message
        });
    }
};

// Get user's active schedule
const getActiveSchedule = async (req, res) => {
    try {
        const userId = req.params.userId || req.body.userId || req.query.userId;
        console.log('🔍 Fetching active schedule for userId:', userId);

        if (!userId) {
            console.log('❌ No userId provided');
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        console.log('📅 Calling PersonalSchedule.getUserActiveSchedule with userId:', userId);
        console.log('📊 userId type:', typeof userId);
        
        // Ensure userId is a string for consistent comparison
        const scheduleUserId = String(userId);
        
        const activeSchedule = await PersonalSchedule.getUserActiveSchedule(scheduleUserId);
        console.log('✅ Active schedule result:', activeSchedule ? 'Found' : 'Not found');
        
        if (activeSchedule) {
            console.log('📊 Retrieved schedule details:', {
                _id: activeSchedule._id,
                userId: activeSchedule.userId,
                userIdType: typeof activeSchedule.userId,
                isActive: activeSchedule.isActive,
                startDate: activeSchedule.startDate,
                endDate: activeSchedule.endDate,
                scheduleType: activeSchedule.scheduleType,
                createdAt: activeSchedule.createdAt
            });
        }

        if (!activeSchedule) {
            // Fallback: Get the most recent schedule for this user (even if inactive)
            // This helps if a schedule was accidentally deactivated or if there's a timing issue
            console.log('⚠️ No active schedule found, checking for most recent schedule...');
            const anySchedule = await PersonalSchedule.findOne({ userId: scheduleUserId }).sort({ createdAt: -1 });
            
            if (anySchedule) {
                console.log('⚠️ Found schedule (may be inactive):', {
                    _id: anySchedule._id,
                    userId: anySchedule.userId,
                    userIdType: typeof anySchedule.userId,
                    isActive: anySchedule.isActive,
                    startDate: anySchedule.startDate,
                    endDate: anySchedule.endDate,
                    createdAt: anySchedule.createdAt
                });
                
                // If there's a schedule but it's inactive, reactivate it and return it
                if (!anySchedule.isActive) {
                    console.log('🔄 Reactivating schedule:', anySchedule._id);
                    anySchedule.isActive = true;
                    await anySchedule.save();
                    console.log('✅ Schedule reactivated');
                    
                    return res.json({
                        success: true,
                        data: anySchedule,
                        message: 'Schedule reactivated'
                    });
                }
                
                // If it's active but wasn't found by getUserActiveSchedule, there might be a query issue
                // Return it anyway
                return res.json({
                    success: true,
                    data: anySchedule,
                    message: 'Schedule found'
                });
            } else {
                // Check all schedules for debugging
                const allSchedules = await PersonalSchedule.find({}).sort({ createdAt: -1 }).limit(5);
                console.log('🔍 Checking all recent schedules in database:', allSchedules.map(s => ({
                    _id: s._id,
                    userId: s.userId,
                    userIdType: typeof s.userId,
                    isActive: s.isActive,
                    createdAt: s.createdAt
                })));
                
                // Also try searching with different userId formats
                console.log('🔍 Trying alternative userId formats...');
                const altSchedules = await PersonalSchedule.find({
                    $or: [
                        { userId: scheduleUserId },
                        { userId: new mongoose.Types.ObjectId(scheduleUserId) },
                        { userId: String(scheduleUserId) }
                    ]
                }).sort({ createdAt: -1 }).limit(5);
                
                if (altSchedules.length > 0) {
                    console.log('✅ Found schedules with alternative query:', altSchedules.length);
                    const mostRecent = altSchedules[0];
                    if (!mostRecent.isActive) {
                        mostRecent.isActive = true;
                        await mostRecent.save();
                    }
                    return res.json({
                        success: true,
                        data: mostRecent,
                        message: 'Schedule found with alternative query'
                    });
                }
            }
            
            return res.json({
                success: true,
                data: null,
                message: 'No active schedule found'
            });
        }

        res.json({
            success: true,
            data: activeSchedule
        });

    } catch (error) {
        console.error('❌ Error fetching active schedule:', error.message);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active schedule',
            error: error.message
        });
    }
};

// Generate AI-optimized schedule
const generateOptimizedSchedule = async (req, res) => {
    try {
        console.log('🔄 Generate schedule request received:', {
            userId: req.body.userId,
            userName: req.body.userName,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            subjects: req.body.subjects,
            dailyHours: req.body.dailyHours,
            dailyStartTime: req.body.dailyStartTime
        });

        const userId = req.body.userId;
        const userName = req.body.userName;
        const {
            startDate,
            endDate,
            subjects,
            dailyHours,
            dailyStartTime,
            preferredDifficulty,
            includeWeekends = false,
            prioritySubjects = []
        } = req.body;

        if (!userId || !userName || !startDate || !endDate) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'User ID, username, start date, and end date are required'
            });
        }

        // Get user profile for personalization
        console.log('🔍 Fetching user profile for userId:', userId);
        console.log('📊 userId type:', typeof userId);
        
        // Try to find user - handle both ObjectId and string formats
        let user;
        try {
            // First try with the userId as-is (might be ObjectId or string)
            user = await User.findById(userId).select('personalInfo preferences');
            
            // If not found and userId is a string, try converting to ObjectId
            if (!user && typeof userId === 'string') {
                if (mongoose.Types.ObjectId.isValid(userId)) {
                    user = await User.findById(new mongoose.Types.ObjectId(userId)).select('personalInfo preferences');
                }
            }
        } catch (error) {
            console.error('❌ Error finding user:', error);
        }

        if (!user) {
            console.log('❌ User not found for ID:', userId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('✅ User found, preferences:', user.preferences);
        console.log('✅ User personal info:', user.personalInfo);
        console.log('📊 User _id:', user._id, 'type:', typeof user._id);

        // Use user._id.toString() to ensure consistent string format
        const scheduleUserId = user._id.toString();
        console.log('📊 Schedule userId (converted):', scheduleUserId);

        // Deactivate existing schedules
        console.log('🔄 Deactivating existing schedules for userId:', scheduleUserId);
        
        const deactivateResult = await PersonalSchedule.updateMany(
            { userId: scheduleUserId, isActive: true },
            { isActive: false }
        );
        console.log('📊 Deactivation result:', {
            matchedCount: deactivateResult.matchedCount,
            modifiedCount: deactivateResult.modifiedCount
        });

        // Generate optimized schedule based on user preferences
        const safeSubjects = subjects && subjects.length > 0
            ? subjects
            : (user.personalInfo?.favoriteSubjects && user.personalInfo.favoriteSubjects.length > 0)
                ? user.personalInfo.favoriteSubjects
                : ['General'];

        console.log('🎯 Safe subjects determined:', safeSubjects);

        const scheduleParams = {
            userId: scheduleUserId, // Use the converted userId
            userName,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            subjects: safeSubjects,
            dailyHours: dailyHours || 2,
            dailyStartTime: dailyStartTime || '09:00',
            preferredDifficulty: preferredDifficulty || user.preferences?.difficultyPreference || 'medium',
            includeWeekends,
            prioritySubjects: prioritySubjects || [],
            userPreferences: user.preferences || {},
            personalInfo: user.personalInfo || {}
        };

        console.log('🚀 Generating AI schedule with params:', scheduleParams);
        const optimizedSchedule = await generateAISchedule(scheduleParams);

        console.log('✅ AI schedule generated, creating PersonalSchedule model');
        console.log('📝 Schedule data to save:', JSON.stringify(optimizedSchedule, null, 2));

        const newSchedule = new PersonalSchedule(optimizedSchedule);
        
        // Ensure isActive is set to true and userId is a string
        newSchedule.isActive = true;
        newSchedule.userId = scheduleUserId; // Use the converted userId for consistency

        console.log('💾 Saving new schedule to database');
        console.log('📊 Schedule details before save:', {
            userId: newSchedule.userId,
            userIdType: typeof newSchedule.userId,
            userName: newSchedule.userName,
            startDate: newSchedule.startDate,
            endDate: newSchedule.endDate,
            isActive: newSchedule.isActive,
            scheduleType: newSchedule.scheduleType,
            generatedBy: newSchedule.generatedBy
        });
        
        await newSchedule.save();
        
        console.log('✅ Schedule saved successfully with ID:', newSchedule._id);
        console.log('📊 Schedule details after save:', {
            _id: newSchedule._id,
            userId: newSchedule.userId,
            isActive: newSchedule.isActive,
            startDate: newSchedule.startDate,
            endDate: newSchedule.endDate
        });
        
        // Verify the schedule was saved by fetching it back
        const verificationSchedule = await PersonalSchedule.findById(newSchedule._id);
        if (verificationSchedule) {
            console.log('✅ Verification: Schedule found in database:', {
                _id: verificationSchedule._id,
                userId: verificationSchedule.userId,
                isActive: verificationSchedule.isActive
            });
        } else {
            console.error('❌ Verification failed: Schedule not found in database after save!');
        }

        res.status(201).json({
            success: true,
            message: 'AI-optimized schedule generated successfully',
            data: newSchedule
        });

    } catch (error) {
        console.error('❌ Error generating optimized schedule:', error.message);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to generate optimized schedule',
            error: error.message
        });
    }
};

// Create custom schedule
const createCustomSchedule = async (req, res) => {
    try {
        const userId = req.body.userId;
        const userName = req.body.userName;
        const {
            startDate,
            endDate,
            weeklySchedule,
            scheduleType = 'custom',
            reminderSettings
        } = req.body;

        if (!userId || !userName || !startDate || !endDate || !weeklySchedule) {
            return res.status(400).json({
                success: false,
                message: 'All schedule fields are required'
            });
        }

        // Validate weekly schedule structure
        const validationErrors = validateWeeklySchedule(weeklySchedule);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Schedule validation failed',
                errors: validationErrors
            });
        }

        // Deactivate existing schedules
        await PersonalSchedule.updateMany(
            { userId, isActive: true },
            { isActive: false }
        );

        const newSchedule = new PersonalSchedule({
            userId,
            userName,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            weeklySchedule,
            scheduleType,
            generatedBy: 'user',
            reminderSettings: reminderSettings || {
                enabled: true,
                minutesBefore: 15
            }
        });

        // Calculate initial statistics and save
        newSchedule.updateStatistics();
        await newSchedule.save();

        res.status(201).json({
            success: true,
            message: 'Custom schedule created successfully',
            data: newSchedule
        });

    } catch (error) {
        console.error('Error creating custom schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create custom schedule',
            error: error.message
        });
    }
};

// Complete a study block
const completeStudyBlockOld = async (req, res) => {
    try {
        const { scheduleId, day, blockIndex } = req.params;
        const { notes = '', rating } = req.body;
        const userId = req.body.userId;

        console.log('🎯 Completing study block:', {
            scheduleId,
            day,
            blockIndex,
            userId,
            notes,
            rating
        });

        if (!userId) {
            console.log('❌ No userId provided for completing study block');
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        console.log('🔍 Looking for schedule with ID:', scheduleId, 'for user:', userId);
        const schedule = await PersonalSchedule.findOne({
            _id: scheduleId,
            userId,
            isActive: true
        });

        if (!schedule) {
            console.log('❌ Schedule not found for ID:', scheduleId, 'user:', userId);
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        console.log('✅ Schedule found, attempting to complete study block');
        console.log('📅 Available days in schedule:', Object.keys(schedule.weeklySchedule || {}));
        console.log('📊 Blocks in day', day, ':', schedule.weeklySchedule?.[day]?.length || 0);

        // Check if the day and blockIndex are valid
        if (!schedule.weeklySchedule || !schedule.weeklySchedule[day]) {
            console.log('❌ Invalid day:', day);
            return res.status(400).json({
                success: false,
                message: `Invalid day: ${day}`
            });
        }

        const blockIndexNum = parseInt(blockIndex);
        if (isNaN(blockIndexNum) || blockIndexNum < 0 || blockIndexNum >= schedule.weeklySchedule[day].length) {
            console.log('❌ Invalid block index:', blockIndex, 'for day:', day);
            return res.status(400).json({
                success: false,
                message: `Invalid block index: ${blockIndex}`
            });
        }

        console.log('🔄 Calling schedule.completeStudyBlock method');

        // Check if the method exists
        if (typeof schedule.completeStudyBlock !== 'function') {
            console.log('❌ completeStudyBlock method does not exist on schedule model');

            // Manual implementation as fallback
            schedule.weeklySchedule[day][blockIndexNum].isCompleted = true;
            schedule.weeklySchedule[day][blockIndexNum].completedAt = new Date();
            schedule.weeklySchedule[day][blockIndexNum].notes = notes;

            if (rating) {
                schedule.weeklySchedule[day][blockIndexNum].rating = rating;
                console.log('✅ Rating added to study block (manual):', rating);
            }

            console.log('💾 Saving schedule manually (single save operation)');
            await schedule.save();

        } else {
            // Add rating before completing the study block to avoid parallel saves
            if (rating && schedule.weeklySchedule[day][blockIndexNum]) {
                schedule.weeklySchedule[day][blockIndexNum].rating = rating;
                console.log('✅ Rating added to study block:', rating);
            }

            await schedule.completeStudyBlock(day, blockIndexNum, notes);
            console.log('✅ Study block completed with single save operation');
        }

        console.log('✅ Study block completed successfully');
        res.json({
            success: true,
            message: 'Study block completed successfully',
            data: {
                completedBlock: schedule.weeklySchedule[day][blockIndexNum],
                statistics: schedule.statistics
            }
        });

    } catch (error) {
        console.error('❌ Error completing study block:', error.message);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to complete study block',
            error: error.message
        });
    }
};


// Helper function to generate AI-optimized schedule
async function generateAISchedule(params) {
    console.log('🤖 Starting AI schedule generation with params:', params);

    const {
        userId,
        userName,
        startDate,
        endDate,
        subjects,
        dailyHours,
        dailyStartTime,
        preferredDifficulty,
        includeWeekends,
        prioritySubjects,
        userPreferences,
        personalInfo
    } = params;

    // This is a simplified AI schedule generation
    // In a real implementation, this would use machine learning algorithms
    console.log('📅 Creating weekly schedule template');

    const weeklySchedule = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: includeWeekends ? [] : [],
        sunday: includeWeekends ? [] : []
    };

    // Safety checks for userPreferences
    const safeUserPreferences = userPreferences || {};
    const preferredSessionDuration = safeUserPreferences.preferredSessionDuration || 45;

    // Calculate sessions per day based on daily hours
    const totalMinutesPerDay = dailyHours * 60;
    const sessionsPerDay = Math.ceil(totalMinutesPerDay / preferredSessionDuration);

    const days = Object.keys(weeklySchedule);
    const activeDays = includeWeekends ? days : days.slice(0, 5);

    console.log('⏰ Daily study configuration:', {
        dailyHours,
        dailyStartTime,
        totalMinutesPerDay,
        sessionsPerDay,
        preferredSessionDuration
    });

    // Ensure subjects array is not empty
    const safeSubjects = subjects && subjects.length > 0 ? subjects : ['General'];

    // Helper function to create time slots starting from dailyStartTime
    const createTimeSlots = (startTime, sessionCount, sessionDuration) => {
        const slots = [];
        let currentTime = startTime;

        for (let i = 0; i < sessionCount; i++) {
            slots.push(currentTime);
            currentTime = addMinutes(currentTime, sessionDuration + 10); // 10 min break between sessions
        }
        return slots;
    };

    console.log('🎯 Creating schedule for each day with mixed subjects');

    activeDays.forEach((day, dayIndex) => {
        console.log(`📅 Processing ${day}`);

        // Create time slots for this day starting from dailyStartTime
        const timeSlots = createTimeSlots(dailyStartTime, sessionsPerDay, preferredSessionDuration);

        // Create a shuffled array of subjects for this day to mix them up
        const daySubjects = [];
        for (let i = 0; i < sessionsPerDay; i++) {
            // Mix subjects by prioritizing them first, then cycling through all subjects
            if (i < prioritySubjects.length) {
                daySubjects.push(prioritySubjects[i % prioritySubjects.length]);
            } else {
                daySubjects.push(safeSubjects[i % safeSubjects.length]);
            }
        }

        // Shuffle the subjects for variety (keeping priority subjects more frequent)
        const shuffledSubjects = [...daySubjects];
        for (let i = shuffledSubjects.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledSubjects[i], shuffledSubjects[j]] = [shuffledSubjects[j], shuffledSubjects[i]];
        }

        console.log(`📚 Subjects for ${day}:`, shuffledSubjects);

        for (let i = 0; i < sessionsPerDay && i < timeSlots.length; i++) {
            const subject = shuffledSubjects[i];
            const duration = preferredSessionDuration;
            const startTime = timeSlots[i];

            // Adjust difficulty based on session position (earlier = harder)
            let difficulty = preferredDifficulty;
            if (i === 0) {
                difficulty = 'hard'; // First session for difficult topics
            } else if (i === sessionsPerDay - 1) {
                difficulty = 'easy'; // Last session for easier review
            }

            // Ensure difficulty is a valid enum value
            if (!['easy', 'medium', 'hard'].includes(difficulty)) {
                console.log('⚠️ Invalid difficulty value detected:', difficulty, '- defaulting to medium');
                difficulty = 'medium'; // Default to medium if invalid
            }

            // Generate varied study types instead of always 'reading'
            // Use only valid enum values: 'reading', 'practice', 'review', 'assessment', 'homework', 'project', 'group_study'
            const studyTypes = ['reading', 'practice', 'review', 'assessment', 'homework', 'project'];
            // Rotate study types based on subject and session position for variety
            const studyTypeIndex = (dayIndex * sessionsPerDay + i) % studyTypes.length;
            const studyType = prioritySubjects.includes(subject) 
                ? 'practice' 
                : studyTypes[studyTypeIndex];

            const studyBlock = {
                subject,
                startTime: startTime,
                endTime: addMinutes(startTime, duration),
                duration,
                difficulty,
                studyType,
                priority: prioritySubjects.includes(subject) ? 'high' : 'medium',
                isCompleted: false,
                notes: ''
            };

            weeklySchedule[day].push(studyBlock);
            console.log(`✅ Added ${subject} session: ${startTime} - ${studyBlock.endTime}`);
        }
    });

    const scheduleData = {
        userId: String(userId), // Ensure userId is always a string
        userName,
        startDate,
        endDate,
        weeklySchedule,
        scheduleType: 'weekly',
        generatedBy: 'ai',
        isActive: true, // Ensure schedule is active by default
        aiOptimization: {
            basedOnPerformance: true,
            basedOnLearningStyle: true,
            adaptiveDifficulty: true,
            optimizationScore: 85,
            lastOptimizedAt: new Date()
        }
    };

    console.log('✅ AI schedule generation completed successfully');
    return scheduleData;
}

// Helper function to get optimal time slots
function getOptimalTimeSlots(preference) {
    const timeSlots = {
        early_morning: ['06:00', '07:00', '08:00'],
        morning: ['09:00', '10:00', '11:00'],
        afternoon: ['13:00', '14:00', '15:00', '16:00'],
        evening: ['17:00', '18:00', '19:00'],
        night: ['20:00', '21:00', '22:00'],
        flexible: ['09:00', '14:00', '17:00', '20:00']
    };

    return timeSlots[preference] || timeSlots.flexible;
}

// Helper function to add minutes to time string
function addMinutes(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}

// Helper function to validate weekly schedule
function validateWeeklySchedule(weeklySchedule) {
    const errors = [];
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    Object.keys(weeklySchedule).forEach(day => {
        if (!validDays.includes(day)) {
            errors.push(`Invalid day: ${day}`);
            return;
        }

        weeklySchedule[day].forEach((block, index) => {
            if (!block.subject || !block.startTime || !block.endTime || !block.duration) {
                errors.push(`Missing required fields in ${day} block ${index + 1}`);
            }

            if (block.duration < 15 || block.duration > 180) {
                errors.push(`Invalid duration in ${day} block ${index + 1}: must be between 15 and 180 minutes`);
            }
        });
    });

    return errors;
}

// Helper function to generate improvement recommendations
function generateImprovementRecommendations(stats) {
    const recommendations = [];

    if (stats.averageCompletionRate < 70) {
        recommendations.push({
            type: 'completion_rate',
            title: 'Improve Completion Rate',
            message: 'Your completion rate is below 70%. Consider reducing session duration or weekly hours.',
            priority: 'high'
        });
    }

    // Find subjects with low completion rates
    Object.entries(stats.subjectBreakdown).forEach(([subject, data]) => {
        if (data.completionRate < 60) {
            recommendations.push({
                type: 'subject_performance',
                title: `Improve ${subject} Performance`,
                message: `Consider breaking down ${subject} into smaller, more manageable sessions.`,
                priority: 'medium'
            });
        }
    });

    if (stats.totalCompletedHours < stats.totalPlannedHours * 0.5) {
        recommendations.push({
            type: 'time_management',
            title: 'Time Management',
            message: 'You\'re completing less than 50% of planned study time. Review your schedule and make it more realistic.',
            priority: 'high'
        });
    }

    return recommendations;
}

// Complete a study block
const completeStudyBlock = async (req, res) => {
    try {
        console.log('🔄 Complete study block request received:', {
            scheduleId: req.params.scheduleId,
            day: req.params.day,
            blockIndex: req.params.blockIndex,
            body: req.body
        });

        const { scheduleId, day, blockIndex } = req.params;
        const { userId, notes, rating } = req.body;

        if (!scheduleId || !day || blockIndex === undefined || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: scheduleId, day, blockIndex, or userId'
            });
        }

        // Find the schedule
        const schedule = await PersonalSchedule.findById(scheduleId);
        if (!schedule) {
            console.error('❌ Schedule not found:', scheduleId);
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        // Verify ownership
        if (schedule.userId.toString() !== userId) {
            console.error('❌ Unauthorized access to schedule:', { scheduleUserId: schedule.userId, requestUserId: userId });
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to schedule'
            });
        }

        // Validate day and blockIndex
        const daySchedule = schedule.weeklySchedule[day];
        if (!daySchedule || !Array.isArray(daySchedule)) {
            console.error('❌ Invalid day in schedule:', day);
            return res.status(400).json({
                success: false,
                message: `Invalid day: ${day}`
            });
        }

        const blockIdx = parseInt(blockIndex);
        if (blockIdx < 0 || blockIdx >= daySchedule.length) {
            console.error('❌ Invalid block index:', { blockIndex: blockIdx, maxIndex: daySchedule.length - 1 });
            return res.status(400).json({
                success: false,
                message: `Invalid block index: ${blockIndex}`
            });
        }

        const block = daySchedule[blockIdx];
        if (!block) {
            console.error('❌ Block not found at index:', blockIdx);
            return res.status(400).json({
                success: false,
                message: 'Study block not found'
            });
        }

        // Mark the block as completed
        block.isCompleted = true;
        block.completedAt = new Date();
        if (notes) block.notes = notes;
        if (rating) block.rating = rating;

        console.log('✅ Block marked as completed:', {
            subject: block.subject,
            duration: block.duration,
            completedAt: block.completedAt
        });

        // Update schedule statistics using the model method
        schedule.updateStatistics();
        await schedule.save();

        // Update user progress in the Progress model
        try {
            let progress = await Progress.findOne({ userId });
            if (!progress) {
                progress = new Progress({ userId });
            }

            // Update progress stats
            progress.totalStudyTime += block.duration || 0;
            progress.tasksCompleted += 1;
            progress.xp += (block.duration || 0) * 2; // 2 XP per minute

            // Calculate level (level up every 100 XP)
            const newLevel = Math.floor(progress.xp / 100) + 1;
            if (newLevel > progress.level) {
                progress.level = newLevel;
                console.log('🎉 User leveled up!', { oldLevel: progress.level - 1, newLevel });
            }

            // Update subject-specific progress
            const subjectIndex = progress.subjects.findIndex(s => s.name === block.subject);
            if (subjectIndex >= 0) {
                progress.subjects[subjectIndex].studyTime += block.duration || 0;
                progress.subjects[subjectIndex].tasksCompleted += 1;
                progress.subjects[subjectIndex].lastStudied = new Date();
            } else {
                progress.subjects.push({
                    name: block.subject,
                    studyTime: block.duration || 0,
                    tasksCompleted: 1,
                    lastStudied: new Date()
                });
            }

            await progress.save();
            console.log('✅ Progress updated successfully');

        } catch (progressError) {
            console.error('❌ Error updating progress:', progressError);
            // Don't fail the main request if progress update fails
        }

        // Update streak (record study activity)
        try {
            const streakController = await import('./streak.controller.js');
            const fakeReq = {
                params: { userId },
                body: {
                    studyTime: block.duration || 0,
                    tasksCompleted: 1
                }
            };
            const fakeRes = {
                status: () => ({ json: () => { } }),
                json: () => { }
            };

            await streakController.recordActivity(fakeReq, fakeRes);
            console.log('✅ Streak updated successfully');
        } catch (streakError) {
            console.error('❌ Error updating streak:', streakError);
            // Don't fail the main request if streak update fails
        }

        console.log('✅ Study block completed successfully');

        res.status(200).json({
            success: true,
            message: 'Study block completed successfully',
            data: {
                completedBlock: block,
                statistics: schedule.statistics
            }
        });

    } catch (error) {
        console.error('❌ Error completing study block:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete study block',
            error: error.message
        });
    }
};

// Get schedule statistics
const getScheduleStatistics = async (req, res) => {
    try {
        console.log('🔍 getScheduleStatistics called with req:', !!req);
        console.log('🔍 Request params:', req?.params);
        console.log('🔍 Request query:', req?.query);
        console.log('🔍 Request body:', req?.body);

        if (!req) {
            console.log('❌ Request object is undefined');
            return res.status(500).json({
                success: false,
                message: 'Request object is undefined'
            });
        }

        const userId = req.params?.userId || req.body?.userId || req.query?.userId;
        const { timeRange = '30' } = req.query || {}; // days

        console.log('🔍 Extracted userId:', userId);
        console.log('🔍 Extracted timeRange:', timeRange);
        console.log('📊 Fetching schedule statistics for userId:', userId, 'timeRange:', timeRange);

        if (!userId) {
            console.log('❌ No userId provided for statistics');
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - parseInt(timeRange));

        console.log('📅 Searching schedules from date:', dateFrom);
        const schedules = await PersonalSchedule.find({
            userId,
            createdAt: { $gte: dateFrom }
        });

        console.log('📋 Found schedules count for statistics:', schedules.length);

        if (schedules.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalSchedules: 0,
                    totalSessions: 0,
                    completedSessions: 0,
                    totalDuration: 0,
                    completionRate: 0,
                    averageRating: 0,
                    totalCompletedHours: 0,
                    totalPlannedHours: 0,
                    subjectBreakdown: {}
                }
            });
        }

        let totalSessions = 0;
        let completedSessions = 0;
        let totalDuration = 0;
        let totalRating = 0;
        let ratedSessions = 0;
        let totalCompletedHours = 0;
        let totalPlannedHours = 0;
        const subjectBreakdown = {};

        schedules.forEach(schedule => {
            if (schedule.weeklySchedule) {
                Object.values(schedule.weeklySchedule).forEach(daySchedule => {
                    if (Array.isArray(daySchedule)) {
                        daySchedule.forEach(block => {
                            totalSessions++;
                            totalDuration += block.duration || 0;
                            totalPlannedHours += (block.duration || 0) / 60;

                            if (block.isCompleted) {
                                completedSessions++;
                                totalCompletedHours += (block.duration || 0) / 60;

                                if (block.rating && block.rating > 0) {
                                    totalRating += block.rating;
                                    ratedSessions++;
                                }
                            }

                            // Subject breakdown
                            const subject = block.subject || 'Unknown';
                            if (!subjectBreakdown[subject]) {
                                subjectBreakdown[subject] = {
                                    totalSessions: 0,
                                    completedSessions: 0,
                                    totalDuration: 0,
                                    completedDuration: 0
                                };
                            }

                            subjectBreakdown[subject].totalSessions++;
                            subjectBreakdown[subject].totalDuration += block.duration || 0;

                            if (block.isCompleted) {
                                subjectBreakdown[subject].completedSessions++;
                                subjectBreakdown[subject].completedDuration += block.duration || 0;
                            }
                        });
                    }
                });
            }
        });

        const completionRate = totalSessions > 0 ? completedSessions / totalSessions : 0;
        const averageRating = ratedSessions > 0 ? totalRating / ratedSessions : 0;

        const statistics = {
            totalSchedules: schedules.length,
            totalSessions,
            completedSessions,
            totalDuration, // in minutes
            completionRate,
            averageRating,
            totalCompletedHours,
            totalPlannedHours,
            subjectBreakdown
        };

        console.log('✅ Calculated statistics:', {
            totalSchedules: statistics.totalSchedules,
            completionRate: Math.round(statistics.completionRate * 100) + '%',
            averageRating: statistics.averageRating.toFixed(1)
        });

        res.status(200).json({
            success: true,
            data: statistics
        });

    } catch (error) {
        console.error('❌ Error fetching schedule statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch schedule statistics',
            error: error.message
        });
    }
};

// Update schedule settings
const updateScheduleSettings = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { settings } = req.body;

        console.log('⚙️ Updating schedule settings for schedule:', scheduleId);

        if (!scheduleId) {
            return res.status(400).json({
                success: false,
                message: 'Schedule ID is required'
            });
        }

        const schedule = await PersonalSchedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        // Update settings
        if (settings) {
            schedule.settings = { ...schedule.settings, ...settings };
        }

        await schedule.save();

        console.log('✅ Schedule settings updated successfully');

        res.status(200).json({
            success: true,
            message: 'Schedule settings updated successfully',
            data: schedule
        });

    } catch (error) {
        console.error('❌ Error updating schedule settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update schedule settings',
            error: error.message
        });
    }
};



export {
    getPersonalizedSchedule,
    getActiveSchedule,
    generateOptimizedSchedule,
    createCustomSchedule,
    completeStudyBlock,
    getScheduleStatistics,
    updateScheduleSettings
};
